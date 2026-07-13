// ============================================================
// INNER HARMONY — Reiki · "The Gentle Current"
// Bespoke scroll-story motion. Loaded ONLY on reiki.html.
// Progressive enhancement: without GSAP or with reduced-motion the page
// stays fully readable (streams drawn, vessels shown, no pins). The
// interactive session stepper works with plain JS regardless of GSAP.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- INTERACTIVE SESSION STEPPER (no GSAP needed) ----------
    const stages = Array.from(document.querySelectorAll('.rk-stage'));
    if (stages.length) {
        const select = (stage) => {
            stages.forEach(s => {
                const on = s === stage;
                s.classList.toggle('is-active', on);
                s.setAttribute('aria-expanded', on ? 'true' : 'false');
            });
        };
        stages.forEach(stage => {
            stage.addEventListener('click', () => select(stage));
            stage.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(stage); }
            });
        });
        select(stages.find(s => s.classList.contains('is-active')) || stages[0]);
    }

    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('rk-js');

    // ---------- drifting warm motes ----------
    document.querySelectorAll('.rk-motes').forEach(field => {
        for (let i = 0; i < 22; i++) {
            const s = document.createElement('span');
            s.className = 'particle';
            s.style.left = `${gsap.utils.random(2, 98)}%`;
            s.style.top = `${gsap.utils.random(2, 98)}%`;
            s.style.width = s.style.height = `${gsap.utils.random(2, 5)}px`;
            field.appendChild(s);
            gsap.to(s, {
                y: `+=${gsap.utils.random(-26, 26)}`, x: `+=${gsap.utils.random(-18, 18)}`,
                opacity: gsap.utils.random(0.15, 0.7), duration: gsap.utils.random(4, 8),
                repeat: -1, yoyo: true, ease: 'sine.inOut', delay: gsap.utils.random(0, 3),
            });
        }
    });

    // ---------- HERO — soft entrance for the aura ----------
    gsap.from('.rk-aura', { opacity: 0, scale: 0.8, duration: 1.2, ease: 'power2.out', delay: 0.2 });

    const drawIn = (el) => { const len = el.getTotalLength(); gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }); };

    // ---------- ACT I — THE CURRENT FLOWS (pinned; streams draw) ----------
    const flow = document.querySelector('.rk-act--flow');
    if (flow) {
        const streams = gsap.utils.toArray('.rk-stream', flow);
        const lines = flow.querySelectorAll('.rk-reveal-line');
        streams.forEach(drawIn);
        gsap.set(lines, { opacity: 0, y: 26 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: flow, start: 'top top', end: '+=120%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to(streams, { strokeDashoffset: 0, ease: 'none', duration: 1.4, stagger: 0.18 }, 0)
          .to(lines, { opacity: 1, y: 0, stagger: 0.4, ease: 'power2.out', duration: 1 }, 0.4);
    }

    // ---------- ACT II — VESSELS FILL WITH LIGHT (pinned) ----------
    const restore = document.querySelector('.rk-act--restore');
    if (restore) {
        const vessels = gsap.utils.toArray('.rk-vessel', restore);
        const targets = [26, 20, 30, 22]; // gentle, uneven fill levels (svg y)
        vessels.forEach(v => {
            const fill = v.querySelector('.rk-vessel-fill');
            const surface = v.querySelector('.rk-vessel-surface');
            gsap.set(fill, { attr: { y: 100 } });
            gsap.set(surface, { attr: { y1: 100, y2: 100 }, opacity: 0 });
            gsap.set(v.querySelector('.rk-vessel-copy'), { opacity: 0, y: 18 });
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: restore, start: 'top top', end: '+=170%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        vessels.forEach((v, i) => {
            const fill = v.querySelector('.rk-vessel-fill');
            const surface = v.querySelector('.rk-vessel-surface');
            const copy = v.querySelector('.rk-vessel-copy');
            const y = targets[i];
            const at = 0.4 + i * 0.7;
            tl.to(fill, { attr: { y: y }, ease: 'power1.inOut', duration: 0.9 }, at)
              .to(surface, { attr: { y1: y, y2: y }, opacity: 1, ease: 'power1.inOut', duration: 0.9 }, at)
              .to(copy, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 }, at + 0.2);
        });
    }

    // Sort triggers immediately to fix out-of-order pinning from main.js
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
