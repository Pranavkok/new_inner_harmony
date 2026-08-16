// ============================================================
// INNER HARMONY — About · "The person behind the practice"
// Loaded ONLY on about.html. Progressive enhancement: without GSAP or with
// reduced-motion the page is fully readable & static (stat counters are
// handled by main.js). No interactive controls to guard.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('ab-js');

    // ---------- HERO — roles line rises word by word, cue fades in ----------
    const roles = gsap.utils.toArray('.ab-roles span, .ab-roles i');
    const cue = document.querySelector('.ab-scroll-cue');
    if (roles.length) {
        gsap.set(roles, { opacity: 0, y: 18 });
        gsap.to(roles, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out', delay: 0.9 });
    }
    if (cue) {
        gsap.from(cue, { opacity: 0, duration: 1, ease: 'power1.out', delay: 1.7 });
    }
    const aura = document.querySelector('.ab-hero-aura');
    if (aura) {
        gsap.to(aura, {
            yPercent: 24, opacity: 0.3, ease: 'none',
            scrollTrigger: { trigger: '.ab-hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
    }

    // ---------- INTRO — portrait + copy soft entrance ----------
    const introFrame = document.querySelector('.ab-portrait-frame');
    if (introFrame) {
        gsap.from(introFrame, {
            opacity: 0, y: 54, duration: 1.1, ease: 'power2.out',
            scrollTrigger: { trigger: '.ab-intro', start: 'top 75%' },
        });
        gsap.from('.ab-portrait-badge', {
            opacity: 0, scale: 0.5, duration: 0.7, ease: 'back.out(2)', delay: 0.55,
            scrollTrigger: { trigger: '.ab-intro', start: 'top 75%' },
        });
        gsap.from(['.ab-pull', '.ab-intro-line', '.signature'], {
            opacity: 0, y: 26, stagger: 0.16, duration: 0.8, ease: 'power2.out', delay: 0.25,
            scrollTrigger: { trigger: '.ab-intro', start: 'top 70%' },
        });
    }

    // ---------- THE CORE BELIEF — pinned line reveal ----------
    const belief = document.querySelector('.ab-belief');
    if (belief) {
        const lines = belief.querySelectorAll('.ab-belief-line');
        const attrib = belief.querySelector('.ab-belief-attrib');
        gsap.set(lines, { opacity: 0.12, y: 20 });
        if (attrib) gsap.set(attrib, { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: belief, start: 'top top', end: '+=120%',
                pin: true, pinSpacing: true, scrub: 0.7, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to(lines, { opacity: 1, y: 0, stagger: 0.5, ease: 'power2.out', duration: 1 }, 0);
        if (attrib) tl.to(attrib, { opacity: 1, duration: 0.6 }, '>-0.2');
    }

    // ---------- THE BLEND — two worlds converge into understanding ----------
    const blend = document.querySelector('.ab-act--blend');
    if (blend) {
        const sci = blend.querySelector('.ab-c-sci');
        const heal = blend.querySelector('.ab-c-heal');
        const core = blend.querySelector('.ab-blend-core');
        const word = blend.querySelector('.ab-blend-word');
        const lines = blend.querySelectorAll('.ab-reveal-line');
        gsap.set(sci, { x: -78 });
        gsap.set(heal, { x: 78 });
        gsap.set([core, word], { opacity: 0, scale: 0.6, transformOrigin: '250px 180px' });
        gsap.set(lines, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: blend, start: 'top top', end: '+=140%',
                pin: true, pinSpacing: true, scrub: 0.8, anticipatePin: 1, refreshPriority: 10,
            },
        });
        tl.to([sci, heal], { x: 0, ease: 'power2.inOut', duration: 1.2 }, 0)
          .to(core, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.7 }, 0.8)
          .to(word, { opacity: 1, scale: 1, ease: 'back.out(1.7)', duration: 0.7 }, 1.0)
          .to(lines, { opacity: 1, y: 0, stagger: 0.35, ease: 'power2.out', duration: 0.9 }, 0.5);
    }

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
