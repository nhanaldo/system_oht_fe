import ActivitiesContent from "./components/activitiesContent";

export default function Page() {
    return (
        <div className="flex flex-col bg-white rounded-[20px] w-full h-full lg:overflow-hidden overflow-y-auto p-[20px]">
            <ActivitiesContent />
        </div>
    );
}