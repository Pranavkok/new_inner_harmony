// ============================================================
// INNER HARMONY — Inner Potential (DMIT) · "The Blueprint Within"
// Bespoke scroll-story motion. Loaded ONLY on inner-potential.html.
// Progressive enhancement: without GSAP or with reduced-motion the page
// stays fully readable (print drawn, nodes lit, no pins). The interactive
// strengths explorer works with plain JS regardless of GSAP.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- INTERACTIVE STRENGTHS EXPLORER (no GSAP needed) ----------
    const strengths = Array.from(document.querySelectorAll('.ip-strength'));
    const readout = document.querySelector('.ip-readout');
    if (strengths.length && readout) {
        const rNum = readout.querySelector('.ip-readout-num');
        const rTitle = readout.querySelector('h3');
        const rDesc = readout.querySelector('.ip-readout-desc');
        const rNurture = readout.querySelector('.ip-readout-nurture');
        const select = (btn) => {
            strengths.forEach(s => {
                const on = s === btn;
                s.classList.toggle('is-active', on);
                s.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            rNum.textContent = 'Intelligence ' + btn.getAttribute('data-num');
            rTitle.textContent = btn.getAttribute('data-name');
            rDesc.textContent = btn.getAttribute('data-desc');
            rNurture.innerHTML = '<strong>How we’d nurture it:</strong> ' + btn.getAttribute('data-nurture');
        };
        strengths.forEach(btn => {
            btn.addEventListener('click', () => select(btn));
            btn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(btn); }
            });
        });
        select(strengths.find(s => s.classList.contains('is-active')) || strengths[0]);
    }

    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('ip-js');

    // ---------- luminous stars in the dark centrepiece ----------
    document.querySelectorAll('.ip-stars').forEach(field => {
        for (let i = 0; i < 30; i++) {
            const s = document.createElement('span');
            s.className = 'particle';
            s.style.left = `${gsap.utils.random(2, 98)}%`;
            s.style.top = `${gsap.utils.random(2, 98)}%`;
            s.style.width = s.style.height = `${gsap.utils.random(2, 4)}px`;
            field.appendChild(s);
            gsap.to(s, {
                y: `+=${gsap.utils.random(-22, 22)}`, x: `+=${gsap.utils.random(-14, 14)}`,
                opacity: gsap.utils.random(0.2, 0.9), duration: gsap.utils.random(3, 7),
                repeat: -1, yoyo: true, ease: 'sine.inOut', delay: gsap.utils.random(0, 3),
            });
        }
    });

    // ---------- HERO — soft entrance for the fingerprint ----------
    gsap.from('.ip-print', { opacity: 0, scale: 0.85, duration: 1.1, ease: 'power2.out', delay: 0.2 });

    const drawIn = (el) => { const len = el.getTotalLength(); gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }); return len; };

    // ---------- ACT I — RIDGES TO THE BRAIN (pinned) ----------
    const map = document.querySelector('.ip-act--map');
    if (map) {
        const ridges = gsap.utils.toArray('.ip-map-svg .ip-ridge', map);
        const neuralLines = gsap.utils.toArray('.ip-neural-line', map);
        const nodes = gsap.utils.toArray('.ip-neural-node', map);
        const lines = map.querySelectorAll('.ip-reveal-line');
        ridges.forEach(drawIn);
        neuralLines.forEach(drawIn);
        gsap.set(nodes, { scale: 0, transformOrigin: 'center' });
        gsap.set(lines, { opacity: 0, y: 26 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: map, start: 'top top', end: '+=130%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to(ridges, { strokeDashoffset: 0, ease: 'none', duration: 1.3, stagger: 0.15 }, 0)
          .to(neuralLines, { strokeDashoffset: 0, ease: 'none', duration: 0.9, stagger: 0.08 }, 0.9)
          .to(nodes, { scale: 1, ease: 'back.out(2.4)', duration: 0.5, stagger: 0.05 }, 1.0)
          .to(lines, { opacity: 1, y: 0, stagger: 0.4, ease: 'power2.out', duration: 1 }, 0.5);
    }

    // ---------- ACT II — THE EIGHT INTELLIGENCES (pinned; ignite) ----------
    const mind = document.querySelector('.ip-act--mind');
    if (mind) {
        const spokes = gsap.utils.toArray('.ip-spoke', mind);
        const nodes = gsap.utils.toArray('.ip-node', mind);
        const nums = gsap.utils.toArray('.ip-node-num', mind);
        const chips = gsap.utils.toArray('.ip-chip', mind);
        const hub = mind.querySelector('.ip-hub');
        const hubGlyph = mind.querySelector('.ip-hub-glyph');
        spokes.forEach(drawIn);
        gsap.set(nodes, { scale: 0, transformOrigin: 'center' });
        gsap.set(nums, { opacity: 0 });
        gsap.set(chips, { opacity: 0, y: 16 });
        gsap.set([hub, hubGlyph], { scale: 0.5, opacity: 0, transformOrigin: '230px 230px' });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: mind, start: 'top top', end: '+=175%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to([hub, hubGlyph], { scale: 1, opacity: 1, ease: 'back.out(1.7)', duration: 0.6 }, 0);
        nodes.forEach((node, i) => {
            const at = 0.5 + i * 0.55;
            if (spokes[i]) tl.to(spokes[i], { strokeDashoffset: 0, ease: 'none', duration: 0.5 }, at);
            tl.to(node, { scale: 1, stroke: '#c9a06f', ease: 'back.out(2.2)', duration: 0.45 }, at + 0.1);
            if (nums[i]) tl.to(nums[i], { opacity: 1, duration: 0.3 }, at + 0.25);
            if (chips[i]) tl.to(chips[i], { opacity: 1, y: 0, ease: 'power2.out', duration: 0.45 }, at + 0.1);
        });
    }

    // Sort triggers immediately to fix out-of-order pinning from main.js
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
