document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           ELEMENTS
        ================================================= */

        const video =
            document.getElementById(
                "backgroundVideo"
            );


        const scenes =
            document.querySelectorAll(
                ".scene"
            );


        const navLinks =
            document.querySelectorAll(
                ".navigation a"
            );


        /* =================================================
           VIDEO STATE
        ================================================= */

        let targetTime = 0;

        let currentTime = 0;

        let targetX = 50;

        let currentX = 50;

        let targetY = 50;

        let currentY = 50;


        let ticking = false;


        /* =================================================
           VIDEO SETTINGS
        ================================================= */

        video.pause();


        /*
        ویڈیو کو پہلے سے load کرنے کی کوشش
        */

        video.load();


        /* =================================================
           PAGE SCROLL PROGRESS

           پوری website:
           0% → 100%

           Video:
           0 sec → 8 sec
        ================================================= */

        function getPageProgress() {

            const scrollTop =
                window.scrollY;


            const documentHeight =
                document.documentElement
                    .scrollHeight;


            const viewportHeight =
                window.innerHeight;


            const scrollable =
                documentHeight -
                viewportHeight;


            if (scrollable <= 0) {

                return 0;

            }


            return Math.max(
                0,
                Math.min(
                    1,
                    scrollTop / scrollable
                )
            );

        }


        /* =================================================
           FIND CURRENT SECTION
        ================================================= */

        function getCurrentScene() {

            const viewportCenter =
                window.innerHeight / 2;


            let closestScene = null;

            let closestDistance =
                Infinity;


            scenes.forEach(
                scene => {

                    const rect =
                        scene.getBoundingClientRect();


                    const sceneCenter =
                        rect.top +
                        rect.height / 2;


                    const distance =
                        Math.abs(
                            viewportCenter -
                            sceneCenter
                        );


                    if (
                        distance <
                        closestDistance
                    ) {

                        closestDistance =
                            distance;

                        closestScene =
                            scene;

                    }

                }
            );


            return closestScene;

        }


        /* =================================================
           VIDEO POSITION

           center = 50%
           left   = 22%
           right  = 78%
        ================================================= */

        function updateVideoPosition() {

            const scene =
                getCurrentScene();


            if (!scene) {

                return;

            }


            const position =
                scene.dataset.videoPosition;


            if (
                position ===
                "left"
            ) {

                targetX = 23;

            }


            else if (
                position ===
                "right"
            ) {

                targetX = 77;

            }


            else {

                targetX = 50;

            }


            /*
            Slight vertical cinematic movement
            */

            const progress =
                getPageProgress();


            targetY =
                50 +
                Math.sin(
                    progress * Math.PI * 2
                ) * 5;

        }


        /* =================================================
           VIDEO TIME

           پوری website کی height
           کو video duration سے map
        ================================================= */

        function updateVideoTime() {

            if (
                !Number.isFinite(
                    video.duration
                )
            ) {

                return;

            }


            const progress =
                getPageProgress();


            targetTime =
                progress *
                video.duration;

        }


        /* =================================================
           SCROLL HANDLER
        ================================================= */

        function onScroll() {

            if (ticking) {

                return;

            }


            ticking = true;


            requestAnimationFrame(
                () => {

                    updateVideoTime();

                    updateVideoPosition();

                    updateRevealAnimations();

                    ticking = false;

                }
            );

        }


        window.addEventListener(
            "scroll",
            onScroll,
            {
                passive: true
            }
        );


        /* =================================================
           SMOOTH ANIMATION LOOP

           یہ ہر frame پر صرف چھوٹی calculations
           کرے گا، اس لیے scrolling کو unnecessarily
           heavy نہیں کرے گا۔
        ================================================= */

        function animationLoop() {


            /*
            Video time smoothing
            */

            currentTime +=
                (
                    targetTime -
                    currentTime
                ) * 0.075;


            /*
            Video horizontal position
            */

            currentX +=
                (
                    targetX -
                    currentX
                ) * 0.06;


            /*
            Video vertical position
            */

            currentY +=
                (
                    targetY -
                    currentY
                ) * 0.06;


            /* =========================================
               VIDEO SCRUB
            ========================================= */

            if (
                video.readyState >= 2 &&
                Number.isFinite(
                    video.duration
                )
            ) {


                /*
                غیر ضروری seeking سے بچنے کے لیے
                threshold
                */

                if (
                    Math.abs(
                        video.currentTime -
                        currentTime
                    ) > 0.025
                ) {

                    try {

                        video.currentTime =
                            currentTime;

                    }

                    catch (error) {

                        /*
                        بعض browsers میں
                        seek temporarily fail
                        ہو سکتا ہے۔
                        */

                    }

                }

            }


            /* =========================================
               VIDEO POSITION
            ========================================= */

            video.style.objectPosition =
                `${currentX}% ${currentY}%`;


            /*
            ہلکا cinematic scale
            */

            const progress =
                getPageProgress();


            const scale =
                1.08 +
                (
                    Math.sin(
                        progress *
                        Math.PI
                    ) * .025
                );


            video.style.transform =
                `scale(${scale})`;


            requestAnimationFrame(
                animationLoop
            );

        }


        /* =================================================
           SECTION REVEAL
        ================================================= */

        function updateRevealAnimations() {

            const viewport =
                window.innerHeight;


            scenes.forEach(
                scene => {

                    const rect =
                        scene.getBoundingClientRect();


                    /*
                    section screen میں
                    کتنا داخل ہو چکا ہے
                    */

                    const visible =
                        1 -
                        Math.abs(
                            (
                                rect.top +
                                rect.height / 2 -
                                viewport / 2
                            )
                            /
                            viewport
                        );


                    const amount =
                        Math.max(
                            0,
                            Math.min(
                                1,
                                visible
                            )
                        );


                    scene.style.setProperty(
                        "--scene-progress",
                        amount
                    );


                }
            );

        }


        /* =================================================
           ACTIVE NAVIGATION
        ================================================= */

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                navLinks.forEach(
                                    link => {

                                        link.classList
                                            .remove(
                                                "active"
                                            );

                                    }
                                );


                                const active =
                                    document.querySelector(
                                        `.navigation a[href="#${entry.target.id}"]`
                                    );


                                if (active) {

                                    active.classList
                                        .add(
                                            "active"
                                        );

                                }

                            }

                        }
                    );

                },
                {
                    threshold: .45
                }
            );


        scenes.forEach(
            scene => {

                if (scene.id) {

                    observer.observe(
                        scene
                    );

                }

            }
        );


        /* =================================================
           VIDEO METADATA
        ================================================= */

        video.addEventListener(
            "loadedmetadata",
            () => {

                video.pause();


                updateVideoTime();

                updateVideoPosition();


                currentTime =
                    targetTime;


                video.currentTime =
                    targetTime;

            }
        );


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            () => {

                updateVideoTime();

                updateVideoPosition();

            }
        );


        /* =================================================
           INITIAL
        ================================================= */

        updateVideoTime();

        updateVideoPosition();

        updateRevealAnimations();

        animationLoop();

    }
);
// =====================================================
// EXPERIENCE 3D REVEAL
// =====================================================

