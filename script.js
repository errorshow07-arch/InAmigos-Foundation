const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* =========================
   LOADER
========================= */
window.addEventListener("load", () => {
    setTimeout(() => {
        $(".loader")?.classList.add("done");
    }, 700);
});


/* =========================
   SCROLL PROGRESS
========================= */
const progress = $(".progress i");

window.addEventListener("scroll", () => {
    if (!progress) return;

    const height =
        document.documentElement.scrollHeight - window.innerHeight;

    const percent = height > 0
        ? (window.scrollY / height) * 100
        : 0;

    progress.style.width = percent + "%";
});


/* =========================
   REVEAL ANIMATIONS
========================= */
const io = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                io.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12 }
);

$$(".reveal").forEach((el) => io.observe(el));


/* =========================
   MOBILE MENU
========================= */
const menu = $(".menu");
const header = $(".site-header");

menu?.addEventListener("click", () => {
    header?.classList.toggle("open");
});

$$("nav a").forEach((a) => {
    a.addEventListener("click", () => {
        header?.classList.remove("open");
    });
});


/* =========================
   CUSTOM CURSOR
========================= */
if (window.matchMedia("(pointer:fine)").matches) {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    const label = $(".cursor-label");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    window.addEventListener("pointermove", (e) => {
        x = e.clientX;
        y = e.clientY;

        if (dot) {
            dot.style.left = x + "px";
            dot.style.top = y + "px";
        }
    });

    function tick() {
        rx += (x - rx) * 0.16;
        ry += (y - ry) * 0.16;

        if (ring) {
            ring.style.left = rx + "px";
            ring.style.top = ry + "px";
        }

        if (label) {
            label.style.left = rx + "px";
            label.style.top = ry + "px";
        }

        requestAnimationFrame(tick);
    }

    tick();

    $$("a, button, .cause, .track article, .gallery-grid figure")
        .forEach((el) => {

            el.addEventListener("mouseenter", () => {
                document.body.classList.add("cursor-hover");

                if (
                    el.matches(
                        ".gallery-grid figure, .track article, .cause"
                    )
                ) {
                    if (label) label.textContent = "VIEW";
                }
            });

            el.addEventListener("mouseleave", () => {
                document.body.classList.remove("cursor-hover");
            });
        });


    /* Magnetic buttons */
    $$(".magnetic").forEach((el) => {

        el.addEventListener("pointermove", (e) => {
            const rect = el.getBoundingClientRect();

            const moveX =
                (e.clientX - rect.left - rect.width / 2) * 0.12;

            const moveY =
                (e.clientY - rect.top - rect.height / 2) * 0.12;

            el.style.transform =
                `translate(${moveX}px, ${moveY}px)`;
        });

        el.addEventListener("pointerleave", () => {
            el.style.transform = "";
        });
    });
}


/* =========================
   NUMBER COUNTERS
========================= */
const counters = $$("[data-count]");

const counterObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {

            if (!entry.isIntersecting) return;

            const el = entry.target;
            const end = Number(el.dataset.count);

            const duration = 1300;
            const startTime = performance.now();

            function animateCounter(currentTime) {

                const progress =
                    Math.min(
                        (currentTime - startTime) / duration,
                        1
                    );

                const eased =
                    1 - Math.pow(1 - progress, 3);

                const value =
                    Math.floor(eased * end);

                el.textContent =
                    value.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(animateCounter);
                } else {
                    el.textContent =
                        end.toLocaleString();
                }
            }

            requestAnimationFrame(animateCounter);

            counterObserver.unobserve(el);
        });
    },
    { threshold: 0.5 }
);

counters.forEach((el) => counterObserver.observe(el));


/* =========================
   IMAGE SLIDER
========================= */

