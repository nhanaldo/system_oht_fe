'use client';
import React, { useState, useEffect } from 'react';
import { Select, Spin, ConfigProvider, Tooltip } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { getWarehouse } from '@/app/(app)/(warehouse)/warehouse/warehouseAcction';
import { WarehouseConfigProvider, useWarehouseConfig } from '@/app/(app)/(warehouse)/warehouse/[id]/components/WarehouseContext';
import WarehouseMap from '@/app/(app)/(warehouse)/warehouse/[id]/components/WarehouseMap';

interface ActivitiesMapInnerProps {
    warehouses: any[];
    selectedWarehouseId: string;
    onWarehouseChange: (id: string) => void;
    isFullscreen: boolean;
    setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActivitiesMapInner: React.FC<ActivitiesMapInnerProps> = ({
    warehouses,
    selectedWarehouseId,
    onWarehouseChange,
    isFullscreen,
    setIsFullscreen
}) => {
    const { warehouseFloors, currentWarehouseFloorId, setCurrentWarehouseFloorId, setActiveTab } = useWarehouseConfig();

    useEffect(() => {
        setActiveTab('position');
    }, [setActiveTab]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header: Giám sát hoạt động bên trái, Chọn Kho (nếu fullscreen), Chọn Tầng và Toàn màn hình bên phải */}
            <div className="flex justify-between items-center mb-[10px] shrink-0">
                <h2 className="text-[16px] font-medium text-[#484848] truncate">Giám sát hoạt động</h2>
                <div className="flex items-center gap-2">
                    {/* Hộp chọn kho chỉ xuất hiện khi phóng to toàn màn hình */}
                    {isFullscreen && (
                        <div className="flex items-center gap-2 mr-2">
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Select: {
                                            colorText: '#076eb8',
                                            colorPrimary: '#0367CC',
                                            controlHeight: 32,
                                            fontSize: 14,
                                            borderRadius: 6,
                                        },
                                    },
                                }}
                            >
                                <Select
                                    className="!w-[160px] !h-[32px]"
                                    value={selectedWarehouseId}
                                    onChange={onWarehouseChange}
                                    options={warehouses.map(w => ({
                                        value: w.id.toString(),
                                        label: w.name || `Kho ${w.code || w.id}`
                                    }))}
                                    placeholder="Chọn kho"
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ width: 12, height: 12, filter: 'invert(30%) sepia(90%) saturate(2000%) hue-rotate(186deg) brightness(90%) contrast(100%)' }} />}
                                    style={{
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        lineHeight: '100%',
                                        color: '#076eb8',
                                        border: "0.5px solid rgba(3, 103, 204, 0.3)",
                                        borderRadius: '6px'
                                    }}
                                />
                            </ConfigProvider>
                        </div>
                    )}

                    <ConfigProvider
                        theme={{
                            components: {
                                Select: {
                                    colorText: '#076eb8',
                                    colorPrimary: '#0367CC',
                                    controlHeight: 32,
                                    fontSize: 14,
                                    borderRadius: 6,
                                },
                            },
                        }}
                    >
                        <Select
                            className="!w-[103px] !h-[32px] "
                            value={currentWarehouseFloorId}
                            onChange={(value) => setCurrentWarehouseFloorId(value)}
                            options={warehouseFloors.map(wf => ({
                                value: wf.id.toString(),
                                label: wf.name ? wf.name.replace(/Floor/gi, 'Tầng') : `Tầng ${wf.floor_number}`
                            }))}
                            placeholder="Chọn tầng"
                            suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ width: 12, height: 12, filter: 'invert(30%) sepia(90%) saturate(2000%) hue-rotate(186deg) brightness(90%) contrast(100%)' }} />}
                            style={{
                                fontWeight: 600,
                                fontSize: '14px',
                                lineHeight: '100%',
                                color: '#076eb8',
                                border: "0.5px solid rgba(3, 103, 204, 0.3)",
                                borderRadius: '6px'
                            }}
                        />
                    </ConfigProvider>
                    <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="flex items-center justify-center w-[32px] h-[32px] rounded-lg border border-[rgba(3,103,204,0.3)] hover:border-[#076eb8] text-[#076eb8] hover:bg-[#e6f4ff] transition-all bg-white cursor-pointer shadow-sm active:scale-95 outline-none focus:outline-none"
                        >
                            {isFullscreen ? <FullscreenExitOutlined className="text-[16px]" /> : <FullscreenOutlined className="text-[16px]" />}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Khung sơ đồ bản đồ thật */}
            <div className="flex-1 min-h-0 relative w-full bg-[#F8FCFF] rounded-lg overflow-hidden border border-[#D6E4F0] shadow-sm">
                <WarehouseMap />
            </div>
        </div>
    );
};

