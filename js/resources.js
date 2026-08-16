/* ============================================================
   INNER HARMONY — Library interactions
   ============================================================ */

(function () {
    const cards = Array.from(document.querySelectorAll('.resource-card'));
    const toast = document.querySelector('.download-toast');
    let toastTimer;

    document.querySelectorAll('.js-resource-download').forEach(link => {
        link.addEventListener('click', () => {
            if (!toast) return;
            const title = link.dataset.resourceTitle || 'Your guide';
            const heading = toast.querySelector('strong');
            if (heading) heading.textContent = `${title} is on its way.`;
            toast.classList.add('is-visible');
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
        });
    });

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap === 'undefined' || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 })
        .from('.library-kicker', { opacity: 0, y: 20, duration: 0.7 })
        .from('.library-hero h1', { opacity: 0, y: 42, duration: 1 }, '-=0.35')
        .from('.library-hero-copy > p', { opacity: 0, y: 24, duration: 0.8 }, '-=0.55')
        .from('.library-hero-actions > *', { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 }, '-=0.45')
        .from('.library-hero-note', { opacity: 0, y: 18, duration: 0.7 }, '-=0.4')
        .from('.book', {
            opacity: 0,
            y: 70,
            rotation: 0,
            duration: 1.05,
            stagger: 0.13,
            ease: 'back.out(1.35)'
        }, 0.25)
        .from('.stack-caption', { opacity: 0, duration: 0.7 }, '-=0.25');

    gsap.to('.book--front', { y: -10, rotation: 3, duration: 4.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.book--middle', { y: 7, rotation: -8, duration: 5.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.library-aura', { scale: 1.08, opacity: 0.75, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    gsap.from('.featured-shell', {
        scrollTrigger: { trigger: '.featured-shell', start: 'top 82%', once: true },
        opacity: 0,
        y: 55,
        scale: 0.97,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.to('.featured-guide-stack', {
        scrollTrigger: { trigger: '.featured-read', start: 'top bottom', end: 'bottom top', scrub: 1 },
        y: -32,
        rotation: -1,
        ease: 'none'
    });

    ScrollTrigger.batch('.resource-card', {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.fromTo(batch,
            { opacity: 0, y: 48, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out', overwrite: true }
        )
    });
})();
