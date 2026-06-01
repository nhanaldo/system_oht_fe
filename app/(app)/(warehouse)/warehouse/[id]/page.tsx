"use client";
import { Suspense } from "react";
import ProfileContent from "./components/ProfileContent";
import LoadingComponent from "@/components/ui/LoadingComponent";
import { useParams, useSearchParams } from "next/navigation";

export default function WarehouseConfigPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-full w-full"><LoadingComponent /></div>}>
            <div className="flex flex-col h-full">
                <ProfileContent id={id} />
            </div>
        </Suspense>
    );
}
