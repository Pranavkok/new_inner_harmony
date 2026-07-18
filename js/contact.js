// ============================================================
// INNER HARMONY — Contact · "The Letter"
// Loaded ONLY on contact.html. Progressive enhancement:
//  - `.ct-widgets` (warmth meter) works with plain JS, no GSAP needed
//  - `.ct-js` (motion) only with GSAP + no reduced-motion
// The form itself is handled by main.js (#contactForm) — untouched here.
// ============================================================

(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- WARMTH METER — hearts light up as the note takes shape ----------
    const form = document.getElementById('contactForm');
    const warmth = document.querySelector('.ct-warmth');
    if (form && warmth) {
        document.body.classList.add('ct-widgets');
        const hearts = Array.from(warmth.querySelectorAll('.ct-warmth-hearts span'));
        const text = warmth.querySelector('.ct-warmth-text');
        const fields = ['name', 'email', 'phone', 'service', 'message']
            .map((id) => form.querySelector('#' + id))
            .filter(Boolean);
        const MESSAGES = [
            'Your note is waiting to begin…',
            'A lovely start.',
            'It’s taking shape.',
            'Almost there…',
            'Nearly ready to send.',
            'Ready to send, whenever you are. ✨',
        ];

        const update = () => {
            const filled = fields.filter((f) => f.value.trim() !== '').length;
            hearts.forEach((h, i) => h.classList.toggle('is-lit', i < filled));
            if (text) text.textContent = MESSAGES[Math.min(filled, MESSAGES.length - 1)];
        };
        fields.forEach((f) => {
            f.addEventListener('input', update);
            f.addEventListener('change', update);
        });
        form.addEventListener('reset', () => setTimeout(update, 0));
        update();
    }

    // ---------- everything below needs GSAP + motion ----------
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    if (!hasGSAP || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('ct-js');

    const drawIn = (el) => { const len = el.getTotalLength(); gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }); };

    // ---------- HERO — the envelope opens, a letter rises ----------
    const env = document.querySelector('.ct-envelope');
    if (env) {
        const flap = env.querySelector('.ct-env-flap');
        const letter = env.querySelector('.ct-env-letter-group');
        const heart = env.querySelector('.ct-env-heart');

        const tl = gsap.timeline({ delay: 0.9 });
        tl.from(env, { opacity: 0, y: 26, duration: 0.8, ease: 'power2.out' }, 0);
        if (flap) tl.from(flap, { scaleY: -1, transformOrigin: '95px 52px', duration: 0.7, ease: 'power2.inOut' }, 0.7);
        if (letter) tl.from(letter, { y: 44, duration: 0.9, ease: 'power2.out' }, 1.2);
        if (heart) tl.from(heart, { scale: 0, transformOrigin: 'center', duration: 0.5, ease: 'back.out(2.6)' }, 1.8);
        tl.from('.ct-scroll-cue', { opacity: 0, duration: 0.8 }, '>-0.2');
    }
    const aura = document.querySelector('.ct-hero-aura');
    if (aura) {
        gsap.to(aura, {
            yPercent: 24, opacity: 0.3, ease: 'none',
            scrollTrigger: { trigger: '.ct-hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
    }

    // ---------- THE LETTER — info and paper drift in ----------
    const write = document.querySelector('.ct-write');
    if (write) {
        gsap.from('.ct-way', {
            opacity: 0, y: 26, stagger: 0.12, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: '.ct-ways', start: 'top 80%' },
        });
        gsap.from('.ct-paper', {
            opacity: 0, y: 48, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: '.ct-paper', start: 'top 78%' },
        });
        gsap.from('.ct-stamp', {
            opacity: 0, scale: 0.4, rotation: -14, duration: 0.6, ease: 'back.out(2)', delay: 0.5,
            scrollTrigger: { trigger: '.ct-paper', start: 'top 78%' },
        });
    }

    // ---------- WHAT HAPPENS NEXT — the thread draws ----------
    const next = document.querySelector('.ct-next');
    if (next) {
        const line = next.querySelector('.ct-next-line');
        const dots = gsap.utils.toArray('.ct-next-dot', next);
        const cards = gsap.utils.toArray('.ct-next-card', next);
        if (line) drawIn(line);
        gsap.set(dots, { scale: 0, transformOrigin: 'center' });
        gsap.set(cards, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
            scrollTrigger: { trigger: next, start: 'top 68%', end: 'center 50%', scrub: 0.7 },
        });
        if (line) tl.to(line, { strokeDashoffset: 0, ease: 'none', duration: 1.4 }, 0);
        dots.forEach((dot, i) => {
            tl.to(dot, { scale: 1, ease: 'back.out(2.4)', duration: 0.4 }, 0.25 + i * 0.45);
            if (cards[i]) tl.to(cards[i], { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 }, 0.25 + i * 0.45);
        });
    }

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
