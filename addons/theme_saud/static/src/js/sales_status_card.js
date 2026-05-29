/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.SaudSalesStatusCard = publicWidget.Widget.extend({
    selector: ".s_saud_sales_status_card",

    /** @override */
    start() {
        this._onResize = this._onResize.bind(this);
        window.addEventListener("resize", this._onResize);
        // Defer to next frame so layout has settled before we measure.
        requestAnimationFrame(() => this._updateLabels());
        return this._super(...arguments);
    },

    /** @override */
    destroy() {
        window.removeEventListener("resize", this._onResize);
        this._super(...arguments);
    },

    _onResize() {
        if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
        this._resizeRaf = requestAnimationFrame(() => this._updateLabels());
    },

    _updateLabels() {
        this.el.querySelectorAll(".sales-progress-item").forEach(itemEl => {
            const progressEl = itemEl.querySelector(".sales-progress");
            const barEl = itemEl.querySelector(".sales-bar, .progress-bar");
            const percentEl = itemEl.querySelector(".sales-progress-percent");
            if (!progressEl || !barEl || !percentEl) return;

            const barWidthPx = barEl.getBoundingClientRect().width;
            const labelWidthPx = percentEl.scrollWidth;
            const fits = barWidthPx >= labelWidthPx;

            itemEl.classList.toggle("is-label-overflow", !fits);
        });
    },
});

export default publicWidget.registry.SaudSalesStatusCard;