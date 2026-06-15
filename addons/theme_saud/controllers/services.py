# -*- coding: utf-8 -*-

import json
import logging

from odoo import http
from odoo.http import Response, request

_logger = logging.getLogger(__name__)


class SaudServicesController(http.Controller):
    """Expose the website services as JSON.

    The Home and Services pages render the services server-side via
    ``request.env['saud.service']`` directly inside QWeb. This endpoint mirrors
    that data as JSON so it can also be consumed from JavaScript if needed in
    the future.
    """

    def _get_services_data(self):
        """Return the active services as a list of plain dicts.

        Each dict carries the service content plus a ``benefits`` list and an
        ``image_url`` built from Odoo's standard binary field URL pattern.
        """
        services = request.env['saud.service'].sudo().search(
            [('active', '=', True)],
            order='sequence, id',
        )
        return [
            {
                'id': service.id,
                'main_title': service.main_title or '',
                'main_description': service.main_description or '',
                'image_position': service.image_position or 'right',
                'image_url': '/web/image/saud.service/%d/image' % service.id,
                'benefits': [
                    {
                        'icon': benefit.benefit_icon or '',
                        'title': benefit.benefit_title or '',
                        'subtitle': benefit.benefit_subtitle or '',
                    }
                    for benefit in service.benefit_ids
                ],
            }
            for service in services
        ]

    @http.route(
        '/saud/services/all',
        type='http',
        auth='public',
        website=True,
        methods=['GET'],
    )
    def services_all(self, **kwargs):
        return Response(
            json.dumps(self._get_services_data(), ensure_ascii=False),
            status=200,
            content_type="application/json; charset=utf-8",
        )
