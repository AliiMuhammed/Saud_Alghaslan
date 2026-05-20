/** @odoo-module **/

/*
 * Saud Theme Scroll Reveal
 * ------------------------
 * - Fail-safe: elements are visible by default in CSS.
 * - JS adds .s_saud_reveal and .s_saud_reveal--ready before observing.
 * - Automatically animates theme sections/cards across all pages.
 * - Also fixes elements that only have modifier classes like .s_saud_reveal--top.
 * - Animation resets when scrolling away and runs again when scrolling back.
 */

const BASE_CLASS = "s_saud_reveal";
const READY_CLASS = "s_saud_reveal--ready";
const VISIBLE_CLASS = "is-visible";
const ONCE_ATTR = "data-reveal-once";
const INITIALIZED_ATTR = "data-saud-reveal-initialized";
const ELEMENT_ONLY_EXCLUDE_SELECTOR = ".s_saud_hero";

const MANUAL_REVEAL_SELECTOR = [
    ".s_saud_reveal",
    ".s_saud_reveal--top",
    ".s_saud_reveal--left",
    ".s_saud_reveal--right",
    ".s_saud_reveal--zoom",
].join(",");

const AUTO_REVEAL_SELECTOR = [
    /* Main theme sections */
    "#wrap section[class^='s_saud_']:not(.s_saud_hero)",
    "#wrap section[class*=' s_saud_']:not(.s_saud_hero)",
    "#wrap section[class^='s-saud-']",
    "#wrap section[class*=' s-saud-']",

    /* Hero content */
    ".s_saud_hero_title",
    ".s_saud_hero_subtitle",
    ".s_saud_hero_btn",
    ".s_saud_hero_content > *",

    /* Reusable component parts */
    ".s_saud_info_section .row > [class*='col-']",
    ".s_saud_benefits .row > [class*='col-']",
    ".s_saud_how_work_step",
    ".s_saud_how_work_testimonials",
    ".s_saud_services_cards__card",
    ".s_saud_counter__item",
    ".s_saud_auction_card__media",
    ".s_saud_auction_card__content",
    ".s_saud_trusted__carousel",
].join(",");

const EXCLUDE_SELECTOR = [
    "header",
    "footer",
    "nav",
    ".modal",
    ".dropdown-menu",
    ".o_mega_menu",
    ".oe_structure_solo",
    ".o_we_overlay",
    ".o_editable",
    ".owl-item",
    ".owl-stage",
    ".owl-stage-outer",
].join(",");

function uniqueElements(nodeLists) {
    return [...new Set(nodeLists.flatMap((nodeList) => [...nodeList]))];
}

function isRevealAllowed(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }

    if (element.matches(ELEMENT_ONLY_EXCLUDE_SELECTOR)) {
        return false;
    }

    if (element.matches(EXCLUDE_SELECTOR) || element.closest(EXCLUDE_SELECTOR)) {
        return false;
    }

    return true;
}

function hasDirectionClass(element) {
    return (
        element.classList.contains("s_saud_reveal--top") ||
        element.classList.contains("s_saud_reveal--left") ||
        element.classList.contains("s_saud_reveal--right") ||
        element.classList.contains("s_saud_reveal--zoom")
    );
}

function getRevealDirection(element, index) {
    if (hasDirectionClass(element)) {
        return;
    }

    if (
        element.matches(".s_saud_services_cards__card") ||
        element.matches(".s_saud_counter__item") ||
        element.matches(".s_saud_how_work_step")
    ) {
        element.classList.add("s_saud_reveal--zoom");
        return;
    }

    if (
        element.matches(".s_saud_hero_title") ||
        element.matches(".s_saud_hero_subtitle") ||
        element.matches(".s_saud_hero_btn") ||
        element.matches(".s_saud_hero_content > *")
    ) {
        element.classList.add("s_saud_reveal--top");
        return;
    }

    if (index % 2 === 0) {
        element.classList.add("s_saud_reveal--top");
    }
}

