// Daily reflection + mood — the 2-minute retention loop used by Stoic/Reflectly,
// reframed around ikigai.
import { todayKey } from 'lib/follow';

export const JOURNAL_KEY = 'ikigai.journal.v1';

export const MOODS = [
    { value: 1, emoji: '😞', label: 'Rough' },
    { value: 2, emoji: '😕', label: 'Low' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' }
];

export const DAILY_PROMPTS = [
    'What did you do today that felt most like you?',
    'When did you lose track of time recently?',
    'What is one small thing you are grateful for right now?',
    'What did you do today that someone else needed?',
    'Which of your strengths did you use well today?',
    'What would make tomorrow feel meaningful?',
    'What drained you today, and what might that be telling you?',
    'What is one small step toward your ikigai you could take tomorrow?',
    'Who did you help today, and how did it feel?',
    'What did you learn about yourself today?'
];

// Deterministic prompt per day, so it is stable within a date but rotates.
export function promptForDate(dateStr = todayKey()) {
    let h = 0;
    for (const ch of dateStr) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return DAILY_PROMPTS[h % DAILY_PROMPTS.length];
}

export function moodByValue(value) {
    return MOODS.find((m) => m.value === value) || null;
}
