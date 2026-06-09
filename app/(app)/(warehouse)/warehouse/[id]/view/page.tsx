'use client';
import React, { useEffect, useState } from "react";
import { Select, Tooltip } from "antd";
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import { WarehouseConfigProvider, useWarehouseConfig } from "../../[id]/components/WarehouseContext";
import WarehouseMap from "../../[id]/components/WarehouseMap";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";

const MapViewer: React.FC = () => {
    const { warehouseFloors, currentWarehouseFloorId, setCurrentWarehouseFloorId, setActiveTab } = useWarehouseConfig();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setActiveTab('position');
    }, [setActiveTab]);

    useEffect(() => {
        if (isFullscreen) {
            document.documentElement.classList.add('app-fullscreen-mode');
        } else {
            document.documentElement.classList.remove('app-fullscreen-mode');
        }
        // Phát sự kiện resize để bản đồ tự động căn chỉnh tỷ lệ tức thì
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
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#545454] font-medium truncate">Chọn tầng:</span>
                    <ModalThemeProvider>
                        <Select
                            className="w-48 !h-[35px]"
                            value={currentWarehouseFloorId}
                            onChange={(value) => setCurrentWarehouseFloorId(value)}
                            options={warehouseFloors.map(wf => ({
                                value: wf.id.toString(),
                                label: wf.name || `Tầng ${wf.floor_number}`
                            }))}
                        />
                    </ModalThemeProvider>
                </div>
                <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="flex items-center justify-center w-[35px] h-[35px] rounded-lg border border-gray-200 hover:border-[#076eb8] hover:text-[#076eb8] transition-all bg-white cursor-pointer shadow-sm text-gray-500 active:scale-95 outline-none focus:outline-none"
                    >
                        {isFullscreen ? <FullscreenExitOutlined className="text-[18px]" /> : <FullscreenOutlined className="text-[18px]" />}
                    </button>
                </Tooltip>
            </div>
            <div className="flex-1 min-h-0 relative w-full bg-[#F8FCFF]">
                <WarehouseMap />
            </div>
        </div>
    );
};

export default function WarehouseViewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const searchParams = useSearchParams();
    //Đọc thông số cấu hình bản đồ từ thanh địa chỉ (URL), nếu không có thì lấy giá trị mặc định, và chuyển nó thành số học
    const rows = parseInt(searchParams.get('rows') || '14', 10);
    const columns = parseInt(searchParams.get('columns') || '38', 10);

    return (
        <div className="flex flex-col h-full w-full bg-[#ffffff] p-4 rounded-xl min-h-0 overflow-hidden">
            <h2 className="text-[#373838] font-roboto font-medium text-[16px] mb-4 shrink-0">Xem thông tin bản đồ kho</h2>
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
