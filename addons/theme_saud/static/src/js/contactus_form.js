/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.SaudContactUsForm = publicWidget.Widget.extend({
    selector: ".js-saud-contactus-form",
    disabledInEditableMode: true,

    events: {
        submit: "_onSubmit",
        "input input": "_onFieldChange",
        "input textarea": "_onFieldChange",
        "change select": "_onFieldChange",
    },

    _getField(name) {
        return this.el.querySelector(`[name="${name}"]`);
    },

    _getFeedback() {
        return this.el.querySelector(".js-saud-contactus-feedback");
    },

    _showError(field, message) {
        field.classList.add("is-invalid");
        const errorEl = field.nextElementSibling;
        if (errorEl && errorEl.classList.contains("form-error")) {
            errorEl.textContent = message;
        }
    },

    _clearError(field) {
        field.classList.remove("is-invalid");
        const errorEl = field.nextElementSibling;
        if (errorEl && errorEl.classList.contains("form-error")) {
            errorEl.textContent = "";
        }
    },

    _clearAllErrors() {
        this.el.querySelectorAll("input, select, textarea").forEach((field) => {
            this._clearError(field);
        });
    },

    _validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    _validateField(field) {
        const value = field.value.trim();

        if (field.name === "contact_name" && !value) {
            this._showError(field, "الاسم مطلوب");
            return false;
        }

        if (field.name === "contact_phone" && !value) {
            this._showError(field, "الهاتف مطلوب");
            return false;
        }

        if (field.name === "contact_email") {
            if (!value) {
                this._showError(field, "البريد الإلكتروني مطلوب");
                return false;
            }
            if (!this._validateEmail(value)) {
                this._showError(field, "البريد الإلكتروني غير صحيح");
                return false;
            }
        }

        if (field.name === "contact_topic" && !value) {
            this._showError(field, "يرجى اختيار القسم");
            return false;
        }

        this._clearError(field);
        return true;
    },

    _validateForm() {
        const requiredFields = [
            this._getField("contact_name"),
            this._getField("contact_phone"),
            this._getField("contact_email"),
            this._getField("contact_topic"),
        ].filter(Boolean);

        let isValid = true;
        requiredFields.forEach((field) => {
            if (!this._validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    },

    _setFeedback(type, message) {
        const feedback = this._getFeedback();
        if (!feedback) {
            return;
        }
        feedback.textContent = message || "";
        feedback.classList.remove("d-none", "is-success", "is-error");
        if (message) {
            feedback.classList.add(type === "success" ? "is-success" : "is-error");
        } else {
            feedback.classList.add("d-none");
        }
    },

    _applyServerErrors(errors) {
        Object.entries(errors || {}).forEach(([fieldName, message]) => {
            const field = this._getField(fieldName);
            if (field) {
                this._showError(field, message);
            }
        });
    },

    _onFieldChange(ev) {
        this._validateField(ev.currentTarget);
        this._setFeedback(null, "");
    },

    async _onSubmit(ev) {
        ev.preventDefault();
        this._setFeedback(null, "");

        if (!this._validateForm()) {
            return;
        }

        const submitButton = this.el.querySelector(".contact-submit");
        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch(this.el.action, {
                method: "POST",
                body: new FormData(this.el),
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                this._applyServerErrors(result.errors);
                this._setFeedback(
                    "error",
                    result.message || "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى."
                );
                return;
            }

            this.el.reset();
            this._clearAllErrors();
            this._setFeedback("success", result.message || "تم إرسال رسالتك بنجاح، وسنتواصل معك قريبًا.");
        } catch {
            this._setFeedback("error", "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    },
});