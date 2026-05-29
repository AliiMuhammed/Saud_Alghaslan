# -*- coding: utf-8 -*-

import logging

from werkzeug.exceptions import NotFound

from odoo import http
from odoo.http import request
from odoo.tools import format_date as odoo_format_date
from odoo.addons.website_hr_recruitment.controllers.main import WebsiteHrRecruitment

_logger = logging.getLogger(__name__)


class SaudWebsiteHrRecruitment(WebsiteHrRecruitment):
    """Override standard recruitment website routes to render Saud-theme
    templates while keeping the application/apply flow untouched.

    We do NOT override /jobs/apply/... so the apply submission flow is
    preserved unchanged.
    """

    @http.route(
        [
            '/jobs',
            '/jobs/page/<int:page>',
        ],
        type='http',
        auth='public',
        website=True,
        sitemap=WebsiteHrRecruitment.sitemap_jobs,
    )
    def jobs(self, country_id=None, department_id=None, office_id=None, contract_type_id=None,
             is_remote=False, is_other_department=False, is_untyped=None, page=1, search=None, **kwargs):
        """Reuse Odoo's standard recruitment search/publish logic and render it
        through the Saud card layout.
        """
        response = super().jobs(
            country_id=country_id,
            department_id=department_id,
            office_id=office_id,
            contract_type_id=contract_type_id,
            is_remote=is_remote,
            is_other_department=is_other_department,
            is_untyped=is_untyped,
            page=page,
            search=search,
            **kwargs,
        )
        qcontext = getattr(response, 'qcontext', None)
        if qcontext is None:
            return response

        values = dict(qcontext)
        _logger.debug("Saud: rendering /jobs with %s jobs", len(values.get('jobs', [])))
        return request.render(
            'theme_saud.jobs_index',
            values,
        )

    @http.route(
        ['/jobs/<model("hr.job"):job>'],
        type='http',
        auth='public',
        website=True,
        sitemap=True,
    )
    def job(self, job, **kwargs):
        if not job.with_context(website_id=request.website.id).website_published:
            raise NotFound()

        def saud_format_date(value):
            return odoo_format_date(request.env, value) if value else ''

        _logger.info("Saud: rendering /jobs/%s with custom template", job.id)
        return request.render(
            'theme_saud.job_detail',
            {
                'job': job,
                'main_object': job,
                'saud_format_date': saud_format_date,
            },
        )
