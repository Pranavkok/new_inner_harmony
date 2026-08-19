(function () {
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

    function createResultCard(key) {
        const guide = ARCHETYPE_GUIDES[key];
        if (!guide) return null;

        const card = document.createElement('article');
        card.className = 'as-result-card';

        const coverLink = document.createElement('a');
        coverLink.className = 'as-result-cover';
        coverLink.href = guide.pdf;
        coverLink.target = '_blank';
        coverLink.rel = 'noopener';
        coverLink.setAttribute('aria-label', `View ${guide.name} guide`);

        const image = document.createElement('img');
        image.src = guide.cover;
        image.alt = `${guide.name} Healing Archetype guide cover`;
        image.width = 508;
        image.height = 720;
        coverLink.appendChild(image);

        const info = document.createElement('div');
        info.className = 'as-result-info';

        const category = document.createElement('span');
        category.className = 'as-result-category';
        category.textContent = 'Healing archetype';

        const heading = document.createElement('h3');
        heading.textContent = guide.name;

        const description = document.createElement('p');
        description.textContent = guide.description;

        const details = document.createElement('div');
        details.className = 'as-result-details';
        const pages = document.createElement('span');
        pages.textContent = `PDF · ${guide.pages} pages`;
        const medicine = document.createElement('span');
        medicine.textContent = `Healing medicine: ${guide.medicine}`;
        details.append(pages, medicine);

        const links = document.createElement('div');
        links.className = 'as-result-links';

        const view = document.createElement('a');
        view.href = guide.pdf;
        view.target = '_blank';
        view.rel = 'noopener';
        view.append('View ');
        const viewArrow = document.createElement('span');
        viewArrow.setAttribute('aria-hidden', 'true');
        viewArrow.textContent = '↗';
        view.appendChild(viewArrow);

        const download = document.createElement('a');
        download.href = guide.pdf;
        download.download = `${key}-healing-archetype.pdf`;
        download.append('Download ');
        const downloadArrow = document.createElement('span');
        downloadArrow.setAttribute('aria-hidden', 'true');
        downloadArrow.textContent = '↓';
        download.appendChild(downloadArrow);

        links.append(view, download);
        info.append(category, heading, description, details, links);
        card.append(coverLink, info);
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
