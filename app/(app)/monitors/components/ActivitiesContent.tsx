'use client';
import React from 'react';
import ActivitiesMap from './ActivitiesMap';
import ActivitiesPanels from './ActivitiesPanels';

export default function ActivitiesContent() {
    return (
        <div className="w-full h-auto lg:h-full flex flex-col lg:flex-row gap-4 overflow-visible lg:overflow-hidden">
            {/* Left Column: Map */}
            <div className="w-full h-[400px] lg:h-full lg:flex-1 relative min-w-0">
                <ActivitiesMap />
            </div>
            {/* Right Column: Panels */}
            <div className="w-full lg:w-[420px] shrink-0 h-auto lg:h-full overflow-hidden flex flex-col">
                <ActivitiesPanels />
            </div>
        </div>
    );
}