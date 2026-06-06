'use client';

import { useRef, useState } from 'react';
import { applyBackup, clearAll, downloadBackup } from 'lib/backup';

export default function SettingsPage() {
    const fileRef = useRef(null);
    const [message, setMessage] = useState(null);

    function handleImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                applyBackup(JSON.parse(String(reader.result)));
                setMessage({ type: 'ok', text: 'Backup restored. Reloading…' });
                setTimeout(() => window.location.reload(), 700);
            } catch (err) {
                setMessage({ type: 'err', text: err.message || 'Could not read that file.' });
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    return (
        <div className="flex flex-col gap-8 py-4">
            <header className="flex flex-col gap-1">
                <h1>Data &amp; backup</h1>
                <p className="text-white/65">
                    Everything you enter stays on this device, in this browser. Back it up so you never lose it.
                </p>
            </header>

            {message && (
                <div
                    className={[
                        'rounded-xl px-4 py-3 text-sm ring-1',
                        message.type === 'ok' ? 'bg-primary/15 ring-primary/40 text-white' : 'bg-love/15 ring-love/40 text-white'
                    ].join(' ')}
                    role="status"
                >
                    {message.text}
                </div>
            )}

            <section className="surface flex flex-col gap-3">
                <h2 className="text-base font-semibold">Export</h2>
                <p className="text-sm text-white/65">Download a JSON file with your full ikigai map and follow data.</p>
                <button type="button" className="btn self-start" onClick={downloadBackup}>
                    Download backup
                </button>
            </section>

            <section className="surface flex flex-col gap-3">
                <h2 className="text-base font-semibold">Import</h2>
                <p className="text-sm text-white/65">Restore from a backup file. This replaces what is currently on this device.</p>
                <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
                <button type="button" className="btn btn-ghost self-start" onClick={() => fileRef.current?.click()}>
                    Choose backup file
                </button>
            </section>

            <section className="surface flex flex-col gap-3">
                <h2 className="text-base font-semibold">Reset</h2>
                <p className="text-sm text-white/65">Permanently delete your map, goals, habits, and check-ins on this device.</p>
                <button
                    type="button"
                    className="btn self-start bg-love text-white hover:bg-love/85"
                    onClick={() => {
                        if (window.confirm('Delete everything on this device? This cannot be undone.')) {
                            clearAll();
                            window.location.href = '/';
                        }
                    }}
                >
                    Delete all data
                </button>
            </section>
        </div>
    );
}
