// ============================================================
// INNER HARMONY — Heal Within · "The Reading"
// Bespoke scroll-story motion. Loaded ONLY on heal-within.html.
// Progressive enhancement: without GSAP or with reduced-motion,
// the page stays fully readable (cards face-up, no pins).
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('hw-js');

    // ---------- drifting stars in every dark act ----------
    function injectStars(container, count) {
        for (let i = 0; i < count; i++) {
            const s = document.createElement('span');
            s.className = 'particle';
            s.style.left = `${gsap.utils.random(3, 97)}%`;
            s.style.top = `${gsap.utils.random(3, 97)}%`;
            s.style.width = s.style.height = `${gsap.utils.random(2, 4)}px`;
            container.appendChild(s);
            gsap.to(s, {
                y: `+=${gsap.utils.random(-24, 24)}`,
                x: `+=${gsap.utils.random(-16, 16)}`,
                opacity: gsap.utils.random(0.2, 0.9),
                duration: gsap.utils.random(3, 7),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: gsap.utils.random(0, 3),
            });
        }
    }
    document.querySelectorAll('.hw-act-stars').forEach(field => injectStars(field, 26));

    // ---------- helper: flip an inner to a target Y ----------
    function flipTo(inner, deg) {
        gsap.to(inner, { rotationY: deg, duration: 0.9, ease: 'power2.inOut' });
    }

    // ---------- HERO card: gentle click / key flip ----------
    const heroCard = document.querySelector('.hw-card--hero');
    if (heroCard) {
        const toggle = () => heroCard.classList.toggle('is-flipped');
        heroCard.addEventListener('click', toggle);
        heroCard.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
        // invite interaction shortly after load
        gsap.delayedCall(2.2, () => heroCard.classList.add('is-flipped'));
    }

    // ---------- ACT I — THE MIRROR ----------
    // Desktop: pinned + scrubbed. Small screens: no pin (stacked layout is
    // taller than the viewport), flip + reveal as the act scrolls into view.
    const mm = gsap.matchMedia();
    const mirror = document.querySelector('.hw-act--mirror');
    if (mirror) {
        const inner = mirror.querySelector('.hw-card--mirror .hw-card-inner');
        const lines = mirror.querySelectorAll('.hw-reveal-line');
        gsap.set(inner, { rotationY: 180, transformPerspective: 1400 });

        mm.add('(min-width: 901px)', () => {
            gsap.set(lines, { opacity: 0, y: 26 });
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: mirror,
                    start: 'top top',
                    end: '+=115%',
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    refreshPriority: 10,
                },
            });
            tl.to(inner, { rotationY: 360, ease: 'none', duration: 1.4 }, 0)
              .to(lines, { opacity: 1, y: 0, stagger: 0.4, ease: 'power2.out', duration: 1 }, 0.5);
        });

        mm.add('(max-width: 900px)', () => {
            gsap.set(inner, { rotationY: 180 });
            gsap.set(lines, { opacity: 0, y: 26 });
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: mirror,
                    start: 'top 62%',
                    once: true,
                },
            });
            tl.to(inner, { rotationY: 360, duration: 1.1, ease: 'power2.inOut' }, 0)
              .to(lines, { opacity: 1, y: 0, stagger: 0.16, ease: 'power2.out', duration: 0.7 }, 0.35);
        });

        // let the mirror card be re-turned by hand too
        let mFlipped = true;
        mirror.querySelector('.hw-card--mirror').addEventListener('click', () => {
            mFlipped = !mFlipped;
            flipTo(inner, mFlipped ? 360 : 180);
        });
    }

    // ---------- ACT II — THREE CARDS TURNED ----------
    // Desktop: pinned, sequential scrubbed flips. Small screens: cards stack
    // in a column, so each flips on its own as it enters the viewport.
    const spread = document.querySelector('.hw-act--spread');
    if (spread) {
        const cards = gsap.utils.toArray('.hw-card--spread', spread);
        cards.forEach(card => {
            const inner = card.querySelector('.hw-card-inner');
            gsap.set(inner, { rotationY: 180, transformPerspective: 1400 });
            card._flipped = true;
            const toggle = () => {
                card._flipped = !card._flipped;
                flipTo(inner, card._flipped ? 360 : 180);
            };
            card.addEventListener('click', toggle);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
            });
        });

        mm.add('(min-width: 741px)', () => {
            cards.forEach(card => gsap.set(card.querySelector('.hw-card-inner'), { rotationY: 180 }));
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: spread,
                    start: 'top top',
                    end: '+=140%',
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    refreshPriority: 10,
                },
            });
            cards.forEach((card, i) => {
                tl.to(card.querySelector('.hw-card-inner'), { rotationY: 360, ease: 'none', duration: 1 }, 0.4 + i * 0.8);
            });
        });

        mm.add('(max-width: 740px)', () => {
            cards.forEach(card => {
                const inner = card.querySelector('.hw-card-inner');
                gsap.set(inner, { rotationY: 180 });
                gsap.to(inner, {
                    rotationY: 360,
                    duration: 1.1,
                    ease: 'power2.inOut',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 68%',
                        once: true,
                    },
                });
            });
        });
    }

    // ---------- ACT III — mini deck (flip and stay flipped on hover/focus) ----------
    document.querySelectorAll('.hw-card--mini').forEach(card => {
        const flipCard = () => card.classList.add('is-flipped');
        card.addEventListener('mouseenter', flipCard);
        card.addEventListener('click', flipCard);
    });

    // Sort triggers immediately to fix out-of-order pinning from main.js
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
    }

    // recalc pins once nav/footer are injected and fonts settle
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
})();
