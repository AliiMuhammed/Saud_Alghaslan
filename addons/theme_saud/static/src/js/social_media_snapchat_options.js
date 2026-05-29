/** @odoo-module **/

import SocialMediaOption from "@website/snippets/s_social_media/options";
import { patch } from "@web/core/utils/patch";

patch(SocialMediaOption.SocialMedia.prototype, {
    async _fetchSocialMedia() {
        await super._fetchSocialMedia(...arguments);

        const dbSocialValues = SocialMediaOption.getDbSocialValuesCache();
        if (
            !dbSocialValues
            || Object.prototype.hasOwnProperty.call(dbSocialValues, "social_snapchat")
        ) {
            return;
        }

        let websiteId;
        this.trigger_up("context_get", {
            callback(ctx) {
                websiteId = ctx.website_id;
            },
        });

        const [values] = await this.orm.read("website", [websiteId], ["social_snapchat"]);
        dbSocialValues.social_snapchat = values.social_snapchat;
    },
});
