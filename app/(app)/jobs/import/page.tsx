import JobContent from "./components/JobsContent";


export default function Page() {
    return (
        <div className="flex flex-col bg-white rounded-[20px] w-full h-full overflow-hidden p-4">
            <JobContent />
        </div>
    );
}
