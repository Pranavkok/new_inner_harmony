(function () {
    // ── Lead Capture Config ───────────────────────────────────────
    // Google Apps Script Web App URL for lead capture and guide delivery
    const LEAD_CONFIG = {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzcRaFhGc8vV1OzAPVpm1FK5mnJCGXL-3muG_SEVG_rra4v9vc1zgoxQlN64lJ7gHugnw/exec',
    };

    const FALLBACK_ASSESSMENTS = [
        {
            title: 'Discover Your Inner Personality Archetype',
            description: 'Discover the archetype that reflects your strengths and natural patterns.',
            tallyLink: 'https://tally.so/r/440rQA',
            active: true,
            order: 1,
        },
    ];

    const ARCHETYPE_GUIDES = {
        achiever: {
            name: 'The Achiever',
            cover: 'documents/archetype-covers/the-achiever.jpg',
            pdf: 'documents/archetype-guides/the-achiever.pdf',
            pages: 18,
            medicine: 'Worth',
            description: 'For the part of you that knows how to succeed—and is learning that worth does not have to be earned.',
        },
        explorer: {
            name: 'The Explorer',
            cover: 'documents/archetype-covers/the-explorer.jpg',
            pdf: 'documents/archetype-guides/the-explorer.pdf',
            pages: 18,
            medicine: 'Freedom',
            description: 'For the part of you called toward freedom, discovery, and a life that feels genuinely your own.',
        },
        harmonizer: {
            name: 'The Harmonizer',
            cover: 'documents/archetype-covers/the-harmonizer.jpg',
            pdf: 'documents/archetype-guides/the-harmonizer.pdf',
            pages: 17,
            medicine: 'Harmony',
            description: 'For the part of you that creates peace for others—and is learning to include yourself in that harmony.',
        },
        nurturer: {
            name: 'The Nurturer',
            cover: 'documents/archetype-covers/the-nurturer.jpg',
            pdf: 'documents/archetype-guides/the-nurturer.pdf',
            pages: 18,
            medicine: 'Love',
            description: 'For the part of you that leads with love and is ready to receive the same care you so freely give.',
        },
        sage: {
            name: 'The Sage',
            cover: 'documents/archetype-covers/the-sage.jpg',
            pdf: 'documents/archetype-guides/the-sage.pdf',
            pages: 18,
            medicine: 'Wisdom',
            description: 'For the part of you that seeks truth, shares wisdom, and is learning to trust what you already know.',
        },
        visionary: {
            name: 'The Visionary',
            cover: 'documents/archetype-covers/the-visionary.jpg',
            pdf: 'documents/archetype-guides/the-visionary.pdf',
            pages: 18,
            medicine: 'Inspiration',
            description: 'For the part of you that sees beyond what exists and is ready to ground inspiration into a healing path.',
        },
    };

    const sheetMeta = document.querySelector('meta[name="assessments-sheet-csv"]');
    const sheetUrl = sheetMeta ? sheetMeta.content.trim() : '';
    const grid = document.getElementById('assessmentGrid');
    const status = document.getElementById('assessmentStatus');
    const viewer = document.getElementById('assessmentViewer');
    const unavailable = document.getElementById('assessmentUnavailable');
    const title = document.getElementById('activeAssessmentTitle');
    const description = document.getElementById('activeAssessmentDescription');
    const frame = document.getElementById('assessmentFrame');
    const loading = document.getElementById('assessmentLoading');
    const fallbackLink = document.getElementById('assessmentFallbackLink');
    const embed = document.getElementById('assessmentEmbed');
    const viewerFoot = document.querySelector('.as-viewer-foot');
    const result = document.getElementById('assessmentResult');
    const resultTitle = document.getElementById('assessmentResultTitle');
    const resultCopy = document.getElementById('assessmentResultCopy');
    const resultGrid = document.getElementById('assessmentResultGrid');
    const retake = document.getElementById('assessmentRetake');
    let activeFormId = '';

    function showStatus(message) {
        if (!status) return;
        status.textContent = message;
        status.hidden = !message;
    }

    function normalizeSheetUrl(value) {
        if (!value) return '';
        try {
            const url = new URL(value);
            if (url.hostname !== 'docs.google.com') return '';

            if (url.pathname.includes('/spreadsheets/d/e/') && url.pathname.endsWith('/pub')) {
                url.searchParams.set('output', 'csv');
                return url.toString();
            }

            const sheetId = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/)?.[1];
            if (!sheetId) return '';
            const gid = url.searchParams.get('gid') || '0';
            return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;
        } catch (_) {
            return '';
        }
    }

    function parseCsv(input) {
        const rows = [];
        let row = [];
        let cell = '';
        let quoted = false;

        for (let index = 0; index < input.length; index += 1) {
            const char = input[index];
            const next = input[index + 1];

            if (char === '"' && quoted && next === '"') {
                cell += '"';
                index += 1;
            } else if (char === '"') {
                quoted = !quoted;
            } else if (char === ',' && !quoted) {
                row.push(cell.trim());
                cell = '';
            } else if ((char === '\n' || char === '\r') && !quoted) {
                if (char === '\r' && next === '\n') index += 1;
                row.push(cell.trim());
                if (row.some(value => value !== '')) rows.push(row);
                row = [];
                cell = '';
            } else {
                cell += char;
            }
        }

        row.push(cell.trim());
        if (row.some(value => value !== '')) rows.push(row);
        return rows;
    }

    function normalizeHeader(value) {
        return value.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function parseActive(value) {
        const normalized = String(value || '').trim().toLowerCase();
        return !['false', 'no', '0', 'inactive', 'hidden'].includes(normalized);
    }

    function extractTallyId(link) {
        try {
            const url = new URL(link);
            if (!['tally.so', 'www.tally.so'].includes(url.hostname)) return '';
            const match = url.pathname.match(/^\/(?:r|embed)\/([a-z0-9]+)\/?$/i);
            return match ? match[1] : '';
        } catch (_) {
            return '';
        }
    }

    function rowsToAssessments(rows) {
        if (rows.length < 2) return [];
        const headers = rows[0].map(normalizeHeader);
        const indexOf = (...names) => headers.findIndex(header => names.includes(header));
        const titleIndex = indexOf('title', 'name', 'assessment');
        const descriptionIndex = indexOf('description', 'summary');
        const linkIndex = indexOf('tallylink', 'link', 'url', 'formlink');
        const activeIndex = indexOf('active', 'status', 'visible');
        const orderIndex = indexOf('order', 'sortorder', 'position');

        if (titleIndex < 0 || linkIndex < 0) return [];

        return rows.slice(1).map((row, index) => {
            const tallyLink = String(row[linkIndex] || '').trim();
            return {
                title: String(row[titleIndex] || '').trim(),
                description: descriptionIndex >= 0 ? String(row[descriptionIndex] || '').trim() : '',
                tallyLink,
                active: activeIndex < 0 || parseActive(row[activeIndex]),
                order: orderIndex >= 0 ? Number(row[orderIndex]) || index + 1 : index + 1,
                tallyId: extractTallyId(tallyLink),
            };
        }).filter(item => item.title && item.tallyId && item.active)
            .sort((a, b) => a.order - b.order);
    }

    function normalizeAssessments(items) {
        return items.map(item => ({ ...item, tallyId: item.tallyId || extractTallyId(item.tallyLink) }))
            .filter(item => item.title && item.tallyId && item.active !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    function createCard(item, index) {
        const link = document.createElement('a');
        link.className = 'as-card';
        link.href = `take-assessment.html?form=${encodeURIComponent(item.tallyId)}`;
        link.setAttribute('aria-label', `Begin ${item.title}`);

        const number = document.createElement('span');
        number.className = 'as-card-number';
        number.textContent = String(index + 1).padStart(2, '0');

        const label = document.createElement('span');
        label.className = 'as-card-label';
        label.textContent = 'Guided self-discovery';

        const meta = document.createElement('span');
        meta.className = 'as-card-meta';
        meta.append(number, label);

        const heading = document.createElement('h3');
        heading.textContent = item.title;

        const copy = document.createElement('p');
        copy.textContent = item.description || 'A guided assessment to help you understand yourself more clearly.';

        const action = document.createElement('span');
        action.className = 'as-card-action';
        action.append('Begin your assessment ');
        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';
        action.appendChild(arrow);

        link.append(meta, heading, copy, action);
        return link;
    }

    function renderDirectory(items) {
        if (!grid) return;
        grid.textContent = '';
        grid.classList.toggle('is-single', items.length === 1);
        items.forEach((item, index) => grid.appendChild(createCard(item, index)));

        if (!items.length) {
            showStatus('No assessments are available right now. Please check back soon.');
            return;
        }
        showStatus('');
    }

    function showUnavailable() {
        if (viewer) viewer.hidden = true;
        if (unavailable) unavailable.hidden = false;
        if (title) title.textContent = 'Assessment unavailable';
        if (description) description.textContent = 'Return to the collection and choose another reflection whenever you are ready.';
        document.title = 'Assessment Unavailable | INNER HARMONY';
    }

    // Archetype-specific teaser sentences (deliberately incomplete)
    const ARCHETYPE_TEASERS = {
        achiever:   'Your worth was never something you had to prove. You are already enough, and your path to healing begins with understanding that you are…',
        explorer:   'The freedom you seek has always lived within you. Your journey to wholeness begins when you realise that you are…',
        harmonizer: 'True harmony starts from within. Your deepest healing begins the moment you understand that you are…',
        nurturer:   'The love you pour into others belongs to you first. Your path to wholeness begins with the truth that you are…',
        sage:       'The wisdom you seek is already woven into who you are. Your healing begins when you trust that you are…',
        visionary:  'Your vision is not just a dream — it is a calling. Your healing journey begins with the realisation that you are…',
    };

    function createResultCard(key) {
        const guide = ARCHETYPE_GUIDES[key];
        if (!guide) return null;

        const card = document.createElement('article');
        card.className = 'as-result-card';

        // Cover — static teaser, NOT linked to the PDF
        const coverWrap = document.createElement('div');
        coverWrap.className = 'as-result-cover';

        const image = document.createElement('img');
        image.src = guide.cover;
        image.alt = `${guide.name} Healing Archetype guide cover`;
        image.width = 508;
        image.height = 720;
        coverWrap.appendChild(image);

        // Info panel
        const info = document.createElement('div');
        info.className = 'as-result-info';

        const category = document.createElement('span');
        category.className = 'as-result-category';
        category.textContent = 'Healing archetype';

        const heading = document.createElement('h3');
        heading.textContent = guide.name;

        const desc = document.createElement('p');
        desc.textContent = guide.description;

        const details = document.createElement('div');
        details.className = 'as-result-details';
        const medicine = document.createElement('span');
        medicine.textContent = `Healing medicine: ${guide.medicine}`;
        details.append(medicine);

        // Teaser / incomplete sentence
        const teaser = document.createElement('div');
        teaser.className = 'as-result-teaser';
        const teaserText = document.createElement('p');
        const teaserSentence = ARCHETYPE_TEASERS[key] || 'Your healing path begins with understanding that you are…';
        teaserText.innerHTML = `<em>&#8220;</em>${teaserSentence}`;
        teaser.appendChild(teaserText);

        // Gate / CTA
        const gate = document.createElement('div');
        gate.className = 'as-result-gate';

        const gateCopy = document.createElement('p');
        gateCopy.textContent = 'To receive your complete guide, fill in your details below.';

        const guideBtn = document.createElement('button');
        guideBtn.type = 'button';
        guideBtn.className = 'as-get-guide';
        guideBtn.dataset.archetypeKey = key;
        guideBtn.dataset.archetypeName = guide.name;
        guideBtn.dataset.pdfUrl = guide.pdf;
        guideBtn.innerHTML = 'Get My Guide <span aria-hidden="true">→</span>';
        guideBtn.addEventListener('click', () => openLeadModal(key, guide.name, guide.pdf));

        gate.append(gateCopy, guideBtn);
        info.append(category, heading, desc, details, teaser, gate);
        card.append(coverWrap, info);
        return card;
    }

    function getHighestScoringArchetypes(fields) {
        const scores = new Map();
        if (!Array.isArray(fields)) return [];

        fields.forEach(field => {
            if (!field || field.type !== 'CALCULATED_FIELDS') return;
            const match = String(field.title || '').trim().match(/^(Achiever|Explorer|Harmonizer|Nurturer|Sage|Visionary) Score$/i);
            const score = Number(field.answer?.value);
            if (match && Number.isFinite(score)) scores.set(match[1].toLowerCase(), score);
        });

        if (scores.size !== Object.keys(ARCHETYPE_GUIDES).length) return [];
        const highest = Math.max(...scores.values());
        return Array.from(scores.entries())
            .filter(([, score]) => score === highest)
            .map(([key]) => key);
    }

    function showAssessmentResult(keys) {
        if (!keys.length || !result || !resultGrid || !resultTitle || !resultCopy) return;

        resultGrid.textContent = '';
        const cards = keys.map(createResultCard).filter(Boolean);
        if (!cards.length) return;

        const names = keys.map(key => ARCHETYPE_GUIDES[key].name);
        const isBlend = names.length > 1;
        resultTitle.textContent = isBlend
            ? `Your result is a ${names.map(name => name.replace(/^The /, '')).join(' + ')} blend.`
            : `Your result is ${names[0]}.`;
        resultCopy.textContent = isBlend
            ? 'Your strongest scores are equal. Continue your reflection with both personal guides.'
            : 'Continue your reflection with the guide created for your strongest archetype.';
        resultGrid.classList.toggle('is-blend', isBlend);
        cards.forEach(card => resultGrid.appendChild(card));

        if (embed) embed.hidden = true;
        if (viewerFoot) viewerFoot.hidden = true;
        result.hidden = false;
        const positionResult = () => {
            const resultTop = result.getBoundingClientRect().top + window.scrollY - 110;
            window.scrollTo({ top: Math.max(0, resultTop), behavior: 'auto' });
        };
        positionResult();
        window.setTimeout(positionResult, 600);
    }

    function handleTallySubmission(event) {
        if (event.origin !== 'https://tally.so' || typeof event.data !== 'string' || !event.data.includes('Tally.FormSubmitted')) return;

        try {
            const payload = JSON.parse(event.data).payload;
            if (!payload || String(payload.formId).toLowerCase() !== activeFormId.toLowerCase()) return;
            showAssessmentResult(getHighestScoringArchetypes(payload.fields));
        } catch (_) {
            // Ignore unrelated cross-window messages.
        }
    }

    // ── Lead Capture Modal ────────────────────────────────────────
    const leadModal     = document.getElementById('leadCaptureModal');
    const leadModalForm = document.getElementById('leadModalForm');
    const leadSuccess   = document.getElementById('leadSuccess');
    const leadForm      = document.getElementById('leadForm');
    const leadError     = document.getElementById('leadError');
    const leadSubmit    = document.getElementById('leadSubmit');
    const leadModalClose    = document.getElementById('leadModalClose');
    const leadSuccessClose  = document.getElementById('leadSuccessClose');

    let currentArchetypeKey  = '';
    let currentArchetypeName = '';
    let currentPdfUrl        = '';

    function openLeadModal(key, name, pdfUrl) {
        currentArchetypeKey  = key;
        currentArchetypeName = name;
        currentPdfUrl        = pdfUrl;

        // Reset to form state
        if (leadSuccess)   leadSuccess.classList.remove('visible');
        if (leadModalForm) leadModalForm.hidden = false;
        if (leadError)     { leadError.textContent = ''; leadError.classList.remove('visible'); }
        if (leadForm)      leadForm.reset();
        if (leadSubmit)    leadSubmit.disabled = false;

        if (leadModal) {
            leadModal.hidden = false;
            document.body.style.overflow = 'hidden';
            // Focus first input for accessibility
            const firstInput = leadModal.querySelector('input');
            if (firstInput) window.setTimeout(() => firstInput.focus(), 60);
        }
    }

    function closeLeadModal() {
        if (leadModal) {
            leadModal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    async function submitLeadForm(event) {
        event.preventDefault();

        const name  = (document.getElementById('leadName')?.value  || '').trim();
        const email = (document.getElementById('leadEmail')?.value || '').trim();
        const phone = (document.getElementById('leadPhone')?.value || '').trim();

        // Basic validation
        if (!name) { showLeadError('Please enter your full name.'); return; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showLeadError('Please enter a valid email address.'); return; }

        if (!LEAD_CONFIG.scriptUrl || LEAD_CONFIG.scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
            showLeadError('The email service is not configured yet. Please contact us directly.');
            return;
        }

        if (leadSubmit) { leadSubmit.disabled = true; leadSubmit.textContent = 'Sending…'; }
        if (leadError)  { leadError.textContent = ''; leadError.classList.remove('visible'); }

        // Build absolute PDF URL so the email link works from any mail client
        const absolutePdfUrl = currentPdfUrl.startsWith('http')
            ? currentPdfUrl
            : `${window.location.origin}/${currentPdfUrl.replace(/^\//, '')}`;

        try {
            await fetch(LEAD_CONFIG.scriptUrl, {
                method:  'POST',
                mode:    'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    archetype: currentArchetypeName,
                    pdfUrl:    absolutePdfUrl,
                }),
            });

            // Show success
            if (leadModalForm) leadModalForm.hidden = true;
            if (leadSuccess)   leadSuccess.classList.add('visible');
            const closeBtn = document.getElementById('leadSuccessClose');
            if (closeBtn) window.setTimeout(() => closeBtn.focus(), 60);

        } catch (err) {
            showLeadError('Something went wrong. Please try again or contact us directly.');
            if (leadSubmit) { leadSubmit.disabled = false; leadSubmit.textContent = 'Send Me My Guide'; }
        }
    }

    function showLeadError(message) {
        if (!leadError) return;
        leadError.textContent = message;
        leadError.classList.add('visible');
        leadError.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Close modal on backdrop click
    if (leadModal) {
        leadModal.addEventListener('click', (e) => { if (e.target === leadModal) closeLeadModal(); });
    }
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && leadModal && !leadModal.hidden) closeLeadModal();
    });
    if (leadModalClose)   leadModalClose.addEventListener('click', closeLeadModal);
    if (leadSuccessClose) leadSuccessClose.addEventListener('click', closeLeadModal);
    if (leadForm)         leadForm.addEventListener('submit', submitLeadForm);

    function resetAssessment() {
        if (!frame || !result) return;
        result.hidden = true;
        if (embed) embed.hidden = false;
        if (viewerFoot) viewerFoot.hidden = false;
        frame.src = frame.dataset.tallySrc;
        embed?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }

    function renderViewer(items) {
        if (!viewer || !title || !description || !frame || !fallbackLink) return;
        const requestedId = new URLSearchParams(window.location.search).get('form') || '';
        const safeId = /^[a-z0-9]+$/i.test(requestedId) ? requestedId : '';
        const item = items.find(assessment => assessment.tallyId.toLowerCase() === safeId.toLowerCase());

        if (!item) {
            showUnavailable();
            return;
        }

        activeFormId = item.tallyId;
        title.textContent = item.title;
        description.textContent = item.description || 'Take your time and answer in the way that feels most true for you.';
        document.title = `${item.title} | INNER HARMONY`;
        fallbackLink.href = item.tallyLink;
        fallbackLink.setAttribute('aria-label', `Open ${item.title} in a new tab`);
        frame.title = item.title;
        frame.setAttribute(
            'data-tally-src',
            `https://tally.so/embed/${item.tallyId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`
        );
        if (loading) loading.hidden = false;
        frame.addEventListener('load', () => { if (loading) loading.hidden = true; }, { once: true });
        viewer.hidden = false;
        if (unavailable) unavailable.hidden = true;

        if (window.Tally && typeof window.Tally.loadEmbeds === 'function') {
            window.Tally.loadEmbeds();
        } else {
            frame.src = frame.dataset.tallySrc;
        }
    }

    function render(items) {
        const assessments = normalizeAssessments(items);
        renderDirectory(assessments);
        renderViewer(assessments);
    }

    async function loadAssessments() {
        const csvUrl = normalizeSheetUrl(sheetUrl);
        if (!csvUrl) {
            render(FALLBACK_ASSESSMENTS);
            return;
        }

        showStatus('Loading the available assessments…');
        try {
            const response = await fetch(csvUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Sheet request failed with ${response.status}`);
            const items = rowsToAssessments(parseCsv(await response.text()));
            if (!items.length) throw new Error('No valid active assessments were found');
            render(items);
        } catch {
            render(FALLBACK_ASSESSMENTS);
        }
    }

    window.addEventListener('message', handleTallySubmission);
    if (retake) retake.addEventListener('click', resetAssessment);
    loadAssessments();
})();
