// Export/import the full app state (ikigai map + follow data) as a single JSON file.
// Local-first data is fragile — this gives users a real backup they control.
import { STORAGE_KEY } from 'lib/ikigai';
import { FOLLOW_KEY } from 'lib/follow';

export const BACKUP_APP = 'ikigai';
export const BACKUP_VERSION = 1;

function readKey(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
        return null;
    }
}

export function buildBackup() {
    return {
        app: BACKUP_APP,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        ikigai: readKey(STORAGE_KEY),
        follow: readKey(FOLLOW_KEY)
    };
}

export function applyBackup(data) {
    if (!data || data.app !== BACKUP_APP) {
        throw new Error('That does not look like an Ikigai backup file.');
    }
    if (data.ikigai) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.ikigai));
    if (data.follow) localStorage.setItem(FOLLOW_KEY, JSON.stringify(data.follow));
}

export function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOLLOW_KEY);
}

export function downloadBackup() {
    const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ikigai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
