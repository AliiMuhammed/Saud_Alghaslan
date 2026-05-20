# -*- coding: utf-8 -*-

import json
import logging
import re

from markupsafe import Markup, escape

from odoo import http
from odoo.http import Response, request

_logger = logging.getLogger(__name__)


class SaudContactUsController(http.Controller):
    """Website Contact Us form endpoint for creating CRM leads."""

    ALLOWED_TOPICS = {
        "المبيعات",
        "إدارة الأملاك",
        "إدارة المرافق",
        "التقيم العقاري",
        "المزادات العقارية",
        "المقاولات",
        "أخري",
    }

    EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

    def _json_response(self, payload, status=200):
        return Response(
            json.dumps(payload, ensure_ascii=False),
            status=status,
            content_type="application/json; charset=utf-8",
        )

    def _clean_text(self, value):
        value = (value or "").strip()
        return re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", value)

    def _build_description(self, *, topic, message):
        rows = [
            ("Concerning", topic),
            ("Message", message),
        ]
        return Markup("\n").join(
            Markup("<p><strong>%s:</strong><br/>%s</p>") % (escape(label), escape(value or ""))
            for label, value in rows
        )

    @http.route(
        "/saud/contactus/lead",
        type="http",
        auth="public",
        website=True,
        methods=["POST"],
        csrf=True,
    )
    def create_contact_lead(self, **post):
        contact_name = self._clean_text(post.get("contact_name"))
        phone = self._clean_text(post.get("contact_phone"))
        email = self._clean_text(post.get("contact_email"))
        topic = self._clean_text(post.get("contact_topic"))
        message = self._clean_text(post.get("contact_message"))

        field_errors = {}
        if not contact_name:
            field_errors["contact_name"] = "الاسم مطلوب"
        if not phone:
            field_errors["contact_phone"] = "الهاتف مطلوب"
        if not email:
            field_errors["contact_email"] = "البريد الإلكتروني مطلوب"
        elif not self.EMAIL_RE.match(email):
            field_errors["contact_email"] = "البريد الإلكتروني غير صحيح"
        if topic not in self.ALLOWED_TOPICS:
            field_errors["contact_topic"] = "يرجى اختيار القسم"

        if field_errors:
            return self._json_response({"success": False, "errors": field_errors}, status=400)

        lead_title = f"Contact Us: {message}" if message else "Contact Us"
        description = self._build_description(
            topic=topic,
            message=message,
        )

        try:
            Lead = request.env["crm.lead"].sudo()
            lead_values = {
                "name": lead_title,
                "contact_name": contact_name,
                "phone": phone,
                "email_from": email,
                "description": description,
                "type": "lead",
            }
            if "website_id" in Lead._fields and request.website:
                lead_values["website_id"] = request.website.id

            Lead.create(lead_values)
        except Exception:
            _logger.exception("Failed to create CRM lead from Saud contact form.")
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
