/* ============================================================
   INNER HARMONY — Assessment Registry

   This is the single source of truth for assessment links and
   service relationships.

   To activate an assessment:
   1. Paste its published Google Form URL into `formUrl`.
   2. Set `status` to "available".

   To show an assessment on one or more service pages, add their
   IDs to `services`. Leave the array empty for hub-only assessments.

   Service IDs:
   parenting | inner-potential | heal | reiki | empowered | career
   ============================================================ */

window.INNER_HARMONY_ASSESSMENTS = [
    {
        key: 'emotionalLoad',
        title: 'Emotional Load Check-In',
        label: 'Emotional well-being',
        category: 'wellbeing',
        time: '5–7 min',
        description: 'Notice the feelings, pressures, and patterns asking for your attention right now.',
        highlights: ['Current emotional load', 'Sources of inner pressure', 'What support may help'],
        services: ['heal'],
        formUrl: '',
        status: 'upcoming',
    },
    {
        key: 'parentingPattern',
        title: 'Parenting Pattern Reflection',
        label: 'Parenting insight',
        category: 'parenting',
        time: '8–10 min',
        description: 'Explore how you respond, connect, and communicate in everyday parenting moments.',
        highlights: ['Your natural parenting style', 'Connection under pressure', 'Patterns worth understanding'],
        services: ['parenting'],
        formUrl: '',
        status: 'upcoming',
    },
    {
        key: 'naturalPotential',
        title: 'Natural Potential Snapshot',
        label: 'Child strengths',
        category: 'potential',
        time: '7–9 min',
        description: 'Reflect on how your child learns, expresses curiosity, and comes alive naturally.',
        highlights: ['Learning preferences', 'Natural interests and energy', 'Strengths you may nurture'],
        services: ['inner-potential'],
        formUrl: '',
        status: 'upcoming',
    },
    {
        key: 'energyBalance',
        title: 'Energy Balance Reflection',
        label: 'Energy & balance',
        category: 'wellbeing',
        time: '5 min',
        description: 'See what may be draining your energy and where greater balance could begin.',
        highlights: ['Energy across daily life', 'Restoration and depletion', 'Your readiness for support'],
        services: ['reiki'],
        formUrl: '',
        status: 'upcoming',
    },
    {
        key: 'calmHome',
        title: 'Calm Home Check-In',
        label: 'Family connection',
        category: 'parenting',
        time: '6–8 min',
        description: 'Pause and notice the emotional rhythm, communication, and connection within your home.',
        highlights: ['The tone of daily interactions', 'Conflict and repair patterns', 'Where connection can deepen'],
        services: ['empowered'],
        formUrl: '',
        status: 'upcoming',
    },
    {
        key: 'careerDirection',
        title: 'Career Direction Snapshot',
        label: 'Career clarity',
        category: 'career',
        time: '8–10 min',
        description: 'Separate outside expectations from the strengths and work that genuinely fit you.',
        highlights: ['Interests and natural strengths', 'Values and work preferences', 'Where clarity is needed'],
        services: ['career'],
        formUrl: '',
        status: 'upcoming',
    },
];
