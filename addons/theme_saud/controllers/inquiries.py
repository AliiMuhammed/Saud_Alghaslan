# -*- coding: utf-8 -*-

import json
import logging
import re

from markupsafe import escape

from odoo import http
from odoo.http import Response, request

_logger = logging.getLogger(__name__)


class SaudInquiriesController(http.Controller):
    """Website Inquiries form endpoint for creating CRM leads."""

    def _json_response(self, payload, status=200):
        return Response(
            json.dumps(payload, ensure_ascii=False),
            status=status,
            content_type="application/json; charset=utf-8",
        )

    def _clean_text(self, value):
        value = (value or "").strip()
        return re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", value)

    @http.route(
        "/saud/inquiries/lead",
        type="http",
        auth="public",
        website=True,
        methods=["POST"],
        csrf=True,
    )
    def create_inquiries_lead(self, **post):
        contact_name = self._clean_text(post.get("inquiry_name"))
        phone = self._clean_text(post.get("inquiry_phone"))
        message = self._clean_text(post.get("inquiry_message"))

        field_errors = {}
        if not contact_name:
            field_errors["inquiry_name"] = "الاسم مطلوب"
        if not phone:
            field_errors["inquiry_phone"] = "الهاتف مطلوب"
        if not message:
            field_errors["inquiry_message"] = "الرسالة مطلوبة"

        if field_errors:
            return self._json_response({"success": False, "errors": field_errors}, status=400)

        lead_title = f"Inquiries: {message}" if message else "Inquiries"

        try:
            Lead = request.env["crm.lead"].sudo()
            lead_values = {
                "name": lead_title,
                "contact_name": contact_name,
                "phone": phone,
                "description": str(escape(message)),
                "type": "lead",
            }
            if "website_id" in Lead._fields and request.website:
                lead_values["website_id"] = request.website.id

            Lead.create(lead_values)
        except Exception:
            _logger.exception("Failed to create CRM lead from Saud inquiries form.")
            return self._json_response(
                {
                    "success": False,
                    "message": "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.",
                },
                status=500,
            )

        return self._json_response(
            {
                "success": True,
                "message": "تم إرسال رسالتك بنجاح، وسنتواصل معك قريبًا.",
            }
        )