export default function ActivitiesMap() {
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [warehouseRows, setWarehouseRows] = useState<number>(14);
    const [warehouseCols, setWarehouseCols] = useState<number>(38);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const warehousesRef = React.useRef<any[]>([]);
    const selectedIdRef = React.useRef<string>('');

    useEffect(() => {
        warehousesRef.current = warehouses;
    }, [warehouses]);

    useEffect(() => {
        selectedIdRef.current = selectedWarehouseId;
    }, [selectedWarehouseId]);

    // Đồng bộ class toàn màn hình lên thẻ root HTML
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

    // Đọc ID kho đã chọn từ cookie selectedWarehouseId của website header
    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return '';
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
        return '';
    };

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                setLoading(true);
                const res: any = await getWarehouse({ page: 1, limit: 100 });
                const elements = res?.elements || res?.data || res?.rows || (Array.isArray(res) ? res : []);
                setWarehouses(elements);

                if (elements.length > 0) {
                    const cookieId = getCookie('selectedWarehouseId');
                    const activeWarehouse = elements.find((w: any) => w.id?.toString() === cookieId) || elements[0];

                    setSelectedWarehouseId(activeWarehouse.id.toString());
                    setWarehouseRows(activeWarehouse.row || 14);
                    setWarehouseCols(activeWarehouse.column || 38);
                }
            } catch (err) {
                console.error("Failed to load warehouses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouses();
    }, []);

    // Polling để phát hiện thay đổi cookie selectedWarehouseId từ website header và cập nhật map tức thì
    useEffect(() => {
        const interval = setInterval(() => {
            const cookieId = getCookie('selectedWarehouseId');
            if (cookieId && cookieId !== selectedIdRef.current && warehousesRef.current.length > 0) {
                const activeWarehouse = warehousesRef.current.find((w: any) => w.id?.toString() === cookieId);
                if (activeWarehouse) {
                    setSelectedWarehouseId(activeWarehouse.id.toString());
                    setWarehouseRows(activeWarehouse.row || 14);
                    setWarehouseCols(activeWarehouse.column || 38);
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col relative h-full min-h-[300px] justify-center items-center bg-[#eff7ff] rounded-lg border border-[rgba(3,103,204,0.3)] shadow-[0px_4px_12px_rgba(3,103,204,0.15)]">
                <Spin description="Đang tải giám sát hoạt động..." size="large" />
            </div>
        );
    }

    if (!selectedWarehouseId) {
        return (
            <div className="flex flex-col relative h-full min-h-[300px] justify-center items-center bg-[#eff7ff] rounded-lg border border-[rgba(3,103,204,0.3)] shadow-[0px_4px_12px_rgba(3,103,204,0.15)]">
                <span className="text-gray-500 font-medium">Không tìm thấy thông tin kho hàng nào trên hệ thống.</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col relative h-full w-full">
            <WarehouseConfigProvider
                key={selectedWarehouseId} // Force remount context provider khi đổi kho
                warehouseId={selectedWarehouseId}
                initialRows={warehouseRows}
                initialColumns={warehouseCols}
                readOnly={true}
            >
                <ActivitiesMapInner
                    warehouses={warehouses}
                    selectedWarehouseId={selectedWarehouseId}
                    onWarehouseChange={(id) => {
                        setSelectedWarehouseId(id);
                        const selected = warehouses.find((w: any) => w.id?.toString() === id);
                        if (selected) {
                            setWarehouseRows(selected.row || 14);
                            setWarehouseCols(selected.column || 38);
                        }
                        // Cập nhật cookie để website header cũng được đồng bộ
                        document.cookie = `selectedWarehouseId=${id}; path=/`;
                    }}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                />
            </WarehouseConfigProvider>
        </div>
    );
}
