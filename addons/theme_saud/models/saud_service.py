# -*- coding: utf-8 -*-

from odoo import fields, models


class SaudService(models.Model):
    """Website service displayed on the Saud theme Home and Services pages.

    Each record drives one Services Card (Home page) and one info section
    (Services page). The content is fully data-driven so website designers can
    manage it from the backend "Services" menu instead of editing QWeb.
    """
    _name = 'saud.service'
    _description = 'Saud Website Service'
    _order = 'sequence, id'

    name = fields.Char(
        string="Name",
        required=True,
        translate=True,
        help="Internal name / main title used to identify the service.",
    )
    sequence = fields.Integer(
        string="Sequence",
        default=10,
        help="Used to order services on the website.",
    )
    image = fields.Image(
        string="Image",
        max_width=1920,
        max_height=1920,
        help="Image shown on the service card and info section.",
    )
    image_position = fields.Selection(
        selection=[('left', 'Left'), ('right', 'Right')],
        string="Image Position",
        default='right',
        required=True,
        help="Position of the image relative to the text in the info section.",
    )
    main_title = fields.Char(
        string="Main Title",
        required=True,
        translate=True,
    )
    main_description = fields.Text(
        string="Main Description",
        translate=True,
    )
    benefit_ids = fields.One2many(
        comodel_name='saud.service.benefit',
        inverse_name='service_id',
        string="Benefits",
    )
    active = fields.Boolean(
        string="Active",
        default=True,
    )
