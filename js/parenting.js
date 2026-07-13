// ============================================================
// INNER HARMONY — Parenting Assessment · "Into Focus"
// Bespoke scroll-story motion. Loaded ONLY on parenting-assessment.html.
// Progressive enhancement: without GSAP or with reduced-motion the page
// stays fully readable (portrait in focus, petals open, no pins).
// The interactive questionnaire works with plain JS regardless of GSAP.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- INTERACTIVE QUESTIONNAIRE (no GSAP needed) ----------
    // Each statement has a 5-point scale; clicking a dot fills up to it.
    const READOUTS = ['Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always'];
    document.querySelectorAll('.pa-statement').forEach(stmt => {
        const dots = Array.from(stmt.querySelectorAll('.pa-dot'));
        const readout = stmt.querySelector('.pa-scale-readout');
        const paint = (idx) => {
            dots.forEach((d, i) => {
                d.classList.toggle('is-on', i <= idx);
                d.classList.toggle('is-peak', i === idx);
                d.setAttribute('aria-checked', i === idx ? 'true' : 'false');
            });
            if (readout) readout.textContent = READOUTS[idx];
            stmt.classList.add('is-set');
        };
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => paint(i));
            dot.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); paint(i); }
            });
        });
        // gentle default so the control reads as pre-filled, not empty
        const start = dots.findIndex(d => d.classList.contains('is-on'));
        if (start >= 0) paint(start);
    });

    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('pa-js');

    // ---------- HERO — soft entrance for the medallion ----------
    gsap.from('.pa-medallion', {
        opacity: 0, scale: 0.85, duration: 1.1, ease: 'power2.out', delay: 0.2,
    });

    // ---------- ACT I — THE UNSEEN LANGUAGE (pinned focus-pull) ----------
    const focus = document.querySelector('.pa-act--focus');
    if (focus) {
        const media = focus.querySelector('.pa-portrait-media');
        const lines = focus.querySelectorAll('.pa-reveal-line');
        gsap.set(media, { filter: 'blur(14px) saturate(0.6)', scale: 1.08 });
        gsap.set(lines, { opacity: 0, y: 26 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: focus,
                start: 'top top',
                end: '+=115%',
                pin: true,
                pinSpacing: true,
                scrub: 0.8,
                anticipatePin: 1,
                refreshPriority: 10,
            },
        });
        tl.to(media, { filter: 'blur(0px) saturate(1)', scale: 1, ease: 'none', duration: 1.4 }, 0)
          .to(lines, { opacity: 1, y: 0, stagger: 0.4, ease: 'power2.out', duration: 1 }, 0.4);
    }

    // ---------- ACT II — THE PROFILE BLOOM (pinned, petals draw in) ----------
    const bloom = document.querySelector('.pa-act--bloom');
    if (bloom) {
        const petals = gsap.utils.toArray('.pa-petal', bloom);
        const legend = gsap.utils.toArray('.pa-legend-item', bloom);
        const core = bloom.querySelector('.pa-bloom-core');
        gsap.set(petals, { scale: 0, opacity: 0, transformOrigin: '200px 200px' });
        gsap.set(legend, { opacity: 0, x: 24 });
        if (core) gsap.set(core, { scale: 0.6, transformOrigin: '200px 200px' });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: bloom,
                start: 'top top',
                end: '+=150%',
                pin: true,
                pinSpacing: true,
                scrub: 0.8,
                anticipatePin: 1,
                refreshPriority: 10,
            },
        });
        if (core) tl.to(core, { scale: 1, ease: 'back.out(2)', duration: 0.6 }, 0);
        petals.forEach((petal, i) => {
            tl.to(petal, { scale: 1, opacity: 1, ease: 'back.out(1.7)', duration: 0.7 }, 0.4 + i * 0.7);
            if (legend[i]) {
                tl.to(legend[i], { opacity: 1, x: 0, ease: 'power2.out', duration: 0.6 }, 0.4 + i * 0.7);
            }
        });
    }

    // ---------- gentle scroll reveal for quiz cards ----------
    gsap.utils.toArray('.pa-statement').forEach((card, i) => {
        gsap.from(card, {
            opacity: 0, y: 34, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 88%' },
            delay: (i % 2) * 0.08,
        });
    });

    // Sort triggers immediately to fix out-of-order pinning from main.js
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    // recalc pins once nav/footer are injected and fonts settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
