// ============================================================
// INNER HARMONY — Career Compass · "Finding True North"
// Bespoke scroll-story motion. Loaded ONLY on career-compass.html.
// Progressive enhancement: without GSAP or with reduced-motion the page
// stays fully readable (fog cleared, needle at north, no pins).
// The interactive crossroads selector works with plain JS regardless.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- INTERACTIVE CROSSROADS (no GSAP needed) ----------
    const cards = Array.from(document.querySelectorAll('.cc-cross-card'));
    const readout = document.querySelector('.cc-cross-readout p');
    if (cards.length && readout) {
        const select = (card) => {
            cards.forEach(c => {
                const on = c === card;
                c.classList.toggle('is-active', on);
                c.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            readout.innerHTML = card.getAttribute('data-guidance');
        };
        cards.forEach(card => {
            card.addEventListener('click', () => select(card));
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(card); }
            });
        });
        const initial = cards.find(c => c.classList.contains('is-active')) || cards[0];
        select(initial);
    }

    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('cc-js');

    // ---------- HERO — soft entrance for the compass ----------
    gsap.from('.cc-compass', { opacity: 0, scale: 0.85, rotation: -25, duration: 1.2, ease: 'power3.out', delay: 0.2 });

    // ---------- ACT I — THE FOG (pinned; veil lifts, routes draw) ----------
    const fog = document.querySelector('.cc-act--fog');
    if (fog) {
        const veil = fog.querySelector('.cc-fog-veil');
        const routes = gsap.utils.toArray('.cc-route', fog);
        const nodes = gsap.utils.toArray('.cc-node', fog);
        const lines = fog.querySelectorAll('.cc-reveal-line');

        routes.forEach(r => {
            const len = r.getTotalLength();
            gsap.set(r, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(nodes, { scale: 0, transformOrigin: 'center' });
        gsap.set(lines, { opacity: 0, y: 26 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: fog, start: 'top top', end: '+=125%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to(veil, { yPercent: -104, opacity: 0, ease: 'power1.inOut', duration: 1.1 }, 0)
          .to(routes, { strokeDashoffset: 0, ease: 'none', duration: 1.3, stagger: 0.12 }, 0.15)
          .to(nodes, { scale: 1, ease: 'back.out(2)', duration: 0.5, stagger: 0.06 }, 0.5)
          .to(lines, { opacity: 1, y: 0, stagger: 0.4, ease: 'power2.out', duration: 1 }, 0.4);
    }

    // ---------- ACT II — THE ALIGNMENT ----------
    const align = document.querySelector('.cc-act--align');
    if (align) {
        const needle = align.querySelector('.cc-dial-needle');
        const markers = gsap.utils.toArray('.cc-dial-marker', align);
        const spokes = gsap.utils.toArray('.cc-dial-spoke', align);
        const legend = gsap.utils.toArray('.cc-legend-item', align);
        const head = gsap.utils.toArray('.cc-align-head > *', align);
        const stage = align.querySelector('.cc-dial-stage');
        const halo = align.querySelector('.cc-dial-halo');
        const rings = gsap.utils.toArray('.cc-dial-ring', align);
        const ticks = align.querySelector('.cc-dial-ticks');
        const core = align.querySelector('.cc-dial-core');
        const coreLabel = align.querySelector('.cc-dial-corelabel');

        const setInitialState = (needleStart) => {
            gsap.set(head, { opacity: 0, y: 18 });
            gsap.set(stage, { opacity: 0, y: 34, scale: 0.9, transformOrigin: '50% 50%' });
            gsap.set(halo, { opacity: 0, scale: 0.72, transformOrigin: '50% 50%' });
            gsap.set([...rings, ticks], { opacity: 0 });

            // Absolute SVG coordinates keep the pivot on the 200,200 hub even
            // when the compass is resized by a responsive layout.
            gsap.set(needle, { rotation: needleStart, svgOrigin: '200 200', force3D: false });
            gsap.set(markers, { opacity: 0.22 });
            spokes.forEach(spoke => {
                const len = spoke.getTotalLength();
                gsap.set(spoke, { strokeDasharray: len, strokeDashoffset: len });
            });
            gsap.set(legend, { opacity: 0, x: 24 });
            gsap.set([core, coreLabel], { opacity: 0 });
        };

        const addInputs = (timeline, start, step) => {
            markers.forEach((marker, i) => {
                const at = start + i * step;
                timeline.to(marker, {
                    opacity: 1, fill: '#d4a855',
                    duration: 0.28, ease: 'power2.out',
                }, at);
                timeline.to(spokes[i], {
                    strokeDashoffset: 0, opacity: 0.72,
                    duration: 0.38, ease: 'none',
                }, at);
                timeline.to(legend[i], {
                    opacity: 1, x: 0,
                    duration: 0.4, ease: 'power3.out',
                }, at + 0.05);
            });
        };

        const media = gsap.matchMedia();

        // Wide screens have room for the cinematic pinned sequence.
        media.add('(min-width: 1200px) and (min-height: 800px)', () => {
            setInitialState(-135);
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: align,
                    start: 'top top',
                    end: '+=140%',
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.75,
                    anticipatePin: 1,
                    refreshPriority: 10,
                    invalidateOnRefresh: true,
                },
            });

            timeline.to(head, { opacity: 1, y: 0, stagger: 0.1, duration: 0.48, ease: 'power2.out' }, 0)
                .to(stage, { opacity: 1, y: 0, scale: 1, duration: 0.72, ease: 'power3.out' }, 0.08)
                .to(halo, { opacity: 1, scale: 1, duration: 0.75, ease: 'power2.out' }, 0.12)
                .to([...rings, ticks], { opacity: 0.34, stagger: 0.07, duration: 0.45 }, 0.18)
                .to(needle, { rotation: 360, duration: 2.15, ease: 'power3.inOut', force3D: false }, 0.3);

            addInputs(timeline, 0.48, 0.42);
            timeline.to([core, coreLabel], { opacity: 1, stagger: 0.1, duration: 0.35 }, 2.15)
                .to(needle, { rotation: 352, duration: 0.16, ease: 'power2.out', force3D: false }, 2.2)
                .to(needle, { rotation: 360, duration: 0.24, ease: 'back.out(2)', force3D: false }, 2.36);
        });

        // Tablets and phones stay in normal document flow: no pinning, no
        // scrubbed layout jumps, and one compact entrance when in view.
        media.add('(max-width: 1199px), (max-height: 799px)', () => {
            const compact = window.matchMedia('(max-width: 620px)').matches;
            setInitialState(compact ? -95 : -120);
            const finalRotation = compact ? 0 : 360;
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: align,
                    start: 'top 76%',
                    once: true,
                    invalidateOnRefresh: true,
                },
            });

            timeline.to(head, { opacity: 1, y: 0, stagger: 0.08, duration: 0.42, ease: 'power2.out' }, 0)
                .to(stage, { opacity: 1, y: 0, scale: 1, duration: 0.58, ease: 'power3.out' }, 0.08)
                .to(halo, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
                .to([...rings, ticks], { opacity: 0.34, stagger: 0.05, duration: 0.35 }, 0.18)
                .to(needle, { rotation: finalRotation, duration: 1.25, ease: 'power3.inOut', force3D: false }, 0.22);

            addInputs(timeline, 0.42, 0.2);
            timeline.to([core, coreLabel], { opacity: 1, stagger: 0.08, duration: 0.3 }, 1.12);
        });
    }

    // ---------- gentle reveal for crossroads cards ----------
    gsap.utils.toArray('.cc-cross-card').forEach((card, i) => {
        gsap.from(card, {
            opacity: 0, y: 30, duration: 0.6, ease: 'power2.out', delay: i * 0.05,
            scrollTrigger: { trigger: '.cc-cross-grid', start: 'top 85%' },
        });
    });

    // Sort triggers immediately to fix out-of-order pinning from main.js
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
