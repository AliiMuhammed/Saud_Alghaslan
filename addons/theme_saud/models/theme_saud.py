import base64

from odoo import api, models, tools


class ThemeSaud(models.AbstractModel):
    _inherit = 'theme.utils'

    @api.model
    def _theme_saud_post_copy(self, mod):
        """Called automatically after the theme is installed/copied."""
        self._theme_saud_set_website_logo()
        # Enable social links in header by default
        self.enable_view('website.header_social_links')

    @api.model
    def _theme_saud_set_website_logo(self):
        websites = self.env['website'].sudo().search([('theme_id.name', '=', 'theme_saud')])
        if not websites:
            websites = self.env.ref('website.default_website').sudo()

        with tools.file_open('theme_saud/static/src/img/Saud_Logo.svg', 'rb') as logo_file:
            logo = base64.b64encode(logo_file.read())

        websites.write({'logo': logo})