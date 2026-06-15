# -*- coding: utf-8 -*-

from odoo import fields, models


class SaudServiceBenefit(models.Model):
    """A single benefit/feature item listed under a Saud website service."""
    _name = 'saud.service.benefit'
    _description = 'Saud Service Benefit'
    _order = 'sequence, id'

    service_id = fields.Many2one(
        comodel_name='saud.service',
        string="Service",
        required=True,
        ondelete='cascade',
    )
    sequence = fields.Integer(
        string="Sequence",
        default=10,
    )
    benefit_icon = fields.Char(
        string="Icon",
        help="FontAwesome class string, e.g. 'fas fa-home'.",
    )
    benefit_title = fields.Char(
        string="Title",
        required=True,
        translate=True,
    )
    benefit_subtitle = fields.Char(
        string="Subtitle",
        translate=True,
    )
