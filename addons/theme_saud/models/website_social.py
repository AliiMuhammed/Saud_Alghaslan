# -*- coding: utf-8 -*-

from odoo import fields, models


class Website(models.Model):
    _inherit = 'website'

    social_snapchat = fields.Char('Snapchat Account')
