/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIALIZED_DATA_KEY = "saudOwlCarouselInitialized";
const INITIALIZED_ATTR     = "data-saud-owl-initialized";
const RTL_LANG_RE          = /^(ar|arc|dv|fa|ha|he|khw|ks|ku|ps|ur|yi)(-|_)?/i;
// Four progressively-later refreshes help handle slow images and CSS transitions.
const REFRESH_DELAYS       = [0, 100, 350, 800];

// Monotonically-increasing counter used to create a UNIQUE jQuery event
// namespace for every widget instance.  Without this, destroying or
// reinitialising one carousel would silently remove the window-event handlers
// that belong to every other carousel on the same page.
let _uidCounter = 0;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function parseBool(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "boolean") return value;
    return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function parseInteger(value, fallback) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? fallback : n;
}

/**
 * Determine the text-direction that governs `el`.
 *
 * Priority order:
 *   1. Nearest ancestor (including <html>) that has an explicit [dir] attribute.
 *   2. Computed CSS `direction` property of `el`.
 *   3. Heuristic based on the <html lang="…"> value.
 *
 * Using all three sources makes detection robust for Odoo's built-in Arabic /
 * English language switch and any per-section dir overrides.
 */
function detectDirection(el) {
    // closest() traverses all the way up to <html>, so it finds dir="rtl" on
    // the root element when the whole page is Arabic.
    const dirNode = el.closest("[dir]");
    if (dirNode) {
        const d = (dirNode.getAttribute("dir") || "").trim().toLowerCase();
        if (d === "rtl" || d === "ltr") return d;
    }
    // Fall back to computed style (handles CSS-only direction changes).
    const computed = window.getComputedStyle(el).direction;
    if (computed === "rtl" || computed === "ltr") return computed;
    // Last resort: infer from the page language code.
    const lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    return RTL_LANG_RE.test(lang) ? "rtl" : "ltr";
}

// ─── Public widget ────────────────────────────────────────────────────────────

