/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.SaudServicesForm = publicWidget.Widget.extend({
    selector: ".s-saud-service-form__form",

    events: {
        "submit": "_onSubmit",
        "input input": "_onInput",
        "change select": "_onInput",
    },

    _showError(field, message) {
        field.classList.add("is-invalid");
        const errorEl = field.nextElementSibling;
        if (errorEl) {
            errorEl.textContent = message;
        }
    },

    _clearError(field) {
        field.classList.remove("is-invalid");
        const errorEl = field.nextElementSibling;
        if (errorEl) {
            errorEl.textContent = "";
        }
    },

    _validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    _validateField(field) {
        const value = field.value.trim();

        if (field.name === "name" && !value) {
            this._showError(field, "هذا الحقل مطلوب");
            return false;
        }

        if (field.name === "phone" && !value) {
            this._showError(field, "هذا الحقل مطلوب");
            return false;
        }

        if (field.name === "email" && value && !this._validateEmail(value)) {
            this._showError(field, "البريد الإلكتروني غير صالح");
            return false;
        }

        if (field.name === "service" && !value) {
            this._showError(field, "يرجى اختيار الخدمة");
            return false;
        }

        this._clearError(field);
        return true;
    },

    _onInput(ev) {
        this._validateField(ev.target);
    },

    _onSubmit(ev) {
        const fields = this.el.querySelectorAll("input, select");
        let isValid = true;

        fields.forEach((field) => {
            const valid = this._validateField(field);
            if (!valid) isValid = false;
        });

        if (!isValid) {
            ev.preventDefault();
        }
    },
});