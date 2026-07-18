'use client';
import React, { useEffect, useState } from "react";
import { Select, Tooltip } from "antd";
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { WarehouseConfigProvider, useWarehouseConfig } from "../../[id]/components/WarehouseContext";
import WarehouseMap from "../../[id]/components/WarehouseMap";

const MapViewer: React.FC = () => {
    const { setActiveTab } = useWarehouseConfig();

    useEffect(() => {
        setActiveTab('route');
    }, [setActiveTab]);

    return (
        <div className="flex flex-row h-full w-full gap-4 p-4 bg-[#F8FCFF]">
            <div className="flex-[3] min-w-0 relative h-full rounded-xl border border-[#D6E4F0] overflow-hidden bg-white shadow-sm">
                <WarehouseMap />
            </div>

        </div>
    );
};

export default function WarehouseViewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    //Đọc thông số cấu hình bản đồ từ thanh địa chỉ (URL), nếu không có thì lấy giá trị mặc định, và chuyển nó thành số học
    const rows = parseInt(searchParams.get('rows') || '14', 10);
    const columns = parseInt(searchParams.get('columns') || '38', 10);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(err => console.error(err));
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen().catch(err => console.error(err));
            }
        }
    };

    useEffect(() => {
        if (isFullscreen) {
            document.documentElement.classList.add('app-fullscreen-mode');
        } else {
            document.documentElement.classList.remove('app-fullscreen-mode');
        }
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        return () => {
            document.documentElement.classList.remove('app-fullscreen-mode');
            window.dispatchEvent(new Event('resize'));
            clearTimeout(timer);
        };
    }, [isFullscreen]);

    return (
        <div className="flex flex-col h-full w-full bg-[#ffffff] p-4 rounded-xl min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 px-3 h-[35px] rounded-lg border border-gray-200 hover:border-[#076eb8] hover:text-[#076eb8] transition-all bg-white cursor-pointer shadow-sm text-gray-500 active:scale-95 outline-none focus:outline-none"
                    >
                        <img src="/icon.svg/back.svg" alt="Back" className="w-4 h-4" />
                        <span className="text-[14px] font-medium">Quay lại</span>
                    </button>
                    <h2 className="text-[#373838] font-roboto font-medium text-[16px] m-0">Xem thông tin bản đồ kho</h2>
                </div>
                <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="flex items-center justify-center w-[35px] h-[35px] rounded-lg border border-gray-200 hover:border-[#076eb8] hover:text-[#076eb8] transition-all bg-white cursor-pointer shadow-sm text-gray-500 active:scale-95 outline-none focus:outline-none"
                    >
                        {isFullscreen ? <FullscreenExitOutlined className="text-[18px]" /> : <FullscreenOutlined className="text-[18px]" />}
                    </button>
                </Tooltip>
            </div>
            <div className="flex-1 min-h-0 relative w-full rounded-lg overflow-hidden border border-[#D6E4F0]">
                <WarehouseConfigProvider
                    warehouseId={resolvedParams.id}
                    initialRows={rows}
                    initialColumns={columns}
                    readOnly={true}
                >
                    <MapViewer />
                </WarehouseConfigProvider>
            </div>
        </div>
    );
}
