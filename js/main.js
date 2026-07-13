// ============================================================
// INNER HARMONY — motion & interactions (multi-page safe)
// Every block guards for missing elements so one JS file
// serves every page without console errors.
// ============================================================

(function () {
    const hasGSAP = typeof gsap !== 'undefined';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ limitCallbacks: true });
    }

    // ---------- text splitting ----------
    function splitChars(el) {
        const text = el.textContent;
        el.textContent = '';
        el.setAttribute('aria-label', text);
        const chars = [];
        for (const ch of text) {
            const s = document.createElement('span');
            s.className = 'char';
            s.textContent = ch === ' ' ? ' ' : ch;
            el.appendChild(s);
            chars.push(s);
        }
        return chars;
    }
    function splitWords(el) {
        const spans = [];
        const walk = (node, parent) => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent.split(/(\s+)/).forEach(w => {
                    if (/^\s+$/.test(w)) parent.appendChild(document.createTextNode(' '));
                    else if (w.length) {
                        const outer = document.createElement('span'); outer.className = 'word';
                        const inner = document.createElement('span'); inner.className = 'word-inner';
                        inner.textContent = w; outer.appendChild(inner); parent.appendChild(outer);
                        spans.push(inner);
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const clone = document.createElement(node.tagName.toLowerCase());
                for (const attr of node.attributes) clone.setAttribute(attr.name, attr.value);
                parent.appendChild(clone);
                node.childNodes.forEach(c => walk(c, clone));
            }
        };
        const src = Array.from(el.childNodes);
        el.innerHTML = '';
        src.forEach(c => walk(c, el));
        return spans;
    }

    // ---------- reveal helpers ----------
    function batchReveal(selector, fromVars, toVars, opts = {}) {
        if (!hasGSAP) return;
        const els = gsap.utils.toArray(selector);
        if (!els.length) return;
        if (reduced) { gsap.set(els, toVars); return; }
        gsap.set(els, fromVars);
        ScrollTrigger.batch(els, {
            start: opts.start || 'top 88%',
            once: true,
            onEnter: (batch) => gsap.to(batch, {
                ...toVars,
                duration: toVars.duration || 0.9,
                ease: toVars.ease || 'power3.out',
                stagger: toVars.stagger || 0.12,
                overwrite: true,
            }),
        });
    }
    function reveal(trigger, targets, fromVars, toVars, opts = {}) {
        if (!hasGSAP) return;
        const els = typeof targets === 'string' ? gsap.utils.toArray(targets)
            : (targets instanceof Element ? [targets] : Array.from(targets));
        if (!els.length) return;
        if (reduced) { gsap.set(els, toVars); return; }
        gsap.set(els, fromVars);
        ScrollTrigger.create({
            trigger, start: opts.start || 'top 86%', once: true,
            onEnter: () => gsap.to(els, {
                ...toVars,
                duration: toVars.duration || 1,
                ease: toVars.ease || 'power3.out',
                stagger: toVars.stagger || 0,
                delay: toVars.delay || 0,
            }),
        });
    }

    // ---------- custom cursor ----------
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (hasGSAP && cursor && follower && window.innerWidth > 900 && !reduced) {
        let mx = 0, my = 0, cx = 0, cy = 0, fx = 0, fy = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        gsap.ticker.add(() => {
            cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
            fx += (mx - fx) * 0.09; fy += (my - fy) * 0.09;
            gsap.set(cursor, { x: cx - 3.5, y: cy - 3.5 });
            gsap.set(follower, { x: fx - 19, y: fy - 19 });
        });
        const hoverables = 'a, button, .btn, .service-card, .pillar-card, .faq-q, .magnetic';
        document.querySelectorAll(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
            el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
        });
    } else if (cursor && follower) {
        cursor.style.display = 'none'; follower.style.display = 'none';
    }

    // ---------- smooth in-page anchors ----------
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const t = document.querySelector(id);
            if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 84, behavior: 'smooth' }); }
        });
    });

    // ---------- hero title (chars) ----------
    const heroTitle = document.querySelector('.hero-title');
    if (hasGSAP && heroTitle && !reduced) {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.25 });
        heroTitle.querySelectorAll('.title-line').forEach(line => {
            const chars = splitChars(line);
            tl.from(chars, {
                yPercent: 120, opacity: 0, rotateZ: () => gsap.utils.random(-6, 6),
                duration: 1.1, stagger: { each: 0.028, from: 'start' }, ease: 'back.out(1.5)',
            }, tl.duration() > 0 ? '-=0.85' : 0);
        });
        tl.from('.hero-eyebrow', { y: 24, opacity: 0, duration: 0.9 }, 0)
          .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.9 }, '-=0.6')
          .from('.hero-buttons .btn', { y: 24, opacity: 0, duration: 0.8, stagger: 0.12 }, '-=0.55')
          .from('.hero-scroll', { opacity: 0, y: 16, duration: 0.6 }, '-=0.3');
    }

    // ---------- ambient orbs ----------
    if (hasGSAP && !reduced) {
        document.querySelectorAll('.orb').forEach((orb, i) => {
            gsap.to(orb, {
                y: `+=${gsap.utils.random(18, 40)}`, x: `+=${gsap.utils.random(-24, 24)}`,
                duration: gsap.utils.random(6, 10), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.6,
            });
            gsap.to(orb, {
                scrollTrigger: { trigger: orb.closest('.hero, .page-hero') || 'body', start: 'top top', end: 'bottom top', scrub: 0.6 },
                y: () => (parseFloat(orb.dataset.speed) || 0.2) * window.innerHeight * 0.6, ease: 'none',
            });
        });
    }

    // ---------- page-hero entrance (spring letter fall) ----------
    if (hasGSAP && !reduced) {
        const pageHero = document.querySelector('.page-hero');
        if (pageHero) {
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
            const breadcrumb = pageHero.querySelector('.breadcrumb');
            const sub = pageHero.querySelector('.page-hero-sub');
            const tm = pageHero.querySelector('.tm-line');
            const h1 = pageHero.querySelector('h1');

            if (breadcrumb) tl.from(breadcrumb, { y: 20, opacity: 0, duration: 0.7 }, 0);
            if (h1) {
                const titleHTML = h1.innerHTML;
                h1.innerHTML = titleHTML.replace(/(<br\s*\/?>|<em>.*?<\/em>|[^<]+)/g, (match) => {
                    if (match.startsWith('<em') || match.startsWith('<br')) return match;
                    return match.split('').map(ch => `<span class="hero-char">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
                });
                h1.querySelectorAll('em').forEach(em => {
                    em.innerHTML = em.textContent.split('').map(ch =>
                        `<span class="hero-char">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
                });
                tl.from(h1.querySelectorAll('.hero-char'), {
                    y: -80, opacity: 0, rotateZ: () => gsap.utils.random(-8, 8),
                    duration: 1, stagger: 0.025, ease: 'back.out(1.7)',
                }, breadcrumb ? '-=0.3' : 0);
            }
            if (sub) tl.from(sub, { y: 28, opacity: 0, duration: 0.85 }, '-=0.5');
            if (tm) tl.from(tm, { y: 22, opacity: 0, duration: 0.75 }, '-=0.55');
        }
    }

    // ---------- clip reveal for eyebrows ----------
    if (hasGSAP && !reduced) {
        document.querySelectorAll('.reveal-text').forEach(el => {
            gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
            ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true,
                onEnter: () => gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power3.inOut' }) });
        });
        document.querySelectorAll('.split-words').forEach(el => {
            const words = splitWords(el);
            ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
                onEnter: () => gsap.to(words, { y: 0, duration: 1, stagger: 0.06, ease: 'power4.out' }) });
        });
        document.querySelectorAll('.reveal-up').forEach(el => {
            gsap.set(el, { opacity: 0, y: 42 });
            ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true,
                onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }) });
        });
    } else {
        // reduced motion / no gsap — make sure hidden helpers are visible
        document.querySelectorAll('.reveal-text').forEach(el => el.style.clipPath = 'none');
        document.querySelectorAll('.split-words .word-inner').forEach(el => el.style.transform = 'none');
    }

    // ---------- card batches (richer stagger: rotation, scale, blur) ----------
    function richReveal(selector, opts = {}) {
        if (!hasGSAP) return;
        const els = gsap.utils.toArray(selector);
        if (!els.length) return;
        if (reduced) { gsap.set(els, { opacity: 1, y: 0, scale: 1, rotation: 0, filter: 'none' }); return; }
        gsap.set(els, {
            opacity: 0, y: opts.y || 60, scale: opts.scale || 0.92,
            rotation: opts.rotation || 2, filter: 'blur(6px)',
        });
        ScrollTrigger.batch(els, {
            start: opts.start || 'top 88%',
            once: true,
            onEnter: (batch) => gsap.to(batch, {
                opacity: 1, y: 0, scale: 1, rotation: 0, filter: 'blur(0px)',
                duration: opts.duration || 1,
                ease: opts.ease || 'power3.out',
                stagger: opts.stagger || 0.12,
                overwrite: true,
            }),
        });
    }
    // Skip cards handled by page-specific animations.js
    const bp = document.body.dataset.blueprint;
    if (bp !== 'heal' && bp !== 'home') richReveal('.service-card', { y: 60, stagger: 0.1 });
    if (bp !== 'heal' && bp !== 'career') richReveal('.pillar-card', { y: 60, rotation: 3, stagger: 0.14, start: 'top 100%' });
    if (bp !== 'approach') richReveal('.step-card', { y: 60, stagger: 0.14 });
    richReveal('.testimonial-card', { y: 50, stagger: 0.14 });
    if (bp !== 'career') richReveal('.audience-card', { y: 40, stagger: 0.09, start: 'top 100%' });
    batchReveal('.feature-list li', { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.07 }, { start: 'top 90%' });

    // ---------- split-content sections ----------
    document.querySelectorAll('.prose-grid').forEach(grid => {
        const visual = grid.querySelector('.prose-visual');
        const text = grid.querySelector('.prose');
        const reverse = grid.classList.contains('reverse');
        if (visual) reveal(grid, visual, { x: reverse ? 60 : -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 });
        if (text) reveal(grid, text, { x: reverse ? -60 : 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, delay: 0.12 });
    });

    // ---------- about section ----------
    reveal('.about-grid', '.portrait', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.15 });
    reveal('.about-grid', '.about-text', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.15, delay: 0.12 });

    // ---------- counters ----------
    if (hasGSAP) {
        document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-count'));
            counter.textContent = '0';
            ScrollTrigger.create({ trigger: counter, start: 'top 94%', once: true,
                onEnter: () => {
                    if (reduced) { counter.textContent = target; return; }
                    gsap.to(counter, { textContent: target, duration: 2, ease: 'power2.out',
                        snap: { textContent: 1 },
                        onUpdate() { counter.textContent = Math.round(parseFloat(counter.textContent)); } });
                } });
        });
    }

    // ---------- quote band (pin + parallax text) ----------
    if (hasGSAP && !reduced) {
        document.querySelectorAll('.quote-band').forEach(band => {
            const q = band.querySelector('.big-quote');
            if (!q) return;
            const lines = q.querySelectorAll('.quote-line');
            const items = lines.length ? lines : [q];
            gsap.set(items, { y: 40, opacity: 0 });
            ScrollTrigger.create({ trigger: q, start: 'top 86%', once: true,
                onEnter: () => gsap.to(items, { y: 0, opacity: 1, duration: 1, stagger: 0.14, ease: 'power4.out' }) });

            if (window.innerWidth > 860) {
                ScrollTrigger.create({
                    trigger: band,
                    start: 'top top',
                    end: '+=60%',
                    pin: true,
                    pinSpacing: true,
                });
                gsap.to(q, {
                    y: -40,
                    ease: 'none',
                    scrollTrigger: { trigger: band, start: 'top top', end: '+=60%', scrub: 0.5 },
                });
                const marks = band.querySelectorAll('.quote-mark');
                if (marks.length) {
                    gsap.to(marks, {
                        y: 30, opacity: 0.2,
                        ease: 'none',
                        scrollTrigger: { trigger: band, start: 'top top', end: '+=60%', scrub: 0.5 },
                    });
                }
            }
        });
    }

    // ---------- magnetic buttons + glow ripple on click ----------
    if (hasGSAP && window.innerWidth > 900 && !reduced) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.35, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' }));
            btn.addEventListener('click', e => {
                const ripple = document.createElement('span');
                ripple.className = 'btn-glow-ripple';
                const r = btn.getBoundingClientRect();
                ripple.style.left = `${e.clientX - r.left}px`;
                ripple.style.top = `${e.clientY - r.top}px`;
                btn.appendChild(ripple);
                gsap.fromTo(ripple, { scale: 0, opacity: 0.6 }, {
                    scale: 2.8, opacity: 0, duration: 0.65, ease: 'power2.out',
                    onComplete: () => ripple.remove(),
                });
            });
        });
    }

    // ---------- marquee scroll-scrub speed ----------
    if (hasGSAP && !reduced) {
        // Disabled fast scrub on scroll
    }

    // ---------- FAQ accordion ----------
    document.querySelectorAll('.faq-item').forEach(item => {
        const q = item.querySelector('.faq-q');
        const a = item.querySelector('.faq-a');
        if (!q || !a) return;
        q.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // close siblings within the same list
            const list = item.closest('.faq-list') || document;
            list.querySelectorAll('.faq-item.open').forEach(other => {
                if (other !== item) { other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
            });
            item.classList.toggle('open', !isOpen);
            a.style.maxHeight = isOpen ? null : a.scrollHeight + 'px';
        });
    });

    // ---------- contact form ----------
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form));
            if (!data.name || !data.email || !data.message) return showMsg('Please fill in your name, email and message.', 'error');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return showMsg('Please enter a valid email address.', 'error');
            const btn = form.querySelector('button[type="submit"]');
            const label = btn.textContent;
            btn.textContent = 'Sending…'; btn.disabled = true;
            setTimeout(() => {
                showMsg('Thank you for reaching out. Dr. Gargee will personally get back to you soon.', 'success');
                form.reset(); btn.textContent = label; btn.disabled = false;
            }, 1300);
        });
        function showMsg(text, type) {
            let el = form.querySelector('.form-message');
            if (el) el.remove();
            el = document.createElement('div');
            el.className = 'form-message form-message-' + type;
            el.textContent = text;
            form.appendChild(el);
            if (hasGSAP && !reduced) gsap.from(el, { y: 10, opacity: 0, duration: 0.4 });
            if (type === 'success') setTimeout(() => { if (el.parentNode) el.remove(); }, 6000);
        }
    }

    // ---------- refresh triggers after full load ----------
    window.addEventListener('load', () => { if (hasGSAP && typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); });
})();
