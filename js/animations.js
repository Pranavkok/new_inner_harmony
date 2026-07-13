// ============================================================
// INNER HARMONY — page-specific motion (loaded after main.js)
// Each blueprint registers only when body[data-blueprint] matches.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasGSAP || reduced) return;

    const blueprint = document.body.dataset.blueprint || document.body.dataset.page;

    // ---------- shared helpers ----------
    function injectParticles(container, count, className) {
        if (!container) return [];
        const els = [];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = className || 'particle';
            p.style.left = `${gsap.utils.random(4, 96)}%`;
            p.style.top = `${gsap.utils.random(4, 96)}%`;
            p.style.animationDelay = `${gsap.utils.random(0, 4)}s`;
            p.style.animationDuration = `${gsap.utils.random(3, 7)}s`;
            container.appendChild(p);
            els.push(p);
        }
        return els;
    }

    function animateParticles(els, opts = {}) {
        els.forEach(el => {
            gsap.to(el, {
                y: `+=${gsap.utils.random(-30, 30)}`,
                x: `+=${gsap.utils.random(-20, 20)}`,
                opacity: gsap.utils.random(0.2, 0.9),
                duration: gsap.utils.random(3, 6),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: gsap.utils.random(0, 2),
                ...opts,
            });
        });
    }

    // ---------- Reiki: chakra pulse + energy particles ----------
    function initReiki() {
        document.querySelectorAll('.prose-visual--reiki, [data-visual="chakra"]').forEach(visual => {
            const rings = visual.querySelectorAll('.ring');
            const chakras = visual.querySelectorAll('.chakra-dot');

            gsap.to(rings, {
                scale: 1.06,
                opacity: 0.85,
                duration: 3.2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.4,
            });

            chakras.forEach((dot, i) => {
                gsap.to(dot, {
                    scale: 1.25,
                    opacity: 1,
                    duration: 2.4 + i * 0.15,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: i * 0.22,
                });
            });

            const field = visual.querySelector('.particle-field') || visual;
            const particles = injectParticles(field, 14, 'particle particle-energy');
            animateParticles(particles);
        });

        document.querySelectorAll('.section').forEach(section => {
            if (!section.querySelector('.pillar-card')) return;
            ScrollTrigger.create({
                trigger: section,
                start: 'top 75%',
                once: true,
                onEnter: () => {
                    const ripple = document.createElement('div');
                    ripple.className = 'scroll-ripple';
                    section.style.position = 'relative';
                    section.appendChild(ripple);
                    gsap.fromTo(ripple, { scale: 0, opacity: 0.5 }, {
                        scale: 3, opacity: 0, duration: 1.4, ease: 'power2.out',
                        onComplete: () => ripple.remove(),
                    });
                },
            });
        });
    }

    // ---------- Heal Within: tarot flip, stars, mandala ----------
    function initHealWithin() {
        const hero = document.querySelector('.page-hero');
        if (hero) {
            const stars = document.createElement('div');
            stars.className = 'star-field';
            hero.querySelector('.hero-orbs')?.appendChild(stars);
            const starEls = injectParticles(stars, 24, 'particle particle-star');
            animateParticles(starEls, { duration: gsap.utils.random(4, 8) });
        }

        document.querySelectorAll('.prose-visual--heal, [data-visual="mandala"]').forEach(visual => {
            const mandala = visual.querySelector('.mandala');
            if (mandala) {
                gsap.to(mandala, { rotate: 360, duration: 48, repeat: -1, ease: 'none' });
            }
            const card = visual.querySelector('.tarot-card');
            if (card) {
                gsap.to(card, {
                    rotateY: 8,
                    y: -6,
                    duration: 4,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            }
        });

        gsap.utils.toArray('.pillar-card').forEach((card, i) => {
            gsap.set(card, { transformPerspective: 800, rotationY: -18, opacity: 0, y: 50 });
            ScrollTrigger.create({
                trigger: card,
                start: 'top 88%',
                once: true,
                onEnter: () => gsap.to(card, {
                    rotationY: 0, opacity: 1, y: 0,
                    duration: 0.95, delay: i * 0.08, ease: 'back.out(1.4)',
                }),
            });
        });
    }

    // ---------- Career Compass: needle spin + path draw ----------
    function initCareerCompass() {
        document.querySelectorAll('.prose-visual--career, [data-visual="compass"]').forEach(visual => {
            const needle = visual.querySelector('.compass-needle');
            if (needle) {
                gsap.to(needle, {
                    rotation: 360,
                    duration: 14,
                    repeat: -1,
                    ease: 'none',
                    transformOrigin: '50% 50%',
                    svgOrigin: '12 12',
                });
            }
        });

        const pathSvg = document.querySelector('.pillar-path-svg');
        if (pathSvg) {
            const path = pathSvg.querySelector('.pillar-path-line');
            if (path) {
                const len = path.getTotalLength();
                gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
                ScrollTrigger.create({
                    trigger: pathSvg,
                    start: 'top 80%',
                    end: 'bottom 40%',
                    scrub: 0.8,
                    onUpdate: (self) => gsap.set(path, { strokeDashoffset: len * (1 - self.progress) }),
                });
            }
        }

        gsap.utils.toArray('.section').forEach(section => {
            if (!section.querySelector('.audience-card, .pillar-card')) return;
            ScrollTrigger.create({
                trigger: section,
                start: 'top 85%',
                once: true,
                onEnter: () => gsap.from(section.querySelectorAll('.audience-card, .pillar-card'), {
                    x: 80, opacity: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
                }),
            });
        });
    }

    // ---------- Parenting: heartbeat + grow ----------
    function initParenting() {
        document.querySelectorAll('.prose-visual--parenting, [data-visual="nurture"]').forEach(visual => {
            const heart = visual.querySelector('.nurture-heart');
            if (heart) {
                gsap.to(heart, {
                    scale: 1.12,
                    duration: 0.55,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                    repeatDelay: 0.35,
                });
            }
            visual.querySelectorAll('.bond-arc').forEach((arc, i) => {
                gsap.fromTo(arc, { strokeDashoffset: 200 }, {
                    strokeDashoffset: 0,
                    duration: 2,
                    delay: i * 0.3,
                    repeat: -1,
                    repeatDelay: 3,
                    ease: 'power2.inOut',
                });
            });
        });

        document.querySelectorAll('.pillar-icon').forEach(icon => {
            gsap.set(icon, { transformOrigin: '50% 50%' });
            ScrollTrigger.create({
                trigger: icon,
                start: 'top 90%',
                once: true,
                onEnter: () => gsap.fromTo(icon,
                    { scale: 0.4, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)' },
                ),
            });
        });
    }

    // ---------- Inner Potential: fingerprint spiral unfurl ----------
    function initInnerPotential() {
        document.querySelectorAll('.prose-visual--dmit, [data-visual="fingerprint"]').forEach(visual => {
            const spiral = visual.querySelector('.fingerprint-spiral');
            if (spiral) {
                const paths = spiral.querySelectorAll('path');
                paths.forEach((p, i) => {
                    const len = p.getTotalLength();
                    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
                    gsap.to(p, {
                        strokeDashoffset: 0,
                        duration: 2.2,
                        delay: i * 0.15,
                        ease: 'power2.inOut',
                    });
                });
                gsap.to(spiral, {
                    rotate: 6,
                    duration: 5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    transformOrigin: '50% 50%',
                });
            }
            visual.querySelectorAll('.neural-line').forEach((line, i) => {
                gsap.to(line, {
                    opacity: 0.9,
                    scaleX: 1,
                    duration: 1.8,
                    delay: i * 0.2,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    transformOrigin: 'left center',
                });
            });
        });
    }

    // ---------- Empowered Parent: warmth ripples ----------
    function initEmpoweredParent() {
        document.querySelectorAll('.prose-visual--empowered, [data-visual="home"]').forEach(visual => {
            const blocks = visual.querySelectorAll('.home-block');
            blocks.forEach((block, i) => {
                gsap.from(block, {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    delay: 0.2 + i * 0.15,
                    ease: 'back.out(1.6)',
                });
            });

            const rippleWrap = visual.querySelector('.warmth-ripples') || visual;
            for (let i = 0; i < 3; i++) {
                const r = document.createElement('span');
                r.className = 'warmth-ripple';
                rippleWrap.appendChild(r);
                gsap.fromTo(r,
                    { scale: 0.3, opacity: 0.5 },
                    { scale: 2.2, opacity: 0, duration: 3.5, repeat: -1, delay: i * 1.1, ease: 'power1.out' },
                );
            }
        });
    }

    // ---------- About: signature draw + stats pulse ----------
    function initAbout() {
        const sig = document.querySelector('.signature');
        if (sig) {
            const text = sig.textContent;
            sig.textContent = '';
            sig.classList.add('signature-draw');
            [...text].forEach((ch, i) => {
                const span = document.createElement('span');
                span.className = 'sig-char';
                span.textContent = ch;
                span.style.opacity = '0';
                sig.appendChild(span);
                gsap.to(span, {
                    opacity: 1,
                    duration: 0.08,
                    delay: 0.6 + i * 0.04,
                    ease: 'none',
                });
            });
        }

        document.querySelectorAll('.stat').forEach(stat => {
            ScrollTrigger.create({
                trigger: stat,
                start: 'top 92%',
                once: true,
                onEnter: () => gsap.fromTo(stat,
                    { scale: 0.85, opacity: 0.6 },
                    { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' },
                ),
            });
        });

        document.querySelectorAll('.timeline-item').forEach((item, i) => {
            gsap.set(item, { opacity: 0, x: -30 });
            ScrollTrigger.create({
                trigger: item,
                start: 'top 90%',
                once: true,
                onEnter: () => gsap.to(item, { opacity: 1, x: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out' }),
            });
        });
    }

    // ---------- Approach: pillar connector line ----------
    function initApproach() {
        const pathSvg = document.querySelector('.approach-path-svg');
        if (pathSvg) {
            const path = pathSvg.querySelector('.approach-path-line');
            if (path) {
                const len = path.getTotalLength();
                gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
                ScrollTrigger.create({
                    trigger: '.pillars-grid',
                    start: 'top 75%',
                    end: 'bottom 50%',
                    scrub: 0.6,
                    onUpdate: (self) => gsap.set(path, { strokeDashoffset: len * (1 - self.progress) }),
                });
            }
        }

        document.querySelectorAll('.step-card').forEach((card, i) => {
            ScrollTrigger.create({
                trigger: card,
                start: 'top 88%',
                once: true,
                onEnter: () => gsap.from(card, {
                    y: 40, opacity: 0, duration: 0.85, delay: i * 0.12, ease: 'power3.out',
                }),
            });
        });
    }

    // ---------- Home: whisper words + hero particles ----------
    function initHome() {
        const whisper = document.querySelector('.whisper-inner p');
        if (whisper) {
            const html = whisper.innerHTML;
            whisper.innerHTML = html.replace(/(<span[^>]*>.*?<\/span>|[^<]+)/g, (match) => {
                if (match.startsWith('<span')) return match;
                return match.split(/(\s+)/).map(w => {
                    if (/^\s+$/.test(w)) return w;
                    if (!w) return '';
                    return `<span class="whisper-word"><span class="whisper-word-inner">${w}</span></span>`;
                }).join('');
            });
            gsap.set('.whisper-word-inner', { y: 24, opacity: 0 });
            ScrollTrigger.create({
                trigger: whisper,
                start: 'top 85%',
                once: true,
                onEnter: () => gsap.to('.whisper-word-inner', {
                    y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out',
                }),
            });
        }

        const hero = document.querySelector('.hero');
        if (hero) {
            const field = document.createElement('div');
            field.className = 'hero-particle-field';
            hero.querySelector('.hero-orbs')?.appendChild(field);
            const particles = injectParticles(field, 20, 'particle particle-hero');
            animateParticles(particles, { duration: gsap.utils.random(5, 9) });

            document.querySelectorAll('.hero .orb').forEach((orb, i) => {
                gsap.to(orb, {
                    scale: 1.08,
                    duration: 4 + i,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            });
        }

        gsap.utils.toArray('.service-card').forEach((card, i) => {
            gsap.set(card, { transformOrigin: '50% 100%' });
            ScrollTrigger.create({
                trigger: card,
                start: 'top 90%',
                once: true,
                onEnter: () => gsap.from(card, {
                    y: 70, opacity: 0, scale: 0.92, rotation: 0,
                    duration: 0.95, delay: (i % 3) * 0.08, ease: 'back.out(1.3)',
                }),
            });
        });
    }

    const registry = {
        reiki: initReiki,
        heal: initHealWithin,
        career: initCareerCompass,
        parenting: initParenting,
        'inner-potential': initInnerPotential,
        empowered: initEmpoweredParent,
        about: initAbout,
        approach: initApproach,
        home: initHome,
    };

    if (registry[blueprint]) registry[blueprint]();
})();
