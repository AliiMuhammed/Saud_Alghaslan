/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

const PROGRESS_ITEM_SELECTOR = ".sales-progress-item";

//------------------------------------------------------------------------------
// Pure helpers — all math lives here, in one place.
//------------------------------------------------------------------------------

function toNonNegativeNumber(value) {
    const n = Number.parseFloat(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
}

function roundTo2Decimals(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function computePercentage(current, total) {
    if (total <= 0) return 0;
    const pct = (current / total) * 100;
    if (pct < 0) return 0;
    if (pct > 100) return 100;
    return pct;
}

function formatPercent(value) {
    return `${parseFloat(roundTo2Decimals(value).toFixed(2))}%`;
}

/**
 * Decide whether the percent label fits inside the bar at its target width.
 * Compares the target bar width (track × percentage) against the label's
 * natural scrollWidth. Independent of the CSS width transition.
 */
function labelFitsInBar(progressEl, percentEl, percentage) {
    if (!progressEl || !percentEl) return true;
    const trackWidthPx = progressEl.getBoundingClientRect().width;
    if (trackWidthPx <= 0) return true; // not laid out yet
    const targetBarPx = (percentage / 100) * trackWidthPx;
    const labelPx = percentEl.scrollWidth;
    return targetBarPx >= labelPx;
}

function syncProgressItem(itemEl) {
    const current = toNonNegativeNumber(itemEl.dataset.current);
    const total = toNonNegativeNumber(itemEl.dataset.total);
    const label = itemEl.dataset.label || "";

    itemEl.dataset.current = String(current);
    itemEl.dataset.total = String(total);

    const percentage = computePercentage(current, total);
    const percentageText = formatPercent(percentage);

    itemEl.classList.toggle("is-empty", percentage <= 0);

    const titleEl = itemEl.querySelector(".sales-progress-title");
    if (titleEl) titleEl.textContent = `${label} ${current} من ${total}`;

    const progressEl = itemEl.querySelector(".sales-progress");
    if (progressEl) progressEl.setAttribute("aria-valuenow", String(roundTo2Decimals(percentage)));

    const barEl = itemEl.querySelector(".sales-bar, .progress-bar");
    if (barEl) barEl.style.width = percentageText;

    const percentEl = itemEl.querySelector(".sales-progress-percent");
    if (percentEl) percentEl.textContent = percentageText;

    // Hide the percent label when the bar is too narrow to contain it.
    if (percentEl) {
        const fits = labelFitsInBar(progressEl, percentEl, percentage);
        itemEl.classList.toggle("is-label-overflow", !fits);
    }

    // Legacy cleanup: strip any s_progress_bar_text Odoo may have injected.
    if (barEl) {
        barEl.querySelectorAll(":scope > .s_progress_bar_text").forEach(el => el.remove());
    }
}

//------------------------------------------------------------------------------
// Snippet option widget
//------------------------------------------------------------------------------

options.registry.SaudSalesStatusCard = options.Class.extend({

    onBuilt()            { this._migrateLegacyMarkup(); this._syncAll(); },
    onFocus()            { this._migrateLegacyMarkup(); this._syncAll(); },
    async cleanForSave() { this._migrateLegacyMarkup(); this._syncAll(); },

    availableCurrent(p, v) { this._setItemValue("available", "current", v); },
    availableTotal(p, v)   { this._setItemValue("available", "total",   v); },
    reservedCurrent(p, v)  { this._setItemValue("reserved",  "current", v); },
    reservedTotal(p, v)    { this._setItemValue("reserved",  "total",   v); },
    soldCurrent(p, v)      { this._setItemValue("sold",      "current", v); },
    soldTotal(p, v)        { this._setItemValue("sold",      "total",   v); },

    _computeWidgetState(methodName) {
        const map = {
            availableCurrent: ["available", "current"],
            availableTotal:   ["available", "total"],
            reservedCurrent:  ["reserved",  "current"],
            reservedTotal:    ["reserved",  "total"],
            soldCurrent:      ["sold",      "current"],
            soldTotal:        ["sold",      "total"],
        };
        const entry = map[methodName];
        if (entry) return this._getItemValue(entry[0], entry[1]);
        return this._super(...arguments);
    },

    _getItem(statusKey) {
        return this.$target[0].querySelector(
            `${PROGRESS_ITEM_SELECTOR}[data-status-key="${statusKey}"]`
        );
    },
    _setItemValue(statusKey, field, value) {
        const itemEl = this._getItem(statusKey);
        if (!itemEl) return;
        itemEl.dataset[field] = String(toNonNegativeNumber(value));
        syncProgressItem(itemEl);
    },
    _getItemValue(statusKey, field) {
        const itemEl = this._getItem(statusKey);
        if (!itemEl) return "0";
        return String(toNonNegativeNumber(itemEl.dataset[field]));
    },
    _syncAll() {
        this.$target[0].querySelectorAll(PROGRESS_ITEM_SELECTOR).forEach(syncProgressItem);
    },

    /**
     * Convert old markup (saved before the class rename) to the new one:
     *   .progress       -> drop (we keep .sales-progress)
     *   .progress-bar   -> .sales-bar
     * Also strips any s_progress_bar_text spans Odoo may have injected.
     */
    _migrateLegacyMarkup() {
        const root = this.$target[0];
        root.querySelectorAll(".progress.sales-progress").forEach(el => el.classList.remove("progress"));
        root.querySelectorAll(".progress-bar").forEach(el => {
            el.classList.remove("progress-bar");
            el.classList.add("sales-bar");
        });
        root.querySelectorAll(".s_progress_bar_text").forEach(el => el.remove());
    },
});

export default options.registry.SaudSalesStatusCard;