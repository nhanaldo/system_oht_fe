"use client";
import ActivitiesContent from "./components/ActivitiesContent";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

export default function Page() {
    return (
        <div className="flex flex-col bg-white rounded-[20px] w-full h-full overflow-hidden p-[20px]">
            <OverlayScrollbarsComponent
                className="w-full h-full"
                options={{ scrollbars: { visibility: 'hidden', theme: 'os-theme-dark os-theme-hover' } }}
            >
                <ActivitiesContent />
            </OverlayScrollbarsComponent>
        </div>
    );
}