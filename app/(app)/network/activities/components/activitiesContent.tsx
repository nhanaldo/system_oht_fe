'use client';
import React from 'react';
import ActivitiesMap from './ActivitiesMap';
import ActivitiesPanels from './ActivitiesPanels';

export default function ActivitiesContent() {
    return (
        <div className="h-full w-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden gap-4">
            {/* Left Column: Map */}
            <div className="w-full h-[400px] lg:h-full lg:flex-1 relative min-w-0">
                <ActivitiesMap />
            </div>
            {/* Right Column: Panels */}
            <div className="w-full lg:w-[420px] shrink-0 h-[480px] lg:h-full overflow-hidden flex flex-col">
                <ActivitiesPanels />
            </div>
        </div>
    );
}