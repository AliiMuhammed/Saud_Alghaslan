/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

const FEEDBACK_HIDE_DELAY = 5000;

function clearFeedbackTimer(widget) {
    if (widget._feedbackHideTimeout) {
        clearTimeout(widget._feedbackHideTimeout);
        widget._feedbackHideTimeout = null;
    }
}

function hideFeedback(widget) {
    const feedback = widget._getFeedback();
    if (!feedback) {
        return;
    }
    feedback.textContent = "";
    feedback.classList.add("d-none");
    feedback.classList.remove("is-success", "is-error");
}

function setFormFeedback(widget, type, message) {
    clearFeedbackTimer(widget);
    const feedback = widget._getFeedback();
    if (!feedback) {
        return;
    }
    feedback.textContent = message || "";
    feedback.classList.remove("d-none", "is-success", "is-error");
    if (message) {
        feedback.classList.add(type === "success" ? "is-success" : "is-error");
        widget._feedbackHideTimeout = setTimeout(() => {
            hideFeedback(widget);
            widget._feedbackHideTimeout = null;
        }, FEEDBACK_HIDE_DELAY);
    } else {
        feedback.classList.add("d-none");
    }
}

publicWidget.registry.SaudInquiriesForm = publicWidget.Widget.extend({
    selector: ".js-saud-inquiries-form",
    disabledInEditableMode: true,

    events: {
        submit: "_onSubmit",
        "input input": "_onFieldChange",
        "input textarea": "_onFieldChange",
    },

    _getField(name) {
        return this.el.querySelector(`[name="${name}"]`);
    },

    _getFeedback() {
        return this.el.querySelector(".js-saud-inquiries-feedback");
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
        this.el.querySelectorAll("input, textarea").forEach((field) => {
            this._clearError(field);
        });
    },

    _validateField(field) {
        const value = field.value.trim();

        if (field.name === "inquiry_name" && !value) {
            this._showError(field, "الاسم مطلوب");
            return false;
        }

        if (field.name === "inquiry_phone" && !value) {
            this._showError(field, "الهاتف مطلوب");
            return false;
        }

        if (field.name === "inquiry_message" && !value) {
            this._showError(field, "الرسالة مطلوبة");
            return false;
        }

        this._clearError(field);
        return true;
    },

    _validateForm() {
        const requiredFields = [
            this._getField("inquiry_name"),
            this._getField("inquiry_phone"),
            this._getField("inquiry_message"),
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
        setFormFeedback(this, type, message);
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

    destroy() {
        clearFeedbackTimer(this);
        return this._super(...arguments);
    },
});
