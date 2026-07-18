import React, { Suspense } from 'react';
import ActivitiesContent from './component/ActivitiesContent';
import LoadingComponent from '@/components/ui/LoadingComponent';

export default function MinitorPage() {
    return (
        <div className="w-full h-full overflow-hidden">
            <Suspense fallback={<div className="flex items-center justify-center min-h-full w-full"><LoadingComponent /></div>}>
                <ActivitiesContent />
            </Suspense>
        </div>
    );
}
