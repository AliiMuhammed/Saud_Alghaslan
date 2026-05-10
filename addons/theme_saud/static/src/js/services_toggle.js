/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

function isCurrentMenuUrl(menuUrl) {
    if (!menuUrl) {
        return false;
    }

    const currentUrl = new URL(window.location.href);
    const parsedMenuUrl = new URL(menuUrl, window.location.origin);

    if (parsedMenuUrl.pathname !== currentUrl.pathname) {
        return false;
    }

    for (const [key, value] of parsedMenuUrl.searchParams.entries()) {
        if (!currentUrl.searchParams.getAll(key).includes(value)) {
            return false;
        }
    }

    return true;
}

publicWidget.registry.SgrecoDropdownNav = publicWidget.Widget.extend({
    selector: ".s_sgreco_navbar .s_sgreco_nav_item.dropdown",
    disabledInEditableMode: true,

    async start() {
        await this._super(...arguments);
        const toggle = this.el.querySelector(':scope > a[data-bs-toggle="dropdown"]');
        if (!toggle) return;

        // Remove Bootstrap toggle so click navigates
        toggle.removeAttribute("data-bs-toggle");

        // Restore the real menu URL
        const span = toggle.querySelector('span[data-oe-id][data-oe-model="website.menu"]');
        if (span) {
            const menuId = parseInt(span.dataset.oeId);
            try {
                const result = await rpc("/web/dataset/call_kw/website.menu/read", {
                    model: "website.menu",
                    method: "read",
                    args: [[menuId], ["url"]],
                    kwargs: {},
                });
                if (result && result[0] && result[0].url) {
                    toggle.setAttribute("href", result[0].url);
                    toggle.classList.toggle("active", isCurrentMenuUrl(result[0].url));
                }
            } catch {
                // Silently fallback
            }
        }
    },
});
