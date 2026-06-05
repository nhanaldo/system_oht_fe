'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, DatePicker, ConfigProvider, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Image from 'next/image';
import CustomTable from '@/components/ui/CustomTable';
import ModalThemeProvider from '@/components/ui/ModalThemeProvider';
import { useTableQuery } from '@/hook/useTableQuery';
import { getJobs } from '../jobAction';
import { getJobsColumns } from './JobsColumnTable';
import { getContainers } from '../../inventory/containers/containersAction';
import ModalCreateJob from './ModalCreateJob';
import JobsView from './JobsView';
import dayjs from 'dayjs';

interface JobsTableProps {
    jobType: 'IMPORT' | 'EXPORT';
}

function JobsTableInner({ jobType, warehouseId }: JobsTableProps & { warehouseId: string }) {
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState<any>(null);
    const [containers, setContainers] = useState<any[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewJobId, setViewJobId] = useState<string | null>(null);

    useEffect(() => {
        const fetchContainers = async () => {
            if (!warehouseId) return;
            try {
                const res = await getContainers(warehouseId, { limit: 2000, page: 1 });
                if (res?.success && res?.data) {
                    const dataObj: any = res.data;
                    const list = dataObj.elements || dataObj.data || (Array.isArray(dataObj) ? dataObj : []);
                    setContainers(list);
                }
            } catch (error) {
                console.error('Lỗi tải danh sách container', error);
            }
        };
        fetchContainers();
    }, [warehouseId]);

    const { params, setParams, onPageChange, onSearchChange, data, total, isLoading, refetch } = useTableQuery({
        queryKey: `jobs_${jobType}_${warehouseId}`,
        fetchFn: getJobs,
        initialParams: {
            job_type: jobType,
            limit: 20,
            page: 1,
            warehouse_id: warehouseId || '',
        }
    });

    const columns = getJobsColumns({
        params,
        jobType,
        containers,
        onViewDetail: (id) => setViewJobId(id),
    });

    // Lọc dữ liệu ở phía client vì API chưa hỗ trợ search
    const filteredData = data.filter((item: any) => {
        const q = searchText.toLowerCase();
        const matchText = (
            (item.input?.container_id || '').toLowerCase().includes(q) ||
            (item.input?.sku_code || '').toLowerCase().includes(q) ||
            (item.input?.batch || '').toLowerCase().includes(q) ||
            (item.input?.pickup_location_code || '').toLowerCase().includes(q) ||
            (item.workflow_name || '').toLowerCase().includes(q) ||
            (item.status || '').toLowerCase().includes(q)
        );

        let matchDate = true;
        if (dateRange && dateRange[0] && dateRange[1]) {
            const itemDate = dayjs(item.created_at);
            // So sánh xem ngày tạo có nằm trong khoảng được chọn không
            matchDate = (
                (itemDate.isAfter(dateRange[0].startOf('day')) || itemDate.isSame(dateRange[0].startOf('day'))) &&
                (itemDate.isBefore(dateRange[1].endOf('day')) || itemDate.isSame(dateRange[1].endOf('day')))
            );
        }

        // Lọc trạng thái (Status) ở client-side
        let matchStatus = true;
        if (params.status) {
            const itemStatus = (item.status || '').toUpperCase();
            const filterStatus = params.status.toUpperCase();
            if (filterStatus === 'PENDING') {
                matchStatus = itemStatus === 'PENDING' || itemStatus === 'WAITING';
            } else if (filterStatus === 'RUNNING') {
                matchStatus = itemStatus === 'RUNNING' || itemStatus === 'PROCESSING';
            } else {
                matchStatus = itemStatus === filterStatus;
            }
        }

        return matchText && matchDate && matchStatus;
    });

    return (
        <ModalThemeProvider>
            <div className="flex flex-col h-full min-h-0">
                <div className="flex justify-between items-start mb-[5px] shrink-0">
                    <div className="min-w-0 flex-1 mr-2">
                        <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">Quản lý lệnh {jobType === 'IMPORT' ? 'nhập' : 'xuất'} kho</h2>
                        {/* <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">Tổng cộng: {filteredData.length} mục</p> */}
                    </div>
                    <ConfigProvider
                        theme={{
                            components: {
                                Input: {
                                    colorBorder: '#DADBDD',
                                    hoverBorderColor: '#DADBDD',
                                    activeBorderColor: '#DADBDD',
                                    activeShadow: 'none',
                                },
                                Select: {
                                    colorBorder: '#DADBDD',
                                    hoverBorderColor: '#DADBDD',
                                    activeBorderColor: '#DADBDD',
                                },
                                DatePicker: {
                                    colorBorder: '#DADBDD',
                                    hoverBorderColor: '#DADBDD',
                                    activeBorderColor: '#DADBDD',
                                }
                            }
                        }}
                    >
                        <Space style={{ gap: 15 }} className="flex-wrap justify-end jobs-table-controls">
                            <Input
                                placeholder="Nhập vào tìm kiếm"
                                prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                                className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px] !w-[120px] lg:!w[300px] mobile-hide-on-sidebar"
                                style={{ width: 300, fontSize: '16px', height: '40px' }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Select
                                placeholder="Trạng thái"
                                className="lg:!w-[168px] !h-[40px] mobile-hide-on-sidebar"
                                value={params.status || undefined}
                                // allowClear
                                onChange={(val) => {
                                    setParams((prev: any) => ({
                                        ...prev,
                                        status: val || '',
                                        page: 1
                                    }));
                                }}
                                suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}

                            >
                                <Select.Option value="">Tất cả trạng thái</Select.Option>
                                <Select.Option value="PENDING">Đang chờ</Select.Option>
                                <Select.Option value="RUNNING">Đang xử lý</Select.Option>
                                <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                                <Select.Option value="FAILED">Lỗi</Select.Option>
                            </Select>
                            <DatePicker.RangePicker
                                format="DD/MM/YYYY"
                                className="!hidden lg:!inline-flex lg:!w-[246px] h-[40px] !text-[#484848] mobile-hide-on-sidebar"
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates)}
                                allowClear={false}
                                suffixIcon={<Image src="/icon.svg/date.svg" alt="Time" width={16} height={16} />}
                            />

                            <Image
                                src="/icon.svg/create.svg"
                                alt="Thêm"
                                width={40}
                                height={40}
                                className="cursor-pointer hover:opacity-80 transition-opacity "
                                onClick={() => setIsCreateModalOpen(true)}
                            />
                        </Space>
                    </ConfigProvider>
                </div>

                <ModalCreateJob
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => refetch()}
                    jobType={jobType}
                    warehouseId={warehouseId}
                />

                <JobsView
                    open={viewJobId !== null}
                    onClose={() => setViewJobId(null)}
                    jobId={viewJobId || ''}
                    warehouseId={warehouseId}
                />

                <div className="w-full h-[1px] bg-gray-200 mb-[15px] shrink-0"></div>
                <div className="flex-1 min-h-0">
                    <CustomTable
                        dataTable={filteredData}
                        columns={columns}
                        keyIndex="id"
                        pagination={{
                            current: params.page,
                            pageSize: params.limit,
                            total: filteredData.length,
                            onChange: onPageChange,
                        }}
                    />
                </div>
            </div>
        </ModalThemeProvider>
    );
}

export default function JobsTable({ jobType }: JobsTableProps) {
    const [warehouseId, setWarehouseId] = useState<string | null>(null);

    useEffect(() => {
        const getCookie = (name: string) => {
            if (typeof document === 'undefined') return '';
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
            return '';
        };

        // Lấy lần đầu
        setWarehouseId(getCookie('selectedWarehouseId') || '');

        // Kiểm tra thay đổi cookie mỗi 1 giây (do project hiện dùng cookie thay vì context event) sử dụng polling 
        const interval = setInterval(() => {
            const currentCookieId = getCookie('selectedWarehouseId') || '';
            setWarehouseId(prev => {
                if (prev !== currentCookieId) return currentCookieId;
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Nếu chưa load xong cookie
    if (warehouseId === null) return <div>Đang tải...</div>;

    // Nếu không có kho nào được chọn
    if (warehouseId === '') return <div className="p-8 text-center text-gray-500">Vui lòng chọn kho ở trên header để xem dữ liệu.</div>;

    return <JobsTableInner key={warehouseId} jobType={jobType} warehouseId={warehouseId} />;
}
