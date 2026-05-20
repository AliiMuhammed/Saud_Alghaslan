# -*- coding: utf-8 -*-

import json
import logging
import re

from markupsafe import Markup, escape

from odoo import http
from odoo.http import Response, request

_logger = logging.getLogger(__name__)


class SaudRubaController(http.Controller):
    """Website Ruba booking form endpoint for creating CRM leads."""

    ALLOWED_PURCHASE_DESIRES = {
        "قطعة سكنية",
        "قطعة تجارية",
        "أكثر من قطعة سكنية",
        "أكثر من قطعة تجارية",
        "أخري",
    }

    ALLOWED_SOURCES = {
        "لينكد إن",
        "يوتيوب",
        "سناب شات",
        "إنستغرام",
        "فيسبوك",
        "اكس (تويتر سابقًا)",
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

    def _build_description(self, *, purchase_desire, source, message):
        rows = [
            ("Purchase desire", purchase_desire),
            ("How did he come to know Ruba plan?", source),
            ("Message", message),
        ]
        return Markup("\n").join(
            Markup("<p><strong>%s:</strong><br/>%s</p>") % (escape(label), escape(value or ""))
            for label, value in rows
        )

    @http.route(
        "/saud/ruba/lead",
        type="http",
        auth="public",
        website=True,
        methods=["POST"],
        csrf=True,
    )
    def create_ruba_lead(self, **post):
        contact_name = self._clean_text(post.get("ruba_name"))
        phone = self._clean_text(post.get("ruba_phone"))
        email = self._clean_text(post.get("ruba_email"))
        purchase_desire = self._clean_text(post.get("ruba_purchase_interest"))
        source = self._clean_text(post.get("ruba_source"))
        message = self._clean_text(post.get("ruba_notes"))

        field_errors = {}
        if not contact_name:
            field_errors["ruba_name"] = "الاسم مطلوب"
        if not phone:
            field_errors["ruba_phone"] = "الهاتف مطلوب"
        if not email:
            field_errors["ruba_email"] = "البريد الإلكتروني مطلوب"
        elif not self.EMAIL_RE.match(email):
            field_errors["ruba_email"] = "البريد الإلكتروني غير صحيح"
        if purchase_desire not in self.ALLOWED_PURCHASE_DESIRES:
            field_errors["ruba_purchase_interest"] = "يرجى اختيار رغبة الشراء"
        if source not in self.ALLOWED_SOURCES:
            field_errors["ruba_source"] = "يرجى اختيار كيف تعرفت على مخطط رُبـــى"

        if field_errors:
            return self._json_response({"success": False, "errors": field_errors}, status=400)

        lead_title = f"Ruba Plane: {message}" if message else "Ruba Plane"
        description = self._build_description(
            purchase_desire=purchase_desire,
            source=source,
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
            _logger.exception("Failed to create CRM lead from Saud Ruba booking form.")
            return self._json_response(
                {
                    "success": False,
                    "message": "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.",
                },
                status=500,
            )

        return self._json_response(
            {
                "success": True,
                "message": "تم إرسال طلبك بنجاح، وسنتواصل معك قريبًا.",
            }
        )
