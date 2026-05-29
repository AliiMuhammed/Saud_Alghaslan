/** @odoo-module **/

(function () {
    "use strict";

    let lightbox = null;
    let lightboxImg = null;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startTranslateX = 0;
    let startTranslateY = 0;
    let suppressClick = false;


    const MIN_SCALE = 1;
    const MAX_SCALE = 4;
    const START_SCALE = 1;
    const CLICK_ZOOM_SCALE = 2;

    function applyTransform() {
        if (!lightboxImg) {
            return;
        }

        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;

        if (isDragging) {
            lightboxImg.style.cursor = "grabbing";
        } else if (scale > 1) {
            lightboxImg.style.cursor = "grab";
        } else {
            lightboxImg.style.cursor = "zoom-in";
        }
    }

    function resetPosition() {
        translateX = 0;
        translateY = 0;
    }

    function setScale(newScale) {
        if (!lightboxImg) {
            return;
        }

        scale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

        if (scale <= 1) {
            resetPosition();
        }

        applyTransform();
    }

    function closeLightbox() {
        if (!lightbox) {
            return;
        }

        lightbox.classList.remove("is-open");
        lightbox.style.display = "none";

        if (lightboxImg) {
            lightboxImg.src = "";
            lightboxImg.alt = "";
        }

        scale = 1;
        resetPosition();
        applyTransform();
    }

    function createLightbox() {
        if (lightbox) {
            return;
        }

        lightbox = document.createElement("div");
        lightbox.className = "s_zoomable_lightbox_custom";

        lightbox.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 200000;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.88);
        `;

        lightbox.innerHTML = `
            <div class="s_zoomable_lightbox_body"
                 style="
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    padding: 8px;
                 ">
                <img src=""
                     alt=""
                     class="s_zoomable_lightbox_img"
                     draggable="false"
                     style="
                        width: 60vw;
                        max-width: 98vw;
                        max-height: 94vh;
                        transform: translate(0, 0) scale(1);
                        transform-origin: center center;
                        transition: transform 0.18s ease;
                        user-select: none;
                        cursor: zoom-in;
                     "/>
            </div>
        `;

        document.body.appendChild(lightbox);

        lightboxImg = lightbox.querySelector(".s_zoomable_lightbox_img");

        lightbox.addEventListener("click", function (ev) {
            if (!ev.target.closest(".s_zoomable_lightbox_img")) {
                closeLightbox();
            }
        });

        lightboxImg.addEventListener("click", function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            if (suppressClick) {
                suppressClick = false;
                return;
            }

            if (scale > 1) {
                setScale(1);
            } else {
                setScale(CLICK_ZOOM_SCALE);
            }
        });

        lightboxImg.addEventListener("pointerdown", function (ev) {
            if (scale <= 1) {
                return;
            }

            ev.preventDefault();
            ev.stopPropagation();

            isDragging = true;
            suppressClick = false;

            startX = ev.clientX;
            startY = ev.clientY;
            startTranslateX = translateX;
            startTranslateY = translateY;

            lightboxImg.setPointerCapture(ev.pointerId);
            applyTransform();
        });

        lightboxImg.addEventListener("pointermove", function (ev) {
            if (!isDragging) {
                return;
            }

            ev.preventDefault();
            ev.stopPropagation();

            const deltaX = ev.clientX - startX;
            const deltaY = ev.clientY - startY;

            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                suppressClick = true;
            }

            translateX = startTranslateX + deltaX;
            translateY = startTranslateY + deltaY;

            applyTransform();
        });

        lightboxImg.addEventListener("pointerup", function (ev) {
            if (!isDragging) {
                return;
            }

            isDragging = false;

            try {
                lightboxImg.releasePointerCapture(ev.pointerId);
            } catch (error) {
                // Ignore if pointer capture was already released.
            }

            applyTransform();
        });

        lightboxImg.addEventListener("pointercancel", function () {
            isDragging = false;
            applyTransform();
        });

        lightbox.addEventListener("wheel", function (ev) {
            ev.preventDefault();

            if (ev.deltaY < 0) {
                setScale(scale + 0.2);
            } else {
                setScale(scale - 0.2);
            }
        }, {passive: false});

        document.addEventListener("keydown", function (ev) {
            if (ev.key === "Escape" && lightbox.classList.contains("is-open")) {
                closeLightbox();
            }
        });
    }

    function openLightbox(img) {
        if (!img) {
            return;
        }

        const src = img.currentSrc || img.src;

        if (!src) {
            return;
        }

        createLightbox();

        lightboxImg.src = src;
        lightboxImg.alt = img.alt || "";

        lightbox.style.display = "flex";
        lightbox.classList.add("is-open");

        scale = START_SCALE;
        resetPosition();
        applyTransform();
    }

    document.addEventListener("click", function (ev) {
        const wrap = ev.target.closest(".s_zoomable_image_wrap");

        if (!wrap) {
            return;
        }

        ev.preventDefault();
        ev.stopPropagation();

        if (document.body.classList.contains("editor_enable")) {
            return;
        }

        const img = wrap.querySelector(".s_zoomable_img");

        if (!img) {
            return;
        }

        openLightbox(img);
    }, true);
})();