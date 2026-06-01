"use client";

import React from "react";
import { Table, Space, Tooltip, ConfigProvider, Checkbox } from "antd";
import Image from "next/image";

const FakeChildPallets = ({ 
    parentId, 
    selectedRowKeys, 
    setSelectedRowKeys 
}: { 
    parentId: string;
    selectedRowKeys: React.Key[];
    setSelectedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
}) => {
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 80,
            align: 'center' as const,
        },
        {
            title: 'Mã pallet',
            dataIndex: 'code',
            key: 'code',
            width: 250,
        },
        {
            title: 'Người tạo',
            dataIndex: 'creator',
            key: 'creator',
            width: 250,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 250,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: () => (
                <Space size="middle" style={{ gap: '10px' }}>
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={20}
                            height={20}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
            align: 'center' as const,
        },
    ];

    const data = [
        { key: `${parentId}-1`, stt: 1, code: 'Palletgo1', creator: 'Nguyễn Văn A', createdAt: '08:05:40 19/05/2026' },
        { key: `${parentId}-2`, stt: 2, code: 'Palletgo2', creator: 'Nguyễn Văn A', createdAt: '08:05:40 19/05/2026' },
        { key: `${parentId}-3`, stt: 3, code: 'Palletgo3', creator: 'Nguyễn Văn A', createdAt: '08:05:40 19/05/2026' },
        { key: `${parentId}-4`, stt: 4, code: 'Palletgo4', creator: 'Nguyễn Văn A', createdAt: '08:05:40 19/05/2026' },
    ];

    const rowSelection = {
        selectedRowKeys,
        onSelect: (record: any, selected: boolean) => {
            if (selected) {
                setSelectedRowKeys(prev => [...prev, record.key]);
            } else {
                setSelectedRowKeys(prev => prev.filter(k => k !== record.key));
            }
        },
        onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
            if (selected) {
                const newKeys = changeRows.map(r => r.key);
                setSelectedRowKeys(prev => [...prev, ...newKeys]);
            } else {
                const keysToRemove = changeRows.map(r => r.key);
                setSelectedRowKeys(prev => prev.filter(k => !keysToRemove.includes(k)));
            }
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerBg: '#E6F4FF',
                        headerColor: '#1677FF',
                        rowHoverBg: '#F5F5F5',
                        headerBorderRadius: 0,
                    }
                }
            }}
        >
            <div>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    size="small"
                    rowSelection={rowSelection}
                    className="nested-child-table"
                />
            </div>
        </ConfigProvider>
    );
};

export default FakeChildPallets;
