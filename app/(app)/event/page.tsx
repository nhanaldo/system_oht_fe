import Image from "next/image";

export default function EventPage() {
    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm p-10 flex flex-col items-center space-y-10">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-medium text-gray-900">
                        Chào mừng bạn đã đăng nhập thành công!
                    </h1>
                    <p className="text-gray-500">
                        Hệ thống quản lý nội bộ THACO INDUSTRIES
                    </p>
                </div>


            </div>
        </main>
    );
}
