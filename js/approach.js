// ============================================================
// INNER HARMONY — Approach · "The Path"
// Loaded ONLY on approach.html. Progressive enhancement:
//  - `.ap-js` (motion) only with GSAP + no reduced-motion
//  - `.ap-widgets` (interactive journey stepper) works without GSAP
// Without JS the page is fully readable & static.
// ============================================================

(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- ACT III — journey stepper (plain JS, no GSAP needed) ----------
    const jw = document.querySelector('.ap-jw');
    const steps = Array.from(document.querySelectorAll('.ap-step'));
    if (jw && steps.length) {
        document.body.classList.add('ap-widgets');
        const stops = Array.from(jw.querySelectorAll('.ap-stop'));
        const progress = jw.querySelector('.ap-jw-progress');
        const walker = jw.querySelector('.ap-jw-walker');
        const POS = [0, 33.333, 66.666, 100];

        const activate = (i) => {
            stops.forEach((s, j) => s.setAttribute('aria-pressed', String(j === i)));
            steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
            if (progress) progress.style.width = POS[i] + '%';
            if (walker) walker.style.left = POS[i] + '%';
        };
        stops.forEach((stop, i) => {
            stop.addEventListener('click', () => activate(i));
            stop.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
            });
        });
        steps.forEach((step, i) => step.addEventListener('click', () => activate(i)));
        activate(0);
    }

    // ---------- everything below needs GSAP + motion ----------
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('ap-js');

    const drawIn = (el) => { const len = el.getTotalLength(); gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }); };

    // ---------- HERO — winding path draws itself, dots + labels bloom ----------
    const heroPath = document.querySelector('.ap-hp-line');
    if (heroPath) {
        const dots = gsap.utils.toArray('.ap-hp-dot');
        const labels = gsap.utils.toArray('.ap-hp-label');
        drawIn(heroPath);
        gsap.set(dots, { scale: 0, transformOrigin: 'center' });
        gsap.set(labels, { opacity: 0 });
        const tl = gsap.timeline({ delay: 0.8 });
        tl.to(heroPath, { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' }, 0);
        dots.forEach((dot, i) => {
            tl.to(dot, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, 0.35 + i * 0.75);
            if (labels[i]) tl.to(labels[i], { opacity: 1, duration: 0.5 }, 0.45 + i * 0.75);
        });
        tl.from('.ap-scroll-cue', { opacity: 0, duration: 0.8 }, '>-0.3');
    }
    const aura = document.querySelector('.ap-hero-aura');
    if (aura) {
        gsap.to(aura, {
            yPercent: 24, opacity: 0.3, ease: 'none',
            scrollTrigger: { trigger: '.ap-hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
    }

    // ---------- ACT I — THE ROOTS (pinned): logo tree reveals the whole story ----------
    const roots = document.querySelector('.ap-act--roots');
    if (roots) {
        const treeLogo = roots.querySelector('.ap-tree-logo');
        const branchLabels = gsap.utils.toArray('.ap-tree-label--branch', roots);
        const rootLabels = gsap.utils.toArray('.ap-tree-label--root', roots);
        const transformation = roots.querySelector('.ap-tree-transformation');
        const lines = gsap.utils.toArray('.ap-reveal-line', roots);

        if (treeLogo) gsap.set(treeLogo, { opacity: 0, scale: 0.9, transformOrigin: '50% 58%' });
        gsap.set([branchLabels, rootLabels], { opacity: 0, scale: 0.88, transformOrigin: 'center' });
        if (transformation) gsap.set(transformation, { opacity: 0, x: 16 });
        gsap.set(lines, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: roots, start: 'top top', end: '+=150%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to(treeLogo, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0)
          .to(branchLabels, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.45, ease: 'back.out(1.7)' }, 0.35)
          .to(lines[0] || {}, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.45)
          .to(rootLabels, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.45, ease: 'back.out(1.7)' }, 1.1)
          .to(lines[1] || {}, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.25)
          .to(transformation, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, 1.75)
          .to(lines[2] || {}, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 2);
    }

    // ---------- ACT II — THE PATH (pinned, dark): a light walks the road ----------
    const pathAct = document.querySelector('.ap-act--path');
    if (pathAct) {
        const road = pathAct.querySelector('.ap-path-line');
        const walker = pathAct.querySelector('.ap-walker');
        const glows = gsap.utils.toArray('.ap-station-glow', pathAct);
        const cores = gsap.utils.toArray('.ap-station-core', pathAct);
        const labels = gsap.utils.toArray('.ap-station-label', pathAct);
        const moves = gsap.utils.toArray('.ap-move', pathAct);

        if (road) drawIn(road);
        gsap.set([glows, cores], { scale: 0, transformOrigin: 'center' });
        gsap.set(labels, { opacity: 0 });
        gsap.set(moves, { opacity: 0, y: 30 });
        if (walker) gsap.set(walker, { opacity: 0 });

        // hand-move the walker along the road (no MotionPathPlugin on this site)
        const prog = { t: 0 };
        const placeWalker = () => {
            if (!road || !walker) return;
            const len = road.getTotalLength();
            const pt = road.getPointAtLength(prog.t * len);
            gsap.set(walker, { attr: { cx: pt.x, cy: pt.y } });
        };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: pathAct, start: 'top top', end: '+=170%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to(road, { strokeDashoffset: 0, duration: 2.6, ease: 'none' }, 0);
        if (walker) {
            tl.to(walker, { opacity: 1, duration: 0.2 }, 0.05)
              .to(prog, { t: 1, duration: 2.6, ease: 'none', onUpdate: placeWalker }, 0);
        }
        // stations ignite as the walker reaches them (road thirds)
        [0.75, 1.6, 2.45].forEach((at, i) => {
            if (glows[i]) tl.to(glows[i], { scale: 1, duration: 0.5, ease: 'power2.out' }, at);
            if (cores[i]) tl.to(cores[i], { scale: 1, duration: 0.4, ease: 'back.out(2.6)' }, at + 0.05);
            if (labels[i]) tl.to(labels[i], { opacity: 1, duration: 0.4 }, at + 0.15);
            if (moves[i]) tl.to(moves[i], { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, at + 0.2);
        });
        placeWalker();
    }

    // ---------- SCIENCE & SOUL — two strands weave together ----------
    const blend = document.querySelector('.ap-blend');
    if (blend) {
        const strands = gsap.utils.toArray('.ap-strand', blend);
        const wdots = gsap.utils.toArray('.ap-weave-dot', blend);
        const wlabels = gsap.utils.toArray('.ap-weave-label', blend);
        strands.forEach(drawIn);
        gsap.set(wdots, { scale: 0, transformOrigin: 'center' });
        gsap.set(wlabels, { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: { trigger: blend, start: 'top 65%', end: 'center 45%', scrub: 0.7 },
        });
        tl.to(strands, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 0)
          .to(wlabels, { opacity: 1, stagger: 0.2, duration: 0.5 }, 0.2)
          .to(wdots, { scale: 1, stagger: 0.15, duration: 0.4, ease: 'back.out(2.4)' }, 0.9);
    }

    const journey = document.querySelector('.ap-journey');
    if (journey) {
        gsap.from('.ap-jw', {
            opacity: 0, y: 20, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: journey, start: 'top 70%' },
        });
        // Cards rise animation removed to prevent opacity: 0 bugs causing empty space
    }

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
