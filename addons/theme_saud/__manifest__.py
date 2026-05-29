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
    "depends": [
        "website",
        "web",
        "crm",
        "hr_recruitment",
        "website_hr_recruitment",
    ],
    "installable": True,
    "data": [
        # Presets
        "data/presets.xml",

        # Snippets
        "static/src/snippets/s_saud_cta_banner/000.xml",
        "static/src/snippets/s_sales_status_card/000.xml",
        "static/src/snippets/s_sales_status_card/options.xml",

        # Views
        "views/snippets.xml",
        "views/footer_templates.xml",
        "views/website_social.xml",
        "views/components.xml",
        "views/hr_job_views.xml",
        "views/jobs_index_templates.xml",
        "views/job_detail_templates.xml",

        # Pages
        "data/pages/Home.xml",
        "data/pages/AboutUs.xml",
        "data/pages/Services.xml",
        "data/pages/Auctions.xml",
        "data/pages/ContactUs.xml",
        "data/pages/Ruba.xml",
    ],
    'images': [
        'static/description/saudalghaslan_description.webp',
        'static/description/saudalghaslan.webp',
    ],
    "assets": {
        "web.assets_frontend": [
            # ── Theme JS ──────────────────────────────────────────────────
            'theme_saud/static/src/js/scroll_reveal.js',
            'theme_saud/static/src/js/owl_carousel.js',
            'theme_saud/static/src/js/counter_up_section.js',
            'theme_saud/static/src/js/services_toggle.js',
            'theme_saud/static/src/js/services_form.js',
            'theme_saud/static/src/js/contactus_form.js',
            'theme_saud/static/src/js/ruba_booking_form.js',
            'theme_saud/static/src/js/zoomable_image.js',
            'theme_saud/static/src/js/sales_status_card.js',

            # ── Vendor CSS ───────────────────────────────────────────────
            'theme_saud/static/lib/fontawesome/css/all.min.css',
            'theme_saud/static/src/css/owl.carousel.min.css',
            'theme_saud/static/src/css/owl.theme.default.min.css',

            # ── Vendor JS ────────────────────────────────────────────────
            'theme_saud/static/lib/OwlCarousel/dist/owl.carousel.min.js',

            # ── Theme SCSS ───────────────────────────────────────────────
            'theme_saud/static/src/scss/snippets.scss',
            'theme_saud/static/src/scss/components.scss',
            'theme_saud/static/src/scss/layout.scss',
            # Page-level styles
            'theme_saud/static/src/scss/scroll_reveal.scss',
            'theme_saud/static/src/scss/home.scss',
            'theme_saud/static/src/scss/aboutUs.scss',
            'theme_saud/static/src/scss/services.scss',
            'theme_saud/static/src/scss/auctions.scss',
            'theme_saud/static/src/scss/contactus.scss',
            'theme_saud/static/src/scss/ruba.scss',
            'theme_saud/static/src/scss/jobs.scss',
        ],

        'website.assets_wysiwyg': [
            'theme_saud/static/src/js/zoomable_image.js',
            'theme_saud/static/src/snippets/s_sales_status_card/options.js',
            'theme_saud/static/src/js/social_media_snapchat_options.js',
        ],
        'web._assets_primary_variables': [
            'theme_saud/static/src/scss/primary_variables.scss',
        ],
    },
}
