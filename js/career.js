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

    // ---------- ACT II — THE ALIGNMENT (pinned; needle locks, inputs light) ----------
    const align = document.querySelector('.cc-act--align');
    if (align) {
        const needle = align.querySelector('.cc-dial-needle');
        const markers = gsap.utils.toArray('.cc-dial-marker', align);
        const spokes = gsap.utils.toArray('.cc-dial-spoke', align);
        const legend = gsap.utils.toArray('.cc-legend-item', align);
        const core = align.querySelector('.cc-dial-core');
        const coreLabel = align.querySelector('.cc-dial-corelabel');

        gsap.set(needle, { rotation: -150, transformOrigin: '200px 200px' });
        gsap.set(markers, { opacity: 0.28, transformOrigin: 'center' });
        spokes.forEach(s => { const len = s.getTotalLength(); gsap.set(s, { strokeDasharray: len, strokeDashoffset: len }); });
        gsap.set(legend, { opacity: 0, x: 24 });
        gsap.set([core, coreLabel], { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: align, start: 'top top', end: '+=160%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        // inputs converge one by one
        markers.forEach((m, i) => {
            tl.to(m, { opacity: 1, fill: '#d4a855', scale: 1.35, ease: 'back.out(2)', duration: 0.5 }, 0.3 + i * 0.7);
            if (spokes[i]) tl.to(spokes[i], { strokeDashoffset: 0, ease: 'none', duration: 0.6 }, 0.3 + i * 0.7);
            if (legend[i]) tl.to(legend[i], { opacity: 1, x: 0, ease: 'power2.out', duration: 0.6 }, 0.3 + i * 0.7);
        });
        // needle finds true north, then the direction resolves
        tl.to(needle, { rotation: 0, ease: 'power3.inOut', duration: 1.2 }, 0.6)
          .to(core, { opacity: 1, ease: 'power2.out', duration: 0.5 }, '>-0.3')
          .to(coreLabel, { opacity: 1, ease: 'power2.out', duration: 0.5 }, '<0.15');
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
