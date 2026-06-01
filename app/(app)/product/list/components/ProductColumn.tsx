'use client';

import React, { useState, useEffect } from 'react';
import { Space, Tooltip, Switch, ConfigProvider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Image from 'next/image';

import { ProductItem } from '@/types/product';

// Custom Switch component for status toggle with inline state & loading
function StatusSwitch({
    active,
    record,
    onToggleStatus,
    width = 40,
    height = 20
}: {
    active: boolean;
    record: ProductItem;
    width?: number;
    height?: number;
    onToggleStatus?: (
        record: ProductItem,
        checked: boolean,
        startLoading: () => void,
        stopLoading: () => void
    ) => Promise<boolean>;
}) {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(active);

    useEffect(() => {
        setChecked(active);
    }, [active]);

    const handleChange = async () => {
        if (!onToggleStatus || loading) return;

        const startLoading = () => setLoading(true);
        const stopLoading = () => setLoading(false);

        const newVal = !checked;
        const success = await onToggleStatus(record, newVal, startLoading, stopLoading);
        if (success) {
            setChecked(newVal);
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Switch: {
                        trackMinWidth: width,
                        trackHeight: height,
                        handleSize: height - 4,//tính toán nút tròn phù hợp với height của icon 
                    }
                }
            }}
        >
            <Switch
                checked={checked}
                loading={loading}
                onChange={handleChange}
                style={{ backgroundColor: checked ? '#1890FF' : undefined }}
            />
        </ConfigProvider>
    );
}

export const getProductColumns = (
    categoryOptions: { label: string; value: string }[],
    uomOptions: { label: string; value: string }[],
    methodOptions: { label: string; value: string; code?: string }[],
    onEdit?: (record: ProductItem) => void,
    onDelete?: (id: string) => void,
    onToggleStatus?: (
        record: ProductItem,
        checked: boolean,
        startLoading: () => void,
        stopLoading: () => void
    ) => Promise<boolean>
): ColumnsType<ProductItem> => [
        {
            title: 'STT',
            key: 'index',
            width: 71,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Mã sản phẩm',
            dataIndex: 'code',
            key: 'code',
            width: 170,
            align: 'left',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            align: 'left',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
        },
        {
            title: 'Phẩm cấp',
            dataIndex: 'category_id',
            key: 'category_id',
            width: 230,
            align: 'left',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (catId: string) => {
                const found = categoryOptions.find(opt => opt.value === catId);
                return found ? found.label : catId || '';
            }
        },
        {
            title: 'Đơn vị tính',
            key: 'uom',
            width: 120,
            align: 'center',
            render: (_, record: ProductItem) => {
                const found = uomOptions.find(opt => opt.value === record.unit_of_measure_id);
                return found ? found.label : '';
            },
        },
        {
            title: 'Khối lượng (kg)',
            dataIndex: 'weight',
            key: 'weight',
            width: 150,
            align: 'center',
        },
        {
            title: 'Quy cách',
            key: 'specification',
            width: 110,
            align: 'center',
            render: (_, record: ProductItem) => {
                const found = methodOptions.find(opt => opt.value === record.method_id);
                if (!found) return '';

                const codeLower = (found.code || '').toLowerCase().trim();
                let iconPath = '';
                if (codeLower === 'fifo') iconPath = '/icon.svg/fifo.svg';
                else if (codeLower === 'lifo') iconPath = '/icon.svg/lifo.svg';
                else if (codeLower === 'fefo') iconPath = '/icon.svg/fefo.svg';

                if (iconPath) {
                    return (
                        <div className="flex items-center justify-center">
                            <Tooltip title={found.code || found.label}>
                                <Image
                                    src={iconPath}
                                    alt={found.code || found.label}
                                    width={50}
                                    height={26}
                                />
                            </Tooltip>
                        </div>
                    );
                }

                return found.code || found.label;
            },
        },
        {
            title: 'Sử dụng',
            dataIndex: 'is_active',
            key: 'is_active',
            align: 'center',
            width: 110,
            render: (active: boolean, record: ProductItem) => (
                <StatusSwitch
                    active={active}
                    record={record}
                    onToggleStatus={onToggleStatus}
                    width={40}
                    height={20}
                />
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            align: 'left',
            width: 250,
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (desc: string) => (
                <div className="truncate max-w-[240px]" title={desc}>
                    {desc || ''}
                </div>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 130,
            render: (_: any, record: ProductItem) => (
                <Space size={16}>
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={18}
                            height={18}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onEdit && onEdit(record)}
                            className="hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={17.14}
                            height={17.86}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onDelete && onDelete(record.id)}
                            className="hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];
