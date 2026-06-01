import { Suspense } from "react";
import VideoContent from "./components/WorkflowContent";
import LoadingComponent from "@/components/ui/LoadingComponent";

export default function VideoPage() {
    return (
        <div className="flex flex-col bg-white rounded-[20px] w-full h-full overflow-hidden p-4">
            <Suspense fallback={<div className="flex items-center justify-center min-h-full w-full"><LoadingComponent /></div>}>
                <VideoContent />
            </Suspense>
        </div>
    );
}