(() => {
    const slider = $(".slider");
    const track = $(".track");
    const slides = $$(".track article");
    const nextButton = $(".next");
    const prevButton = $(".prev");
    const dotsContainer = $(".dots");
    const progressBar = $(".slider-bar i");

    if (!slider || !track || slides.length === 0) return;

    let current = 0;
    let timer = null;

    function getStep() {
        if (!slides[0]) return 0;

        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 18;

        return slideWidth + gap;
    }

    function moveSlider() {
        const step = getStep();

        track.style.transform =
            "translateX(-" + (current * step) + "px)";

        track.style.transition =
            "transform 0.6s ease";

        /* Update dots */
        const dots = $$(".dot");

        dots.forEach((dot, index) => {
            dot.classList.toggle(
                "active",
                index === current
            );
        });

        /* Update progress bar */
        if (progressBar) {
            const percentage =
                ((current + 1) / slides.length) * 100;

            progressBar.style.width =
                percentage + "%";
        }
    }

    function nextSlide() {
        current++;

        if (current >= slides.length) {
            current = 0;
        }

        moveSlider();
    }

    function previousSlide() {
        current--;

        if (current < 0) {
            current = slides.length - 1;
        }

        moveSlider();
    }


    /* =========================
       DOTS
    ========================= */

    if (dotsContainer) {
        dotsContainer.innerHTML = "";

        slides.forEach((slide, index) => {

            const dot = document.createElement("i");

            dot.className = "dot";

            if (index === 0) {
                dot.classList.add("active");
            }

            dot.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                current = index;
                moveSlider();
                restartAutoPlay();
            });

            dotsContainer.appendChild(dot);
        });
    }


    /* =========================
       NEXT BUTTON
    ========================= */

    if (nextButton) {
        nextButton.addEventListener("click", function (e) {

            e.preventDefault();
            e.stopPropagation();

            nextSlide();
            restartAutoPlay();
        });
    }


    /* =========================
       PREVIOUS BUTTON
    ========================= */

    if (prevButton) {
        prevButton.addEventListener("click", function (e) {

            e.preventDefault();
            e.stopPropagation();

            previousSlide();
            restartAutoPlay();
        });
    }


    /* =========================
       AUTOPLAY
    ========================= */

    function startAutoPlay() {
        clearInterval(timer);

        timer = setInterval(function () {
            nextSlide();
        }, 3500);
    }

    function restartAutoPlay() {
        clearInterval(timer);
        startAutoPlay();
    }

    slider.addEventListener("mouseenter", function () {
        clearInterval(timer);
    });

    slider.addEventListener("mouseleave", function () {
        startAutoPlay();
    });


    /* =========================
       TOUCH SWIPE
    ========================= */

    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener("touchstart", function (e) {

        touchStartX = e.touches[0].clientX;

        clearInterval(timer);

    }, { passive: true });


    slider.addEventListener("touchend", function (e) {

        touchEndX = e.changedTouches[0].clientX;

        const distance = touchEndX - touchStartX;

        if (Math.abs(distance) > 50) {

            if (distance < 0) {
                nextSlide();
            } else {
                previousSlide();
            }
        }

        startAutoPlay();

    }, { passive: true });


    /* =========================
       RESIZE
    ========================= */

    window.addEventListener("resize", function () {
        moveSlider();
    });


    /* =========================
       INITIALIZE
    ========================= */

    moveSlider();
    startAutoPlay();

})();

    /* =========================
       TOUCH / DRAG
    ========================= */

    slider.addEventListener("pointerdown", (e) => {

        dragging = true;

        startX = e.clientX;

        startPosition =
            -current * getStep();

        track.style.transition = "none";

        slider.setPointerCapture(e.pointerId);

        stopAutoPlay();
    });


    slider.addEventListener("pointermove", (e) => {

        if (!dragging) return;

        const distance =
            e.clientX - startX;

        track.style.transform =
            `translate3d(${startPosition + distance}px, 0, 0)`;
    });


    function finishDrag(e) {

        if (!dragging) return;

        dragging = false;

        const distance =
            e.clientX - startX;

        if (Math.abs(distance) > 70) {

            if (distance < 0) {
                next();
            } else {
                previous();
            }

        } else {
            goTo(current);
        }

        startAutoPlay();
    }


    slider.addEventListener(
        "pointerup",
        finishDrag
    );

    slider.addEventListener(
        "pointercancel",
        finishDrag
    );


    /* Recalculate slider on resize */

    window.addEventListener("resize", () => {
        goTo(current);
    });


    /* Initial position */

    goTo(0);

    startAutoPlay();



/* =========================
   SECRET EASTER EGG
========================= */

let clicks = 0;
let clickTimer;

$(".brand")?.addEventListener("click", (e) => {

    if (location.hash !== "#top") return;

    e.preventDefault();

    clicks++;

    clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
        clicks = 0;
    }, 1200);

    if (clicks === 5) {

        clicks = 0;

        openEgg();
    }
});


function openEgg() {

    $(".egg")?.classList.add("show");
    $(".toast")?.classList.add("show");

    setTimeout(() => {
        $(".toast")?.classList.remove("show");
    }, 2500);
}


$(".egg button")?.addEventListener("click", () => {
    $(".egg")?.classList.remove("show");
});


$(".egg")?.addEventListener("click", (e) => {

    if (e.target === $(".egg")) {
        $(".egg")?.classList.remove("show");
    }
});


/* Keyboard Easter egg */

let typed = "";

window.addEventListener("keydown", (e) => {

    if (e.key.length === 1) {

        typed =
            (typed + e.key.toLowerCase()).slice(-8);

        if (typed === "inamigos") {

            typed = "";

            openEgg();
        }
    }
});


/* =========================
   EXTERNAL LINKS
========================= */

document
    .querySelectorAll('a[href^="http"]')
    .forEach((link) => {

        link.addEventListener("click", function (e) {

            e.stopPropagation();

            const url = this.href;

            if (this.target === "_blank") {

                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            } else {

                window.location.href = url;
            }
        });
    });