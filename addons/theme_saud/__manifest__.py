# -*- coding: utf-8 -*-
{
    "name": " Saud Al-Ghaslan Website Theme",
    'version': '0.1',
    "category": "Theme/Website",
    "summary": " Saud Al-Ghaslan Website Theme",
    "description": " Saud Al-Ghaslan Website Theme",
    "author": "Omar Ahmed Saeed / Ali Muhammed",
    "website": "",
    "license": "LGPL-3",
    "depends": ["website", "web", "crm"],
    "data": [
        # Presets
        "data/presets.xml",

        # Views
        "views/snippets.xml",
        "views/website_social.xml",
        "views/components.xml",

        # Pages
        "data/pages/Home.xml",
        "data/pages/AboutUs.xml",
        "data/pages/Services.xml",
        "data/pages/Auctions.xml",
        "data/pages/ContactUs.xml",
    ],
    'images': [
        'static/description/saudalghaslan_description.webp',
        'static/description/saudalghaslan.webp',
    ],
    "assets": {
        "web.assets_frontend": [
            'theme_saud/static/lib/fontawesome/css/all.min.css',
            # js files
            'theme_saud/static/src/js/scroll_reveal.js',
            '/theme_saud/static/src/js/owl_carousel.js',
            '/theme_saud/static/src/js/counter_up_section.js',
            '/theme_saud/static/src/js/services_toggle.js',
            '/theme_saud/static/src/js/services_form.js',
            '/theme_saud/static/src/js/contactus_form.js',

            '/theme_saud/static/src/scss/snippets.scss',
            '/theme_saud/static/src/scss/components.scss',
            '/theme_saud/static/src/scss/layout.scss',
            # pages style
            'theme_saud/static/src/scss/scroll_reveal.scss',
            '/theme_saud/static/src/scss/home.scss',
            '/theme_saud/static/src/scss/aboutUs.scss',
            '/theme_saud/static/src/scss/services.scss',
            '/theme_saud/static/src/scss/auctions.scss',
            '/theme_saud/static/src/scss/contactus.scss',

        ],
        'website.assets_wysiwyg': [],
        'web._assets_primary_variables': [
            '/theme_saud/static/src/scss/primary_variables.scss',
        ],
    },
}
