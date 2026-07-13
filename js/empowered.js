// ============================================================
// INNER HARMONY — Empowered Parent · "The Cycle Ends With You"
// Bespoke scroll-story motion. Loaded ONLY on empowered-parent.html.
// Progressive enhancement: without GSAP or with reduced-motion the page
// stays fully readable (thread whole, child bright, reframes healed). The
// interactive reframe toggles work with plain JS regardless of GSAP.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- INTERACTIVE REFRAME (no GSAP needed) ----------
    document.querySelectorAll('.ep-reframe-card').forEach(card => {
        const quote = card.querySelector('.ep-reframe-quote');
        const toggle = card.querySelector('.ep-reframe-toggle');
        const oldText = card.getAttribute('data-old');
        const newText = card.getAttribute('data-new');
        const render = (healed) => {
            card.classList.toggle('is-healed', healed);
            quote.innerHTML = healed
                ? '<span class="ep-q-new">“' + newText + '”</span>'
                : '<span class="ep-q-old">“' + oldText + '”</span>';
            toggle.setAttribute('aria-pressed', healed ? 'true' : 'false');
        };
        const flip = () => render(!card.classList.contains('is-healed'));
        toggle.addEventListener('click', flip);
        toggle.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
        });
        render(false); // start from the inherited reflex; invite the shift
    });

    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('ep-js');

    // ---------- floating warm motes in the centrepiece ----------
    document.querySelectorAll('.ep-motes').forEach(field => {
        for (let i = 0; i < 20; i++) {
            const s = document.createElement('span');
            s.className = 'particle';
            s.style.left = `${gsap.utils.random(2, 98)}%`;
            s.style.top = `${gsap.utils.random(2, 98)}%`;
            s.style.width = s.style.height = `${gsap.utils.random(2, 5)}px`;
            field.appendChild(s);
            gsap.to(s, {
                y: `+=${gsap.utils.random(-24, 24)}`, x: `+=${gsap.utils.random(-16, 16)}`,
                opacity: gsap.utils.random(0.15, 0.7), duration: gsap.utils.random(4, 8),
                repeat: -1, yoyo: true, ease: 'sine.inOut', delay: gsap.utils.random(0, 3),
            });
        }
    });

    // ---------- HERO — soft entrance ----------
    gsap.from('.ep-embrace', { opacity: 0, scale: 0.82, duration: 1.2, ease: 'power2.out', delay: 0.2 });

    const drawIn = (el) => { const len = el.getTotalLength(); gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }); return len; };

    // ---------- ACT I — THE WEIGHT WE CARRY (pinned; tangle unravels) ----------
    const weight = document.querySelector('.ep-act--weight');
    if (weight) {
        const tangles = gsap.utils.toArray('.ep-tangle', weight);
        const lines = weight.querySelectorAll('.ep-reveal-line');
        tangles.forEach(t => { const len = t.getTotalLength(); gsap.set(t, { strokeDasharray: len, strokeDashoffset: 0 }); });
        gsap.set(lines, { opacity: 0, y: 26 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: weight, start: 'top top', end: '+=120%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        // the tangle unravels (erases) and gently lifts away
        tl.to(tangles, { strokeDashoffset: (i, t) => t.getTotalLength(), y: -22, opacity: 0.15, ease: 'none', duration: 1.3, stagger: 0.12 }, 0)
          .to(lines, { opacity: 1, y: 0, stagger: 0.4, ease: 'power2.out', duration: 1 }, 0.4);
    }

    // ---------- ACT II — THE CYCLE ENDS WITH YOU (pinned) ----------
    const cycle = document.querySelector('.ep-act--cycle');
    if (cycle) {
        const knot = cycle.querySelector('.ep-knot');
        const burst = cycle.querySelector('.ep-burst');
        const youGlow = cycle.querySelector('.ep-you-glow');
        const themGlow = cycle.querySelector('.ep-them-glow');
        const threadNew = cycle.querySelector('.ep-thread-new');
        const nodeThem = cycle.querySelector('.ep-node-them .ep-node');
        const hearts = gsap.utils.toArray('.ep-heartlet', cycle);
        const caps = gsap.utils.toArray('.ep-cap', cycle);

        drawIn(threadNew);
        gsap.set(knot, { transformOrigin: 'center' });
        gsap.set([burst, youGlow, themGlow], { scale: 0, opacity: 0, transformOrigin: 'center' });
        gsap.set(caps, { opacity: 0, y: 20 });
        gsap.set(hearts, { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: cycle, start: 'top top', end: '+=185%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        // 1 — the inherited pattern is named, and travels down the line
        tl.to(caps[0], { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 0.1)
          .to(knot, { x: 300, ease: 'power1.inOut', duration: 1.2 }, 0.3)
        // 2 — it reaches You, and is released into light
          .to(caps[1], { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 1.3)
          .to(knot, { scale: 0, opacity: 0, ease: 'power2.in', duration: 0.4 }, 1.5)
          .to(youGlow, { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.5 }, 1.6)
          .fromTo(burst, { scale: 0, opacity: 0.9 }, { scale: 1.4, opacity: 0, ease: 'power2.out', duration: 0.9 }, 1.6)
          .to(hearts, { opacity: 1, y: -70, stagger: 0.12, ease: 'power1.out', duration: 1.1 }, 1.7)
        // 3 — what continues to your child is warmth, not the wound
          .to(threadNew, { strokeDashoffset: 0, ease: 'none', duration: 1.0 }, 2.2)
          .to(themGlow, { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.6 }, 2.7)
          .to(nodeThem, { fill: '#c9a06f', stroke: '#ffeed0', ease: 'power2.out', duration: 0.6 }, 2.7)
          .to(caps[2], { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 2.8);
    }

    // Sort triggers immediately to fix out-of-order pinning from main.js
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
