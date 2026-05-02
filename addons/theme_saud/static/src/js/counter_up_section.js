/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

const SaudCounterUpSection = publicWidget.Widget.extend({
    selector: ".s_saud_counter",
    disabledInEditableMode: false,

    /**
     * @override
     */
    start: function () {
        const def = this._super.apply(this, arguments);
        this._animated = false;
        this._counterEls = this.el.querySelectorAll(".s_saud_counter__number[data-target]");

        if (!this._counterEls.length) {
            return def;
        }

        // Respect reduced-motion preference: show final values immediately
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this._showFinalValues();
            return def;
        }

        this._initObserver();
        return def;
    },

    /**
     * @override
     */
    destroy: function () {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        return this._super.apply(this, arguments);
    },

    // ── Private ─────────────────────────────────────────────────────────────

    /**
     * Set up IntersectionObserver to trigger animation when section is visible.
     */
    _initObserver: function () {
        if (!("IntersectionObserver" in window)) {
            // Fallback: show final values if IntersectionObserver is unavailable
            this._showFinalValues();
            return;
        }

        this._observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this._animated) {
                        this._animated = true;
                        this._animateAll();
                        this._observer.disconnect();
                    }
                });
            },
            { threshold: 0.25 }
        );

        this._observer.observe(this.el);
    },

    /**
     * Animate all counter elements.
     */
    _animateAll: function () {
        this._counterEls.forEach((el) => this._animateCounter(el));
    },

    /**
     * Animate a single counter from 0 to its target value.
     * @param {HTMLElement} el
     */
    _animateCounter: function (el) {
        const target = parseInt(el.dataset.target, 10) || 0;
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const useComma = el.dataset.useComma === "true";
        const duration = 2000; // ms
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) {
                startTime = timestamp;
            }
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out quad for smooth deceleration
            const eased = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(eased * target);

            el.textContent = this._formatNumber(current, prefix, suffix, useComma);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Ensure final value is exact
                el.textContent = this._formatNumber(target, prefix, suffix, useComma);
            }
        };

        requestAnimationFrame(step);
    },

    /**
     * Format a number with optional prefix, suffix, and comma separators.
     * @param {number} value
     * @param {string} prefix
     * @param {string} suffix
     * @param {boolean} useComma
     * @returns {string}
     */
    _formatNumber: function (value, prefix, suffix, useComma) {
        let formatted = useComma ? value.toLocaleString("en-US") : String(value);
        return prefix + formatted + suffix;
    },

    /**
     * Show all final values without animation (for reduced-motion / fallback).
     */
    _showFinalValues: function () {
        this._counterEls.forEach((el) => {
            const target = parseInt(el.dataset.target, 10) || 0;
            const prefix = el.dataset.prefix || "";
            const suffix = el.dataset.suffix || "";
            const useComma = el.dataset.useComma === "true";
            el.textContent = this._formatNumber(target, prefix, suffix, useComma);
        });
    },
});

publicWidget.registry.SaudCounterUpSection = SaudCounterUpSection;

export default SaudCounterUpSection;
