// Core ikigai model + logic. Pure functions — safe to import anywhere.

export const STORAGE_KEY = 'ikigai.v1';

// The four overlapping dimensions of ikigai.
export const DIMENSIONS = [
    {
        key: 'love',
        short: 'Love',
        label: 'What you love',
        emoji: '❤️',
        hex: '#fb7185',
        prompt: 'What could you do for hours and lose track of time?',
        question: 'Do you love doing it?'
    },
    {
        key: 'skill',
        short: 'Good at',
        label: "What you're good at",
        emoji: '⭐',
        hex: '#fbbf24',
        prompt: 'What feels effortless to you? What do people ask you for help with?',
        question: 'Are you good at it?'
    },
    {
        key: 'need',
        short: 'World needs',
        label: 'What the world needs',
        emoji: '🌍',
        hex: '#34d399',
        prompt: 'What problem or cause do you wish someone would solve?',
        question: 'Does the world need it?'
    },
    {
        key: 'pay',
        short: 'Paid for',
        label: 'What you can be paid for',
        emoji: '💰',
        hex: '#60a5fa',
        prompt: 'What would someone pay you to do — today or one day?',
        question: 'Can you be paid for it?'
    }
];

export const IKIGAI_HEX = '#f7d488';

export const DIMENSION_KEYS = DIMENSIONS.map((d) => d.key);

export function dimByKey(key) {
    return DIMENSIONS.find((d) => d.key === key);
}

// Classic pairwise overlaps (adjacent circles in the diagram).
export const OVERLAPS = {
    passion: { keys: ['love', 'skill'], label: 'Passion', blurb: 'You love it and you are good at it.' },
    mission: { keys: ['love', 'need'], label: 'Mission', blurb: 'You love it and the world needs it.' },
    profession: { keys: ['skill', 'pay'], label: 'Profession', blurb: 'You are good at it and can be paid for it.' },
    vocation: { keys: ['need', 'pay'], label: 'Vocation', blurb: 'The world needs it and you can be paid for it.' }
};

// A few seeds to lower the blank-page barrier during brainstorming.
export const EXAMPLES = ['Writing', 'Mentoring', 'Cooking', 'Coding', 'Gardening', 'Public speaking', 'Photography', 'Teaching'];

export function activeKeys(activity) {
    return DIMENSION_KEYS.filter((k) => activity[k]);
}

// The dimensions an activity is NOT yet hitting — used for gap guidance.
export function missingDims(activity) {
    return DIMENSIONS.filter((d) => !activity[d.key]);
}

// Classify an activity into a region of the ikigai diagram.
export function regionFor(activity) {
    const keys = activeKeys(activity);
    const n = keys.length;

    if (n === 4) return { id: 'ikigai', label: 'Ikigai', tier: 'ikigai' };

    if (n === 3) {
        const missing = DIMENSIONS.find((d) => !activity[d.key]);
        return { id: 'almost', label: 'Almost ikigai', tier: 'almost', missing };
    }

    if (n === 2) {
        const match = Object.entries(OVERLAPS).find(([, o]) => o.keys.every((k) => activity[k]));
        if (match) {
            return { id: match[0], label: match[1].label, tier: 'overlap', blurb: match[1].blurb };
        }
        // Non-adjacent pair (love+pay or skill+need): meaningful but unnamed.
        return { id: 'pair', label: 'Two areas', tier: 'overlap', keys };
    }

    if (n === 1) {
        const dim = dimByKey(keys[0]);
        return { id: keys[0], label: dim.short, tier: 'single', dim };
    }

    return { id: 'none', label: 'Not placed yet', tier: 'none' };
}

// Group all activities by tier for display.
export function summarize(activities = []) {
    const groups = { ikigai: [], almost: [], overlap: [], single: [], none: [] };
    for (const a of activities) {
        const region = regionFor(a);
        groups[region.tier].push({ ...a, region });
    }
    return groups;
}

export function regionCounts(activities = []) {
    const counts = {};
    for (const a of activities) {
        const id = regionFor(a).id;
        counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
}

export function newActivity(name) {
    const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : 'a' + Math.random().toString(36).slice(2);
    return { id, name: String(name).trim(), note: '', love: false, skill: false, need: false, pay: false };
}

// A realistic sample map (one true ikigai, plus near-misses and singles) so new
// users can see the payoff before doing the work.
export function buildExampleActivities() {
    const seed = [
        { name: 'Teaching workshops', note: 'I light up when explaining ideas to people.', love: true, skill: true, need: true, pay: true },
        { name: 'Writing essays', love: true, skill: true, need: true, pay: false },
        { name: 'Open-source coding', love: true, skill: true, need: false, pay: true },
        { name: 'Volunteering locally', love: true, skill: false, need: true, pay: false },
        { name: 'Data analysis', love: false, skill: true, need: true, pay: true },
        { name: 'Playing guitar', love: true, skill: false, need: false, pay: false }
    ];
    return seed.map((s) => ({ ...newActivity(s.name), ...s }));
}
