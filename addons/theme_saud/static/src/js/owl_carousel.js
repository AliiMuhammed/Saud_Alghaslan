/** @odoo-module **/

/**
 * Global Saud OwlCarousel Widget
 * ===============================
 */
import {localization} from "@web/core/l10n/localization";
import publicWidget from "@web/legacy/js/public/public_widget";


const SaudCarousel = publicWidget.Widget.extend({
    selector: ".s_saud_carousel",
    disabledInEditableMode: false,
    /**
     * @override
     */
    start: function () {
        const def = this._super.apply(this, arguments);
        const $carousel = this.$el;

        if (!$carousel.length || typeof $carousel.owlCarousel !== "function" || $carousel.hasClass("owl-loaded")) {
            return def;
        }

        const hasMultipleSlides = $carousel.children().length > 1;

        // ?? Read data-* configuration ????????????????????????????????
        const d = this.el.dataset;
        const _bool = (val, fallback) => {
            if (val === undefined || val === null || val === "") return fallback;
            return val === "true";
        };
        const _int = (val, fallback) => {
            const n = parseInt(val, 10);
            return isNaN(n) ? fallback : n;
        };

        const items = _int(d.items, 1);
        const itemsSm = _int(d.itemsSm, items);
        const itemsMd = _int(d.itemsMd, itemsSm);
        const itemsLg = _int(d.itemsLg, itemsMd);
        const itemsXl = _int(d.itemsXl, itemsLg);

        const loop = _bool(d.loop, hasMultipleSlides);
        const nav = _bool(d.nav, false);
        const dots = _bool(d.dots, true);
        const autoplay = _bool(d.autoplay, hasMultipleSlides);
        const rtl = localization.direction === 'rtl';
        const margin = _int(d.margin, 0);
        const autoplayTimeout = _int(d.autoplayTimeout, 6000);
        const smartSpeed = _int(d.smartSpeed, 650);
        // ?? Initialise OwlCarousel ???????????????????????????????????
        $carousel.owlCarousel({
            rtl: rtl,
            loop: loop,
            rewind: !loop,
            margin: margin,
            nav: nav,
            dots: dots && hasMultipleSlides,
            autoplay: autoplay,
            autoplayTimeout: autoplayTimeout,
            autoplayHoverPause: true,
            smartSpeed: smartSpeed,
            mouseDrag: hasMultipleSlides,
            touchDrag: hasMultipleSlides,
            pullDrag: hasMultipleSlides,
            responsiveRefreshRate: 100,
            responsive: {
                0: {items: items},
                576: {items: itemsSm},
                768: {items: itemsMd},
                992: {items: itemsLg},
                1200: {items: itemsXl},
            },
        });

        return def;
    },

    /**
     * @override
     */
    destroy: function () {
        if (this.$el.hasClass("owl-loaded")) {
            this.$el.trigger("destroy.owl.carousel");
        }
        return this._super.apply(this, arguments);
    },
});

publicWidget.registry.SaudCarousel = SaudCarousel;

export default SaudCarousel;