publicWidget.registry.SaudCarousel = publicWidget.Widget.extend({
    selector: ".s_saud_carousel",

    /**
     * Keep the carousel initialised in Website Builder.
     *
     * Owl Carousel's base CSS keeps `.owl-carousel` hidden until Owl adds
     * `.owl-loaded`. If the public widget is disabled in editable mode, the
     * editor can show an empty block because Owl never adds that class.
     * Instead, initialise the carousel and disable autoplay/dragging while
     * editing through `_getOptions()`.
     */

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    start() {
        // Unique ID & jQuery event namespace for THIS instance only.
        this._carouselUID = `saudOwl_${++_uidCounter}`;
        // Used as a jQuery event namespace (no dots in the string itself;
        // the dot is added at the call site: `.${this._winNS}`).
        this._winNS = `saudOwlCarousel_${this._carouselUID}`;

        const result = this._super.apply(this, arguments);

        // Defer the first init by one animation frame so the browser has
        // finished layout and Owl can read the carousel's real pixel width.
        // Without this, Owl may calculate 0-width items when the element is
        // still in the render pipeline (e.g., inside a lazy-loaded section).
        requestAnimationFrame(() => this._initCarousel());

        return result;
    },

    destroy() {
        // Remove ONLY this instance's window listeners (own namespace).
        // Other carousel instances on the same page are unaffected.
        $(window).off(`.${this._winNS}`);

        // Clean up image-load listeners for this carousel.
        this.$("img").off(`.${this._winNS}`);

        // Ask Owl to tear itself down cleanly.
        if (this._isOwlAvailable() && this._isInitialized()) {
            this.$el.trigger("destroy.owl.carousel");
        }

        // Remove our own initialisation markers.
        this.$el.removeData(INITIALIZED_DATA_KEY);
        if (this.el) {
            this.el.removeAttribute(INITIALIZED_ATTR);
        }

        return this._super.apply(this, arguments);
    },

    // ── Private helpers ────────────────────────────────────────────────────────

    _isOwlAvailable() {
        return typeof $.fn.owlCarousel === "function";
    },

    _isInitialized() {
        return Boolean(
            this.el &&
            (this.$el.hasClass("owl-loaded") ||
             this.$el.data("owl.carousel") ||
             this.$el.data(INITIALIZED_DATA_KEY))
        );
    },

    _getDirection() {
        return detectDirection(this.el);
    },

    _isEditableMode() {
        return Boolean(
            this.editableMode ||
            document.body.classList.contains("editor_enable") ||
            document.body.classList.contains("o_is_editing") ||
            document.documentElement.classList.contains("editor_enable")
        );
    },

    /**
     * Build the Owl Carousel options object from HTML data-* attributes.
     *
     * All data-* attributes are read from the element's dataset (browsers
     * auto-convert kebab-case → camelCase: data-items-lg → dataset.itemsLg).
     * Unknown / missing attributes fall back to sensible defaults.
     */
    _getOptions() {
        const ds = this.el.dataset;

        // Count only real slides – exclude Owl's own cloned items.
        const realCount   = this.$el.children().not(".cloned").length;
        const hasMultiple = realCount > 1;

        // Responsive item counts (each level inherits from the smaller one).
        const items   = parseInteger(ds.items,   1);
        const itemsSm = parseInteger(ds.itemsSm, items);
        const itemsMd = parseInteger(ds.itemsMd, itemsSm);
        const itemsLg = parseInteger(ds.itemsLg, itemsMd);
        const itemsXl = parseInteger(ds.itemsXl, itemsLg);

        const loop       = parseBool(ds.loop,       hasMultiple);
        const nav        = parseBool(ds.nav,        false);
        const dots       = parseBool(ds.dots,       true);
        const autoplay   = parseBool(ds.autoplay,   hasMultiple);
        const autoHeight = parseBool(ds.autoHeight, false);
        const isEditable = this._isEditableMode();

        return {
            // RTL is derived from the page / section direction at runtime,
            // so Arabic pages automatically get rtl:true without any extra markup.
            rtl: this._getDirection() === "rtl",

            loop:               !isEditable && hasMultiple && loop,
            // rewind gives a gentle "snap back" on single-loop carousels.
            rewind:             isEditable || !(hasMultiple && loop),

            margin:             parseInteger(ds.margin, 0),
            nav:                hasMultiple && nav,
            dots:               hasMultiple && dots,

            autoplay:           !isEditable && hasMultiple && autoplay,
            autoplayTimeout:    parseInteger(ds.autoplayTimeout, 6000),
            autoplayHoverPause: true,

            // Keep disabled by default. In this theme it can collapse the
            // testimonial stage to 0px when Owl refreshes before lazy images /
            // reveal animations finish. Enable per carousel only with
            // data-auto-height="true" if it is really needed.
            autoHeight:         autoHeight,

            smartSpeed:         parseInteger(ds.smartSpeed, 650),

            // Disable dragging for single-item carousels (nothing to drag to).
            mouseDrag:          !isEditable && hasMultiple,
            touchDrag:          !isEditable && hasMultiple,
            pullDrag:           !isEditable && hasMultiple,

            responsiveRefreshRate: 150,

            responsive: {
                0:    { items: items   },
                576:  { items: itemsSm },
                768:  { items: itemsMd },
                992:  { items: itemsLg },
                1200: { items: itemsXl },
            },
        };
    },

    _initCarousel() {
        // Guard: element may have been removed from the DOM since the rAF.
        if (!this.el || !this.el.isConnected) return;
        if (!this.el.children.length)         return;

        if (!this._isOwlAvailable()) {
            console.warn(
                "[theme_saud] Owl Carousel library is not loaded.\n" +
                "Make sure owl.carousel.min.js is listed in web.assets_frontend " +
                "BEFORE owl_carousel.js in __manifest__.py."
            );
            return;
        }

        // If already initialised (e.g., after a Odoo page hot-reload), just
        // recalculate widths rather than trying to double-initialise.
        if (this._isInitialized()) {
            this._scheduleRefreshes();
            return;
        }

        // ── Initialise Owl ──
        this.$el.owlCarousel(this._getOptions());
        this.$el.data(INITIALIZED_DATA_KEY, true);
        this.el.setAttribute(INITIALIZED_ATTR, "true");

        // Schedule width recalculations to handle lazy-loaded images and CSS
        // transitions that finish after Owl's first paint.
        this._bindImageRefresh();
        this._bindWindowRefresh();
        this._scheduleRefreshes();
    },

    /**
     * Re-trigger a refresh whenever an image inside this carousel loads or
     * errors out, because image dimensions affect the item / stage height.
     */
    _bindImageRefresh() {
        const ns = `.${this._winNS}`;
        this.$("img")
            .off(ns)
            .on(`load${ns} error${ns}`, () => this._scheduleRefreshes());
    },

    /**
     * Re-trigger a refresh on window load (all resources ready) and resize.
     *
     * CRITICAL: uses an instance-specific jQuery namespace (this._winNS) so
     * that calling .off() only removes the handlers of THIS widget instance.
     * A shared namespace like ".saudOwlCarousel" would cause every new carousel
     * initialisation to strip the handlers of every previously initialised one.
     */
    _bindWindowRefresh() {
        const ns = `.${this._winNS}`;
        $(window)
            .off(ns)
            .on(`load${ns} resize${ns}`, () => this._scheduleRefreshes());
    },

    /**
     * Schedule several deferred refreshes.
     *
     * Multiple delays (0 → 100 → 350 → 800 ms) are used because:
     * - 0 ms lets the current call stack unwind first.
     * - Later delays catch CSS transitions and lazy images that settle
     *   after the first refresh.
     */
    _scheduleRefreshes() {
        REFRESH_DELAYS.forEach(delay =>
            setTimeout(() => this._safeRefresh(), delay)
        );
    },

    /**
     * Safely tell Owl to recalculate its layout.
     * Guards are repeated here because this runs inside a timeout/rAF and the
     * widget may have been destroyed in the meantime.
     */
    _safeRefresh() {
        if (!this.el || !this.el.isConnected) return;
        if (!this._isOwlAvailable())          return;

        const carousel = this.$el.data("owl.carousel");
        if (!carousel) return;

        requestAnimationFrame(() => {
            // invalidate("width") forces Owl to re-measure all items on the
            // next refresh cycle, fixing incorrect widths after a window resize.
            carousel.invalidate("width");
            this.$el.trigger("refresh.owl.carousel");
        });
    },
});
