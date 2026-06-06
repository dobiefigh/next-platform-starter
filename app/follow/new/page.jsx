import { Suspense } from 'react';
import { NewGoalForm } from './new-goal-form';

export default function NewGoalPage() {
    return (
        <Suspense fallback={<p className="py-16 text-center text-white/50">Loading…</p>}>
            <NewGoalForm />
        </Suspense>
    );
}
