'use client';
import React, { useState, useEffect } from 'react';
import { Select, ConfigProvider } from 'antd';
import { getWarehouse } from '@/app/(app)/(warehouse)/warehouse/warehouseAcction';
import ActivitiesMap from './ActivitiesMap';
import ActivitiesPanels from './ActivitiesPanels';

export default function ActivitiesContent() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

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
                const res: any = await getWarehouse({ page: 1, limit: 100 });
                const elements = res?.elements || res?.data || res?.rows || (Array.isArray(res) ? res : []);
                setWarehouses(elements);

                if (elements.length > 0) {
                    const cookieId = getCookie('selectedWarehouseId');
                    const activeWarehouse = elements.find((w: any) => (w.id || w.ID || w._id)?.toString() === cookieId) || elements[0];
                    if (activeWarehouse) {
                        const activeId = (activeWarehouse.id || activeWarehouse.ID || activeWarehouse._id || '').toString();
                        if (activeId) {
                            setSelectedWarehouseId(activeId);
                            if (cookieId !== activeId) {
                                document.cookie = `selectedWarehouseId=${activeId}; path=/`;
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load warehouses:", err);
            }
        };
        fetchWarehouses();
    }, []);

    // Polling để detect thay đổi cookie nếu được đổi từ nơi khác
    useEffect(() => {
        const interval = setInterval(() => {
            const cookieId = getCookie('selectedWarehouseId');
            if (cookieId && cookieId !== selectedWarehouseId) {
                setSelectedWarehouseId(cookieId);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [selectedWarehouseId]);

    const onWarehouseChange = (id: string) => {
        setSelectedWarehouseId(id);
        document.cookie = `selectedWarehouseId=${id}; path=/`;
    };

    return (
        <div className="w-full h-auto lg:h-full flex flex-col gap-4 overflow-visible lg:overflow-hidden px-1 py-1">
            {/* Header / Chọn kho */}
            <div className="flex justify-between items-center bg-white px-4 py-2 rounded-lg border border-[rgba(3,103,204,0.3)] shadow-[0px_4px_4px_0px_#0000000D] shrink-0">
                <span className="font-semibold text-[#076eb8] text-[16px]">Theo dõi hoạt động</span>
                <div className="flex items-center gap-3">
                    <span className="font-medium text-[#484848] text-[14px]">Chọn kho:</span>
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
                            className="!w-[200px] !h-[32px]"
                            value={selectedWarehouseId || undefined}
                            onChange={onWarehouseChange}
                            options={warehouses.map(w => ({
                                value: (w.id || w.ID || w._id || '').toString(),
                                label: w.name || w.Name || `Kho ${w.code || w.id || w.ID || w._id || 'Mới'}`
                            }))}
                            placeholder="Chọn kho"
                            suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ width: 15, height: 15, filter: 'invert(30%) sepia(90%) saturate(2000%) hue-rotate(186deg) brightness(90%) contrast(100%)' }} />}
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
            </div>

            {/* Nội dung chính */}
            <div className="w-full h-auto lg:h-full flex flex-col lg:flex-row gap-4 overflow-visible lg:overflow-hidden min-h-0">
                {/* Left Column: Map */}
                <div className="w-full h-[400px] lg:h-full lg:flex-1 relative min-w-0">
                    <ActivitiesMap />
                </div>
                {/* Right Column: Panels */}
                <div className="w-full lg:w-[420px] shrink-0 h-auto lg:h-full overflow-hidden flex flex-col">
                    <ActivitiesPanels />
                </div>
            </div>
        </div>
    );
}