# -*- coding: utf-8 -*-

from odoo import fields, models
from odoo.tools.translate import html_translate


class HrJob(models.Model):
    """Extend hr.job with extra website content used by the Saud theme.

    Reused standard fields:
      * name                -> Job title
      * description         -> Standard HTML description (untouched)
      * contract_type_id    -> Shown under the title on the card
      * website_published   -> Standard publish flag

    This Odoo 18 checkout does not provide a standard image field on hr.job,
    so the theme stores its own website image in saud_card_image.
    """
    _inherit = 'hr.job'

    def _search_get_detail(self, website, order, options):
        """Keep the custom public jobs page limited to published jobs."""
        search_detail = super()._search_get_detail(website, order, options)
        search_detail['base_domain'].append([('website_published', '=', True)])
        return search_detail

    # ---------------------------------------------------------------------
    # Card image used by the public listing card and detail hero.
    # ---------------------------------------------------------------------
    saud_card_image = fields.Image(
        string="Website Job Image",
        max_width=1920,
        max_height=1920,
        help="Image used on the public jobs listing card and on the single "
             "job detail page.",
    )

    # ---------------------------------------------------------------------
    # Card / hover content
    # ---------------------------------------------------------------------
    saud_card_short_description = fields.Text(
        string="Card Short Description",
        translate=True,
        help="Short text shown on the job card hover overlay.",
    )

    # ---------------------------------------------------------------------
    # Detail page content sections
    # ---------------------------------------------------------------------
    saud_job_duties = fields.Html(
        string="Job Duties",
        translate=html_translate,
        sanitize=True,
        sanitize_attributes=False,
        help="Bullet list of job duties (المهام الوظيفية).",
    )
    saud_qualifications_intro = fields.Char(
        string="Academic Qualifications Intro",
        translate=True,
        help="E.g. 'Minimum requirements: Bachelor's degree in one of the following fields:'",
    )
    saud_qualifications_fields = fields.Html(
        string="Academic Qualification Fields",
        translate=html_translate,
        sanitize=True,
        sanitize_attributes=False,
        help="Bullet list of accepted fields of study.",
    )
    saud_experiences = fields.Html(
        string="Experiences",
        translate=html_translate,
        sanitize=True,
        sanitize_attributes=False,
        help="Bullet list of required experiences (الخبرات).",
    )
    saud_key_skills = fields.Html(
        string="Key Skills",
        translate=html_translate,
        sanitize=True,
        sanitize_attributes=False,
        help="Bullet list of key skills (المهارات الرئيسية).",
    )

    # ---------------------------------------------------------------------
    # Application process timeline
    # ---------------------------------------------------------------------
    saud_application_deadline = fields.Date(string="Application Deadline")

    saud_screening_start = fields.Date(string="Applicant Screening Start")
    saud_screening_end = fields.Date(string="Applicant Screening End")

    saud_contact_start = fields.Date(string="Contacting Applicants Start")
    saud_contact_end = fields.Date(string="Contacting Applicants End")

    saud_interviews_start = fields.Date(string="Interviews Start")
    saud_interviews_end = fields.Date(string="Interviews End")

    saud_results_date = fields.Date(string="Final Results Announcement")