const experienceItems =
    document.querySelectorAll(
        ".experience-item"
    );


const experienceObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "experience-visible"
                        );

                    }

                }
            );

        },
        {
            threshold: 0.2
        }
    );


experienceItems.forEach(
    (item) => {

        experienceObserver.observe(
            item
        );

    }
);
// =====================================================
// ACHIEVEMENT 3D REVEAL
// =====================================================

const achievementItems =
    document.querySelectorAll(
        ".achievement-item"
    );


const achievementObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "achievement-visible"
                        );

                    }

                }
            );

        },
        {
            threshold: 0.2
        }
    );


achievementItems.forEach(
    (item) => {

        achievementObserver.observe(item);

    }
);
// =====================================================
// CONTACT REVEAL
// =====================================================

const contactScene =
    document.querySelector(".contact-scene");


if (contactScene) {

    const contactObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "contact-visible"
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.15
            }
        );


    contactObserver.observe(
        contactScene
    );

}


// =====================================================
// CONTACT FORM
// =====================================================

const contactForm =
    document.getElementById(
        "contactForm"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const button =
                contactForm.querySelector(
                    ".contact-submit span"
                );

            button.textContent =
                "MESSAGE READY ✓";

            contactForm.reset();

            setTimeout(() => {

                button.textContent =
                    "Send Message";

            }, 2500);

        }
    );

}