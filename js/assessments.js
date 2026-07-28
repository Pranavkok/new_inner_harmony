/* ============================================================
   INNER HARMONY — Guided Assessments

   Assessment links and service relationships live in:
   js/assessment-data.js
   ============================================================ */

(function () {
    const registry = Array.isArray(window.INNER_HARMONY_ASSESSMENTS)
        ? window.INNER_HARMONY_ASSESSMENTS
        : [];

    const validExternalUrl = value => {
        if (!value) return false;
        try {
            const url = new URL(value);
            return url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    };

    const toast = document.querySelector('.assessment-toast');
    let toastTimer;

    document.querySelectorAll('.assessment-start').forEach(link => {
        const assessment = registry.find(item => item.key === link.dataset.formKey);
        const url = assessment?.formUrl;
        const label = link.querySelector('span');

        if (assessment?.status === 'available' && validExternalUrl(url)) {
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.removeAttribute('aria-disabled');
            link.classList.add('is-ready');
            if (label) label.textContent = 'Begin assessment';
            return;
        }

        link.addEventListener('click', event => {
            event.preventDefault();
            if (!toast) return;
            toast.classList.add('is-visible');
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
        });
    });

    const filters = Array.from(document.querySelectorAll('.assessment-filter'));
    const cards = Array.from(document.querySelectorAll('.assessment-card'));
    const count = document.querySelector('.assessment-count strong');

    filters.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.filter;

            filters.forEach(filter => {
                const active = filter === button;
                filter.classList.toggle('is-active', active);
                filter.setAttribute('aria-pressed', String(active));
            });

            let visible = 0;
            cards.forEach(card => {
                const show = category === 'all' || card.dataset.category === category;
                card.hidden = !show;
                if (show) visible += 1;
            });
            if (count) count.textContent = String(visible);

            if (typeof gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                gsap.fromTo(
                    cards.filter(card => !card.hidden),
                    { opacity: 0, y: 22, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.58, stagger: 0.07, ease: 'power3.out', overwrite: true }
                );
            }
        });
    });

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap === 'undefined' || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.12 })
        .from('.assessment-kicker', { opacity: 0, y: 18, duration: 0.7 })
        .from('.assessment-hero h1', { opacity: 0, y: 40, duration: 1 }, '-=0.34')
        .from('.assessment-hero-copy > p', { opacity: 0, y: 23, duration: 0.8 }, '-=0.52')
        .from('.assessment-hero-actions > *', { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 }, '-=0.45')
        .from('.assessment-trust span', { opacity: 0, y: 14, duration: 0.65, stagger: 0.08 }, '-=0.42')
        .from('.insight-orbit', { opacity: 0, scale: 0.82, rotation: -5, duration: 1.2, ease: 'back.out(1.3)' }, 0.25)
        .from('.orbit-node', { opacity: 0, scale: 0.65, duration: 0.75, stagger: 0.07, ease: 'back.out(1.7)' }, '-=0.75');

    gsap.to('.orbit-ring--outer', { rotation: 360, duration: 54, repeat: -1, ease: 'none' });
    gsap.to('.orbit-ring--inner', { rotation: -360, duration: 42, repeat: -1, ease: 'none' });
    gsap.to('.orbit-center', { y: -7, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    ScrollTrigger.batch('.assessment-card', {
        start: 'top 89%',
        once: true,
        onEnter: batch => gsap.fromTo(
            batch,
            { opacity: 0, y: 48, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out', overwrite: true }
        ),
    });

    gsap.from('.assessment-philosophy-grid > *', {
        scrollTrigger: { trigger: '.assessment-philosophy', start: 'top 78%', once: true },
        opacity: 0,
        y: 30,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
    });

    gsap.from('.assessment-process-grid article', {
        scrollTrigger: { trigger: '.assessment-process-grid', start: 'top 83%', once: true },
        opacity: 0,
        y: 38,
        duration: 0.8,
        stagger: 0.13,
        ease: 'power3.out',
    });
})();
