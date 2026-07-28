/* ============================================================
   INNER HARMONY — Reusable service assessment segment
   Renders zero, one, or many related assessments from the registry.
   ============================================================ */

(function () {
    const registry = Array.isArray(window.INNER_HARMONY_ASSESSMENTS)
        ? window.INNER_HARMONY_ASSESSMENTS
        : [];

    const validExternalUrl = value => {
        if (!value) return false;
        try {
            return new URL(value).protocol === 'https:';
        } catch (_) {
            return false;
        }
    };

    const escapeHTML = value => String(value || '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    })[character]);

    const cardMarkup = (assessment, index) => {
        const ready = assessment.status === 'available' && validExternalUrl(assessment.formUrl);
        const highlights = Array.isArray(assessment.highlights) ? assessment.highlights : [];
        const key = escapeHTML(assessment.key);

        return `
            <article class="service-assessment-card" data-assessment-key="${key}">
                <div class="service-assessment-card-top">
                    <span class="service-assessment-index">${String(index + 1).padStart(2, '0')}</span>
                    <span class="service-assessment-time">${escapeHTML(assessment.time)}</span>
                </div>
                <div class="service-assessment-symbol service-assessment-symbol--${key}" aria-hidden="true">
                    <span></span><span></span><span></span><i>✦</i>
                </div>
                <span class="service-assessment-label">${escapeHTML(assessment.label)}</span>
                <h3>${escapeHTML(assessment.title)}</h3>
                <p>${escapeHTML(assessment.description)}</p>
                <ul>
                    ${highlights.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
                </ul>
                <div class="service-assessment-action">
                    <div>
                        <strong>${ready ? 'Ready when you are' : 'Being thoughtfully prepared'}</strong>
                        <small>Hosted securely on Google Forms</small>
                    </div>
                    <a
                        class="service-assessment-button${ready ? ' is-ready' : ''}"
                        href="${ready ? escapeHTML(assessment.formUrl) : '#'}"
                        ${ready ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true"'}
                    >
                        ${ready ? 'Begin assessment' : 'Coming soon'}
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3h7v7M10 14L21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>
                    </a>
                </div>
            </article>`;
    };

    document.querySelectorAll('[data-service-assessments]').forEach(mount => {
        const serviceId = mount.dataset.serviceAssessments;
        const assessments = registry.filter(item =>
            Array.isArray(item.services) && item.services.includes(serviceId)
        );

        if (!assessments.length) {
            mount.hidden = true;
            return;
        }

        mount.innerHTML = `
            <section class="service-assessment-section${assessments.length > 1 ? ' is-multiple' : ' is-single'}">
                <div class="service-assessment-aura" aria-hidden="true"></div>
                <div class="container">
                    <div class="service-assessment-heading">
                        <div>
                            <span class="eyebrow reveal-text">A Reflection for This Journey</span>
                            <h2>Before the next step,<br><em>pause &amp; listen.</em></h2>
                        </div>
                        <div class="service-assessment-intro">
                            <span>✦</span>
                            <p>A short guided assessment can help you understand what is present, what you need, and where this journey might begin.</p>
                        </div>
                    </div>
                    <div class="service-assessment-list">
                        ${assessments.map(cardMarkup).join('')}
                    </div>
                    <div class="service-assessment-footnote">
                        <span>Not a diagnosis or a verdict—simply a thoughtful starting point.</span>
                        <a href="assessments.html">Explore all assessments <b>→</b></a>
                    </div>
                </div>
            </section>`;

        mount.querySelectorAll('[aria-disabled="true"]').forEach(link => {
            link.addEventListener('click', event => event.preventDefault());
        });

        if (window.location.hash === '#service-assessment') {
            window.requestAnimationFrame(() => mount.scrollIntoView({ block: 'start' }));
        }
    });

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap === 'undefined' || reduced) return;

    gsap.utils.toArray('.service-assessment-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 87%', once: true },
            opacity: 0,
            y: 48,
            scale: 0.97,
            duration: 0.85,
            delay: index * 0.08,
            ease: 'power3.out',
        });
    });
})();