function hasDelayClass(element) {
    return (
        element.classList.contains("s_saud_reveal--delay-1") ||
        element.classList.contains("s_saud_reveal--delay-2") ||
        element.classList.contains("s_saud_reveal--delay-3") ||
        element.classList.contains("s_saud_reveal--delay-4")
    );
}

function addStaggerDelay(element, index) {
    if (hasDelayClass(element)) {
        return;
    }

    if (
        element.matches(".s_saud_services_cards__card") ||
        element.matches(".s_saud_counter__item") ||
        element.matches(".s_saud_how_work_step") ||
        element.matches(".s_saud_benefits .row > [class*='col-']")
    ) {
        element.classList.add(`s_saud_reveal--delay-${(index % 4) + 1}`);
        return;
    }

    if (
        element.matches(".s_saud_hero_title") ||
        element.matches(".s_saud_hero_content > *:nth-child(1)")
    ) {
        element.classList.add("s_saud_reveal--delay-1");
        return;
    }

    if (
        element.matches(".s_saud_hero_subtitle") ||
        element.matches(".s_saud_hero_content > *:nth-child(2)")
    ) {
        element.classList.add("s_saud_reveal--delay-2");
        return;
    }

    if (
        element.matches(".s_saud_hero_btn") ||
        element.matches(".s_saud_hero_content > *:nth-child(3)")
    ) {
        element.classList.add("s_saud_reveal--delay-3");
    }
}

function prepareRevealElement(element, index) {
    if (!isRevealAllowed(element)) {
        return false;
    }

    if (element.getAttribute(INITIALIZED_ATTR) === "true") {
        return false;
    }

    element.setAttribute(INITIALIZED_ATTR, "true");
    element.classList.add(BASE_CLASS);

    getRevealDirection(element, index);
    addStaggerDelay(element, index);

    return true;
}

function initSaudScrollReveal() {
    const revealElements = uniqueElements([
        document.querySelectorAll(MANUAL_REVEAL_SELECTOR),
        document.querySelectorAll(AUTO_REVEAL_SELECTOR),
    ]).filter(isRevealAllowed);

    if (!revealElements.length) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element, index) => {
            prepareRevealElement(element, index);
            element.classList.add(VISIBLE_CLASS);
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries, observerInstance) => {
            entries.forEach((entry) => {
                const element = entry.target;
                const revealOnce = element.getAttribute(ONCE_ATTR) === "true";

                if (entry.isIntersecting) {
                    element.classList.add(VISIBLE_CLASS);

                    /*
                     * Optional:
                     * If you want a specific element to animate once only,
                     * add data-reveal-once="true" in XML.
                     */
                    if (revealOnce) {
                        observerInstance.unobserve(element);
                    }
                } else if (!revealOnce) {
                    /*
                     * Reset animation when scrolling away.
                     * When the user scrolls back, the reveal starts again.
                     */
                    element.classList.remove(VISIBLE_CLASS);
                }
            });
        },
        {
            /*
             * Reveal when the component is closer to the middle of the viewport.
             * Increase threshold if you want the user to scroll deeper into the component.
             */
            threshold: 0.10,
            rootMargin: "0px 0px -20% 0px",
        }
    );

    revealElements.forEach((element, index) => {
        if (!prepareRevealElement(element, index)) {
            return;
        }

        /*
         * Important:
         * This class is added only from JS.
         * If JS/assets fail, CSS keeps everything visible.
         */
        element.classList.add(READY_CLASS);
        observer.observe(element);
    });
}

function scheduleSaudScrollReveal() {
    window.requestAnimationFrame(() => {
        initSaudScrollReveal();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleSaudScrollReveal);
} else {
    scheduleSaudScrollReveal();
}

/* Re-run after lazy/dynamic DOM updates without duplicating initialized elements. */
window.addEventListener("load", scheduleSaudScrollReveal);
