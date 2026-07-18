// ============================================================
// INNER HARMONY — The Blueprints hub · "gateway gallery"
// Loaded ONLY on services.html. Interactive chooser works with plain JS;
// scroll reveals are progressive (GSAP optional).
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- INTERACTIVE "HELP ME CHOOSE" (no GSAP needed) ----------
    const chips = Array.from(document.querySelectorAll('.sv-chip'));
    const result = document.querySelector('.sv-result');
    if (chips.length && result) {
        const rLabel = result.querySelector('.sv-result-label');
        const rTitle = result.querySelector('h3');
        const rWhy = result.querySelector('p');
        const rLink = result.querySelector('a');
        const cards = Array.from(document.querySelectorAll('.sv-card'));

        const choose = (chip) => {
            chips.forEach(c => {
                const on = c === chip;
                c.classList.toggle('is-active', on);
                c.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            const name = chip.getAttribute('data-name');
            const href = chip.getAttribute('data-href');
            const cardId = chip.getAttribute('data-card');
            rLabel.textContent = 'A gentle suggestion';
            rTitle.textContent = name;
            rWhy.textContent = chip.getAttribute('data-why');
            rLink.setAttribute('href', href);
            rLink.innerHTML = 'Explore ' + name + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;vertical-align:-2px"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
            cards.forEach(card => card.classList.toggle('is-suggested', card.id === cardId));
        };
        chips.forEach(chip => {
            chip.addEventListener('click', () => choose(chip));
            chip.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(chip); }
            });
        });
    }

    if (!hasGSAP || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('sv-js');

    // ---------- staggered card reveals ----------
    const cards = gsap.utils.toArray('.sv-card');
    if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 40 });
        ScrollTrigger.batch(cards, {
            start: 'top 88%',
            onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1 }),
        });
    }

    // pillars reveal
    gsap.utils.toArray('.sv-pillar').forEach((p, i) => {
        gsap.from(p, {
            opacity: 0, y: 24, duration: 0.6, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: '.sv-pillars', start: 'top 80%' },
        });
    });

    // ---------- HERO — the constellation draws, stars pop, cue fades in ----------
    // (CSS twinkle lives on the inner <path>, so GSAP animates the <g> wrappers — no conflict)
    // (the arc is dotted, so a dashoffset draw-in won't work — wipe it in with a clip instead)
    const constLine = document.querySelector('.sv-const-line');
    const constStars = gsap.utils.toArray('.sv-const-star');
    if (constLine && constStars.length) {
        gsap.set(constLine, { clipPath: 'inset(-10% 100% -10% 0)' });
        gsap.set(constStars, { scale: 0, opacity: 0, transformOrigin: 'center' });
        const tl = gsap.timeline({ delay: 0.7 });
        tl.to(constLine, { clipPath: 'inset(-10% 0% -10% 0)', duration: 2, ease: 'power1.inOut' }, 0);
        constStars.forEach((star, i) => {
            tl.to(star, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }, 0.15 + i * 0.32);
        });
    }
    const svCue = document.querySelector('.sv-scroll-cue');
    if (svCue) gsap.from(svCue, { opacity: 0, duration: 1, delay: 1.7 });
    const svAura = document.querySelector('.sv-hero-aura');
    if (svAura) {
        gsap.to(svAura, {
            yPercent: 24, opacity: 0.3, ease: 'none',
            scrollTrigger: { trigger: '.sv-hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
    }

    ScrollTrigger.refresh();
})();
