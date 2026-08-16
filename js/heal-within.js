// ============================================================
// INNER HARMONY — Heal Within · "The Reading"
// Cards begin face-down, then reveal their artwork through the pinned scroll
// story. FLIP controls remain available for direct interaction.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('hw-js');

    const spreadCards = Array.from(document.querySelectorAll('.hw-card--spread'));

    function syncButton(card, artworkVisible) {
        const button = document.querySelector(`[data-flip-card="${card.id}"]`);
        if (!button) return;
        button.setAttribute('aria-pressed', String(artworkVisible));
        button.textContent = artworkVisible ? 'SHOW BACK' : 'FLIP';
    }

    function setCardState(card, artworkVisible) {
        card._flipped = artworkVisible;
        card.classList.toggle('is-flipped', artworkVisible);
        syncButton(card, artworkVisible);
    }

    // Explicit controls also work when motion libraries are unavailable.
    document.querySelectorAll('[data-flip-card]').forEach(button => {
        const card = document.getElementById(button.dataset.flipCard);
        if (!card) return;
        setCardState(card, false);

        button.addEventListener('click', () => {
            const showArtwork = !card._flipped;
            const inner = card.querySelector('.hw-card-inner');
            setCardState(card, showArtwork);
            if (hasGSAP && !reduced) {
                gsap.to(inner, {
                    rotationY: showArtwork ? 360 : 180,
                    duration: 0.9,
                    ease: 'power2.inOut',
                });
            }
        });
    });

    // Reduced-motion visitors get readable artwork without forced movement.
    if (reduced) {
        document.querySelectorAll('.hw-card--hero, .hw-card--mirror, .hw-card--spread, .hw-card--mini')
            .forEach(card => setCardState(card, true));
        return;
    }

    // Without GSAP, retain the back-first state and reveal the spread manually.
    if (!hasGSAP) return;

    gsap.registerPlugin(ScrollTrigger);

    // ---------- drifting stars in the mirror and quote acts ----------
    function injectStars(container, count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('span');
            star.className = 'particle';
            star.style.left = `${gsap.utils.random(3, 97)}%`;
            star.style.top = `${gsap.utils.random(3, 97)}%`;
            star.style.width = star.style.height = `${gsap.utils.random(2, 4)}px`;
            container.appendChild(star);
            gsap.to(star, {
                x: `+=${gsap.utils.random(-16, 16)}`,
                y: `+=${gsap.utils.random(-24, 24)}`,
                opacity: gsap.utils.random(0.2, 0.9),
                duration: gsap.utils.random(3, 7),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: gsap.utils.random(0, 3),
            });
        }
    }
    document.querySelectorAll('.hw-act-stars').forEach(field => injectStars(field, 26));

    // ---------- opening card: magenta back first, artwork shortly after ----------
    const heroCard = document.querySelector('.hw-card--hero');
    if (heroCard) {
        setCardState(heroCard, false);
        gsap.delayedCall(2.2, () => setCardState(heroCard, true));
    }

    const mm = gsap.matchMedia();

    // ---------- mirror: pinned back-to-front reveal on desktop ----------
    const mirror = document.querySelector('.hw-act--mirror');
    if (mirror) {
        const mirrorCard = mirror.querySelector('.hw-card--mirror');
        const inner = mirrorCard.querySelector('.hw-card-inner');
        const lines = mirror.querySelectorAll('.hw-reveal-line');
        gsap.set(inner, { rotationY: 180, transformPerspective: 1400 });
        setCardState(mirrorCard, false);

        mm.add('(min-width: 901px)', () => {
            gsap.set(lines, { opacity: 0, y: 26 });
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: mirror,
                    start: 'top top',
                    end: '+=115%',
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    refreshPriority: 10,
                },
            });
            timeline.to(inner, {
                rotationY: 360,
                ease: 'none',
                duration: 1.4,
                onComplete: () => setCardState(mirrorCard, true),
                onReverseComplete: () => setCardState(mirrorCard, false),
            }, 0)
                .to(lines, { opacity: 1, y: 0, stagger: 0.4, ease: 'power2.out', duration: 1 }, 0.5);
        });

        mm.add('(max-width: 900px)', () => {
            gsap.set(lines, { opacity: 0, y: 26 });
            const timeline = gsap.timeline({
                scrollTrigger: { trigger: mirror, start: 'top 62%', once: true },
            });
            timeline.to(inner, {
                rotationY: 360,
                duration: 1.1,
                ease: 'power2.inOut',
                onComplete: () => setCardState(mirrorCard, true),
            }, 0)
                .to(lines, { opacity: 1, y: 0, stagger: 0.16, ease: 'power2.out', duration: 0.7 }, 0.35);
        });
    }

    // ---------- spread: pin and reveal Fool, Magician, Empress in order ----------
    const spread = document.querySelector('.hw-act--spread');
    if (spread && spreadCards.length) {
        const rail = spread.querySelector('.hw-spread-rail');
        const inners = spreadCards.map(card => card.querySelector('.hw-card-inner'));
        inners.forEach(inner => gsap.set(inner, { rotationY: 180, transformPerspective: 1400 }));
        spreadCards.forEach(card => setCardState(card, false));

        const addTurns = timeline => {
            inners.forEach((inner, index) => {
                timeline.to(inner, {
                    rotationY: 360,
                    duration: 1,
                    ease: 'none',
                    onComplete: () => setCardState(spreadCards[index], true),
                    onReverseComplete: () => setCardState(spreadCards[index], false),
                });
            });
        };

        mm.add('(min-width: 901px)', () => {
            const turnSpread = gsap.timeline({
                scrollTrigger: {
                    trigger: rail,
                    start: 'top 30%',
                    end: () => `+=${Math.max(window.innerHeight * 2.4, 1800)}`,
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.65,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });
            addTurns(turnSpread);
        });

        mm.add('(max-width: 900px)', () => {
            const turnSpread = gsap.timeline({
                scrollTrigger: { trigger: rail, start: 'top 76%', once: true },
            });
            addTurns(turnSpread);
        });
    }

    // ---------- audience deck: original hover/focus/click turn ----------
    document.querySelectorAll('.hw-card--mini').forEach(card => {
        const reveal = () => setCardState(card, true);
        card.addEventListener('mouseenter', reveal);
        card.addEventListener('click', reveal);
    });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
