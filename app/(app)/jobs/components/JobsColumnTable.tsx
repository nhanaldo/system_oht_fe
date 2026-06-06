import React from 'react';
import { Button, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Tooltip } from 'antd';
import Image from 'next/image';

interface GetJobsColumnsProps {
    params: {
        page: number;
        limit: number;
        [key: string]: any;
    };
    jobType: 'IMPORT' | 'EXPORT';
    containers?: any[];
    onViewDetail?: (id: string) => void;
}

export const getJobsColumns = ({ params, jobType, containers, onViewDetail }: GetJobsColumnsProps): ColumnsType<any> => [
    {
        title: 'STT',
        align: 'center',
        key: 'index',
        width: 60,
        render: (_: any, __: any, index: number) => (params.page - 1) * params.limit + index + 1,
        // onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
        title: 'Mã lệnh',
        align: 'center',
        width: 170,
        dataIndex: 'code',
        key: 'code',
        render: (val: string) => val || '-',
    },
    {
        title: 'Mã Pallet',
        align: 'center',
        width: 110,
        key: 'container_code',
        render: (_: any, record: any) => {
            const containerId = record.input?.container_id;
            if (!containerId) return 'Không tìm thấy';

            if (containers && containers.length > 0) {
                const c = containers.find((x: any) => x.id === containerId);
                if (c && c.code) return c.code;
            }
            return 'Không tìm thấy';
        },
        onHeaderCell: () => ({ style: { textAlign: 'center' } }),

    },
    {
        title: 'Sản phẩm',
        align: 'center',
        dataIndex: ['input', 'sku_code'],
        width: 180,
        key: 'sku_code',
        render: (val: string) => <span className='text-[#076eb8]'>{val || '-'}</span>,
    },
    {
        title: 'Số lượng',
        align: 'center',
        width: 100,
        dataIndex: ['input', 'quantity'],
        key: 'quantity',
        render: (val: any) => val || 'null',
    },
    {
        title: 'Lô hàng',
        align: 'center',
        width: 112,
        dataIndex: ['input', 'batch'],
        key: 'batch',
        render: (val: any) => val || 'BATCH-001',
    },
    {
        title: jobType === 'EXPORT' ? 'Vị trí xuất' : 'Vị trí lưu trữ',
        align: 'center',
        width: 120,
        dataIndex: ['input', jobType === 'EXPORT' ? 'pickup_location_code' : 'target_location_code'],
        key: 'location_code',
        render: (val: string) => val || '-',
    },

    {
        title: 'Loại lệnh',
        align: 'center',
        width: 110,
        dataIndex: 'job_type',
        key: 'job_type',
        render: (val: string) => {
            const v = val?.toUpperCase();
            const displayVal = v === 'IMPORT' ? 'Nhập kho' : v === 'EXPORT' ? 'Xuất kho' : val;
            return (
                <span style={{ color: '#1849d6' }}>
                    {displayVal || (jobType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho')}
                </span>
            );
        },
        onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
        title: 'Thời gian tạo lệnh',
        align: 'center',
        width: 200,
        dataIndex: 'created_at',
        key: 'created_at',
        render: (val: string) => val ? dayjs(val).format('HH:mm DD/MM/YYYY') : '-',
        onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
        title: 'Người tạo',
        align: 'center',
        width: 120,
        dataIndex: 'created_by',
        key: 'created_by',
        render: (val: string) => 'Admin',
    },
    {
        title: 'Trạng thái',
        align: 'center',
        width: 150,
        dataIndex: 'status',
        key: 'status',
        render: (val: string) => {
            let bgColor = '#f5f5f5';
            let textColor = '#555555';
            let text = val;
            let width = '80px';
            const v = val?.toUpperCase();

            if (v === 'COMPLETED') {
                bgColor = '#D2FFDB';
                textColor = '#009130';
                text = 'Hoàn thành';
            } else if (v === 'FAILED') {
                bgColor = '#FFE9E9';
                textColor = '#D32F2F';
                text = 'Lỗi';
                width = '40px';
            } else if (v === 'RUNNING' || v === 'PROCESSING') {
                bgColor = '#D2ECFF';
                textColor = '#076EB8';
                text = 'Đang xử lý';
            } else if (v === 'PENDING' || v === 'WAITING') {
                bgColor = '#FFE7D280';
                textColor = '#E35E04';
                text = 'Đang chờ';
            }

            return (
                <Tag
                    style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        border: 'none',
                        width: width,
                        height: '26px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '20px',
                        fontWeight: 500,
                    }}
                >
                    {text}
                </Tag>
            );
        },
        onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
        title: 'Hành động',
        align: 'center',
        key: 'action',
        width: 120,
        render: (_, record: any) => (
            <Space size={12}>
                <Tooltip title="Xem chi tiết">
                    <Image
                        src="/icon.svg/look.svg"
                        alt="Xem chi tiết"
                        width={18}
                        height={18}
                        style={{ width: '18px', height: '18px', flexShrink: 0 }}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onViewDetail?.(record.id)}
                    />
                </Tooltip>
                <Tooltip title="Xóa">
                    <Image
                        src="/icon.svg/deteleedit.svg"
                        alt="Xóa"
                        width={17.14}
                        height={17.86}
                        style={{ width: '17.14px', height: '17.86px', flexShrink: 0 }}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </Tooltip>
            </Space>
        ),
    },
];
