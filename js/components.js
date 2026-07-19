/* ============================================================
   INNER HARMONY — shared chrome (navbar + footer)
   Injected on every page so nav/footer stay identical.
   Set the current page with  <body data-page="about">.
   ============================================================ */

(function () {
    // ---- Single source of truth for contact details ----
    // NOTE: placeholders — replace with real details before launch.
    const SITE = {
        phone1Display: '+91 91521 55022',
        phone1: '919152155022',
        phone2Display: '+91 99300 34340',
        phone2: '919930034340',
        whatsapp: '919152155022',
        email: 'Innerharmonywork@gmail.com',
        location: 'Thane, India',
        instagram: '#',
        facebook: '#',
        youtube: '#',
    };
    window.SITE = SITE;

    const waLink = (text) =>
        `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text || "Hello Dr. Gargee, I'd like to know more about INNER HARMONY.")}`;

    // ---- Service (Blueprint) directory — used in nav dropdown & footer ----
    const SERVICES = [
        { href: 'parenting-assessment.html', title: 'Parenting Assessment', sub: 'Understand your child better' },
        { href: 'inner-potential.html',      title: 'Inner Potential (DMIT)', sub: 'Natural strengths & learning' },
        { href: 'heal-within.html',          title: 'Heal Within',           sub: 'Tarot-informed emotional healing' },
        { href: 'reiki.html',                title: 'Reiki Blueprint',       sub: 'Deep healing & balance' },
        { href: 'empowered-parent.html',     title: 'Empowered Parent',      sub: 'Calmer, connected homes' },
        { href: 'career-compass.html',       title: 'Career Compass',        sub: 'Find your true direction' },
    ];

    const page = document.body.dataset.page || '';
    const customLogo = document.body.dataset.logo || 'images/logo.png';

    // ---------- Logo mark ----------
    const MARK = `<img src="${customLogo}" alt="INNER HARMONY Logo" class="nav-mark-img" style="width: 64px; height: 64px; object-fit: contain; border-radius: 50%;">`;

    // ---------- NAVBAR ----------
    const navHTML = `
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo" aria-label="INNER HARMONY home">
                ${MARK}
                <span class="logo-text">INNER HARMONY<small>Heal Within · Shine Beyond</small></span>
            </a>
            <ul class="nav-links">
                <li><a href="index.html" data-nav="home">Home</a></li>
                <li><a href="about.html" data-nav="about">About</a></li>
                <li><a href="approach.html" data-nav="approach">Approach</a></li>
                <li class="nav-item-has-drop">
                    <a href="services.html" data-nav="services" class="nav-drop-toggle">Blueprints
                        <svg width="11" height="7" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1l5 5 5-5"/></svg>
                    </a>
                    <div class="nav-dropdown">
                        ${SERVICES.map(s => `<a href="${s.href}">${s.title}<small>${s.sub}</small></a>`).join('')}
                    </div>
                </li>
                <li><a href="faq.html" data-nav="faq">FAQ</a></li>
                <li><a href="contact.html" class="nav-cta">Book a Conversation</a></li>
            </ul>
            <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
            <ul class="mobile-nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="approach.html">Approach</a></li>
                <li><a href="services.html">Blueprints</a></li>
                <li><a href="faq.html">FAQ</a></li>
                <li><a href="contact.html">Book a Conversation</a></li>
            </ul>
            <p class="mobile-tagline">Heal Within. Shine Beyond.</p>
        </div>
    </div>`;

    // ---------- FOOTER ----------
    const year = document.body.dataset.year || '2026';
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <a href="index.html" class="nav-logo" style="margin-bottom:6px">
                        ${MARK}
                        <span class="logo-text" style="color:var(--cream)">INNER HARMONY<small>Heal Within · Shine Beyond</small></span>
                    </a>
                    <p>A compassionate, non-judgemental space to understand yourself, heal from within, and create lasting transformation, guided by Dr. Gargee Gadgil.</p>

                    <div class="footer-social">
                        <a href="${SITE.instagram}" aria-label="Instagram"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg></a>
                        <a href="${SITE.facebook}" aria-label="Facebook"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                        <a href="${SITE.youtube}" aria-label="YouTube"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.5-.4-5.2a2.6 2.6 0 0 0-1.8-1.8C19 4.5 12 4.5 12 4.5s-7 0-8.8.5A2.6 2.6 0 0 0 1.4 6.8C1 8.5 1 12 1 12s0 3.5.4 5.2a2.6 2.6 0 0 0 1.8 1.8c1.8.5 8.8.5 8.8.5s7 0 8.8-.5a2.6 2.6 0 0 0 1.8-1.8C23 15.5 23 12 23 12ZM10 15.5v-7l6 3.5Z"/></svg></a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Explore</h4>
                    <ul>
                        <li><a href="about.html">About Dr. Gargee</a></li>
                        <li><a href="approach.html">Our Approach</a></li>
                        <li><a href="services.html">All Blueprints</a></li>
                        <li><a href="faq.html">FAQ</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Blueprints</h4>
                    <ul>
                        ${SERVICES.map(s => `<li><a href="${s.href}">${s.title}</a></li>`).join('')}
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Get in Touch</h4>
                    <ul>
                        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
                        <li><a href="tel:+${SITE.phone1}">${SITE.phone1Display}</a></li>
                        <li><a href="tel:+${SITE.phone2}">${SITE.phone2Display}</a></li>
                        <li>${SITE.location}</li>
                        <li><a href="${waLink()}" target="_blank" rel="noopener">Chat on WhatsApp</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${year} INNER HARMONY · Dr. Gargee Gadgil. All rights reserved.</p>
                <p>Heal Within. Shine Beyond.™</p>
            </div>
        </div>
    </footer>
    <a href="${waLink()}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>`;

    // ---------- INJECT ----------
    const navMount = document.getElementById('site-nav');
    const footMount = document.getElementById('site-footer');
    if (navMount) navMount.innerHTML = navHTML;
    if (footMount) footMount.innerHTML = footerHTML;

    // Highlight active nav item
    document.querySelectorAll('.nav-links [data-nav]').forEach(a => {
        if (a.dataset.nav === page) a.classList.add('active');
    });

    // Wire up any element with class .js-wa to the WhatsApp deep-link
    document.querySelectorAll('.js-wa').forEach(el => {
        el.setAttribute('href', waLink(el.dataset.waText));
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
    });
    // Fill any e-mail / tel placeholders
    document.querySelectorAll('[data-fill="email"]').forEach(el => { el.textContent = SITE.email; if (el.tagName === 'A') el.href = 'mailto:' + SITE.email; });
    document.querySelectorAll('[data-fill="phone"]').forEach(el => {
        el.textContent = SITE.phone1Display;
        if (el.tagName === 'A') el.href = 'tel:+' + SITE.phone1;
        const second = document.createElement(el.tagName === 'A' ? 'a' : 'span');
        second.textContent = SITE.phone2Display;
        second.style.display = 'block';
        if (second.tagName === 'A') second.href = 'tel:+' + SITE.phone2;
        el.insertAdjacentElement('afterend', second);
    });
    document.querySelectorAll('[data-fill="location"]').forEach(el => { el.textContent = SITE.location; });

    // ---------- NAV INTERACTIONS ----------
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    const onScroll = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('active');
            hamburger.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', String(open));
            document.body.style.overflow = open ? 'hidden' : '';
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }
})();
