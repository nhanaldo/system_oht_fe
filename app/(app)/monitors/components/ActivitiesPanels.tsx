'use client';
import React, { useState, useEffect } from 'react';
import { mockSystemLogs, mockStats } from '../mockData';
import { DownOutlined } from '@ant-design/icons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { getJobs } from '../activitiesAction';
import { getDevices } from '@/app/(app)/(warehouse)/warehouse/warehouseAcction';
import { getContainers } from '@/app/(app)/inventory/containers/containersAction';

export default function ActivitiesPanels() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeStatus, setActiveStatus] = useState<'all' | 'dispatched' | 'waiting' | 'active' | 'completed' | 'failed'>('all');
    const [warehouseId, setWarehouseId] = useState<string>('');
    const [containers, setContainers] = useState<any[]>([]);

    // State cho thiết bị
    const [devices, setDevices] = useState<any[]>([]);
    const [devicesLoading, setDevicesLoading] = useState<boolean>(true);
    const [activeDeviceFilter, setActiveDeviceFilter] = useState<'all' | 'active' | 'inactive' | 'error'>('all');

    const warehouseIdRef = React.useRef<string>('');
    useEffect(() => {
        warehouseIdRef.current = warehouseId;
    }, [warehouseId]);

    // Đọc ID kho đã chọn từ cookie selectedWarehouseId của website header
    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return '';
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
        return '';
    };

    const fetchJobsData = async (wId: string) => {
        try {
            const res: any = await getJobs({ warehouse_id: wId, limit: 10000 });
            const elements = res?.elements || res?.data || res?.rows || (Array.isArray(res) ? res : []);
            setJobs(elements);
        } catch (err) {
            console.error("Failed to load jobs from API:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDevicesData = async (wId: string) => {
        if (!wId) {
            setDevices([]);
            setDevicesLoading(false);
            return;
        }
        try {
            const res: any = await getDevices(wId, { limit: 100 });
            const elements = res?.elements || res?.data || res?.rows || (Array.isArray(res) ? res : []);
            setDevices(elements);
        } catch (err) {
            console.error("Failed to load devices from API:", err);
        } finally {
            setDevicesLoading(false);
        }
    };

    const fetchContainersData = async (wId: string) => {
        if (!wId) {
            setContainers([]);
            return;
        }
        try {
            const res: any = await getContainers(wId, { limit: 1000 });
            if (res.success && res.data) {
                const elements = res.data.elements || res.data.data || res.data.rows || (Array.isArray(res.data) ? res.data : []);
                setContainers(elements);
            }
        } catch (err) {
            console.error("Failed to load containers from API:", err);
        }
    };

    useEffect(() => {
        const cookieWId = getCookie('selectedWarehouseId');
        setWarehouseId(cookieWId || '');
        fetchJobsData(cookieWId || '');
        fetchDevicesData(cookieWId || '');
        fetchContainersData(cookieWId || '');
    }, []);

    // Định kỳ 5 giây cập nhật lại danh sách lệnh và thiết bị để theo dõi thời gian thực sử dụng polling
    useEffect(() => {
        let isFetching = false;
        const interval = setInterval(async () => {
            if (isFetching) return;
            isFetching = true;
            try {
                const currentCookieId = getCookie('selectedWarehouseId');
                if (currentCookieId !== warehouseIdRef.current) {
                    setWarehouseId(currentCookieId || '');
                    setLoading(true);
                    setDevicesLoading(true);
                    await Promise.all([
                        fetchJobsData(currentCookieId || ''),
                        fetchDevicesData(currentCookieId || ''),
                        fetchContainersData(currentCookieId || '')
                    ]);
                } else {
                    await Promise.all([
                        fetchJobsData(currentCookieId || ''),
                        fetchDevicesData(currentCookieId || ''),
                        fetchContainersData(currentCookieId || '')
                    ]);
                }
            } finally {
                isFetching = false;
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Ánh xạ số shuttleStatus sang tiếng Việt tương tự như hình ảnh
    const getShuttleStatusText = (statusNum: number) => {
        switch (statusNum) {
            case 0: return "Đang ở manual";
            case 1: return "ERROR";
            case 2: return "Đang lấy hàng";
            case 3: return "Đang bỏ hàng";
            case 4: return "Nâng bánh";
            case 5: return "Hạ bánh";
            case 6: return "Đi chậm";
            case 7: return "Chạy bình thường";
            case 8: return "Chờ lệnh";
            default: return "Chờ lệnh";
        }
    };

    // Hàm giải mã an toàn metadata thiết bị
    const parseDeviceData = (device: any) => {
        let batteryPercentage = 0;
        let shuttleStatus = 8; // Mặc định là 8 (Chờ lệnh)

        if (device.metadata) {
            try {
                const meta = typeof device.metadata === 'string' ? JSON.parse(device.metadata) : device.metadata;
                if (meta) {
                    if (meta.batteryPercentage !== undefined) {
                        batteryPercentage = Number(meta.batteryPercentage) || 0;
                    }
                    if (meta.shuttleStatus !== undefined) {
                        shuttleStatus = Number(meta.shuttleStatus) ?? 8;
                    }
                }
            } catch (e) {
                // Thử bóc tách regex nếu chuỗi JSON lỗi
                if (typeof device.metadata === 'string') {
                    const batMatch = device.metadata.match(/"batteryPercentage"\s*:\s*(\d+)/);
                    if (batMatch) batteryPercentage = parseInt(batMatch[1]) || 0;

                    const statusMatch = device.metadata.match(/"shuttleStatus"\s*:\s*(\d+)/);
                    if (statusMatch) shuttleStatus = parseInt(statusMatch[1]) ?? 8;
                }
            }
        }

        const devStatus = device.status?.toUpperCase() || 'OFFLINE';

        // Trạng thái error: shuttleStatus === 1 hoặc status là ERROR/FAULT
        const error = shuttleStatus === 1 || devStatus === 'ERROR' || devStatus === 'FAULT';
        // Trạng thái active: status là ONLINE và không bị lỗi
        const active = devStatus === 'IDLE' && !error;

        return {
            id: device.code || device.id || 'Unknown',
            task: getShuttleStatusText(shuttleStatus),
            battery: batteryPercentage,
            active,
            error
        };
    };

    // Ánh xạ dữ liệu Job thật từ API sang cấu hình UI Danh sách thực hiện
    const mappedTasks = jobs.map((job: any) => {
        let statusMapped = 'active';
        const statusUpper = job.status?.toUpperCase() || '';
        if (statusUpper === 'COMPLETED') {
            statusMapped = 'completed';
        } else if (statusUpper === 'DISPATCHED') {
            statusMapped = 'dispatched';
        } else if (statusUpper === 'RUNNING') {
            statusMapped = 'active';
        } else if (statusUpper === 'WAITING' || statusUpper === 'PENDING' || statusUpper === 'QUEUED') {
            statusMapped = 'waiting';
        } else if (statusUpper === 'FAILED' || statusUpper === 'ERROR') {
            statusMapped = 'failed';
        } else {
            statusMapped = 'active';
        }

        const typeMapped = job.job_type === 'IMPORT' ? 'Nhập kho' : (job.job_type === 'EXPORT' ? 'Xuất kho' : job.job_type);

        let pltCode = job.input?.container_code || job.output?.container_code || '';
        const containerId = job.container_id || job.input?.container_id || job.output?.container_id;

        // Ưu tiên tra cứu mã pallet từ containerId nếu là lệnh Xuất kho
        if (job.job_type === 'EXPORT' && containerId) {
            const foundContainer = containers.find((c: any) => c.id === containerId);
            if (foundContainer && foundContainer.code) {
                pltCode = foundContainer.code;
            }
        }

        return {
            id: job.id,
            type: typeMapped,
            code: job.code || '',
            plt: pltCode,
            desc: job.input?.sku_code || '',
            status: statusMapped
        };
    });

    const allCount = mappedTasks.length;
    const dispatchedCount = mappedTasks.filter(t => t.status === 'dispatched').length;
    const waitingCount = mappedTasks.filter(t => t.status === 'waiting').length;
    const activeCount = mappedTasks.filter(t => t.status === 'active').length;
    const completedCount = mappedTasks.filter(t => t.status === 'completed').length;
    const failedCount = mappedTasks.filter(t => t.status === 'failed').length;

    const filteredTasks = activeStatus === 'all'
        ? mappedTasks
        : mappedTasks.filter(t => t.status === activeStatus);

    // Ánh xạ và lọc thiết bị cho Panel 3
    const mappedDevices = devices.map((dev: any) => parseDeviceData(dev));

    const devAllCount = mappedDevices.length;
    const devActiveCount = mappedDevices.filter(d => d.active && !d.error).length;
    const devInactiveCount = mappedDevices.filter(d => !d.active && !d.error).length;
    const devErrorCount = mappedDevices.filter(d => d.error).length;

    const filteredDevices = activeDeviceFilter === 'all'
        ? mappedDevices
        : activeDeviceFilter === 'active'
            ? mappedDevices.filter(d => d.active && !d.error)
            : activeDeviceFilter === 'inactive'
                ? mappedDevices.filter(d => !d.active && !d.error)
                : mappedDevices.filter(d => d.error);

    return (
        <OverlayScrollbarsComponent
            className="w-full h-auto lg:h-full "
            options={{ scrollbars: { visibility: "hidden", theme: 'os-theme-dark os-theme-hover' } }}
        >
            <div className="flex flex-col gap-4 w-full pb-[10px]">

                {/* Panel 1: Danh sách thực hiện (Dynamic API) */}
                <div className="bg-white rounded-lg border border-[rgba(3,103,204,0.3)] shadow-[0px_4px_4px_0px_#0000000D] flex flex-col overflow-hidden h-[240px]">
                    <div className="pt-[8px] pl-[10px] border-b border-[rgba(3,103,204,0.3)]  pb-[7px] font-normal text-[#484848] text-[14px] leading-none">Danh sách thực hiện</div>
                    <OverlayScrollbarsComponent
                        className="text-[11px] px-[10px] py-[10px] leading-none text-[#545454]"
                        options={{ scrollbars: { autoHide: 'leave', theme: 'os-theme-dark os-theme-hover' } }}
                    >
                        <div className="flex gap-[10px] whitespace-nowrap">
                            <span
                                onClick={() => setActiveStatus('all')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeStatus === 'all' ? 'font-bold text-[#076eb8] border-[#076eb8]' : 'font-normal text-[#076eb8] border-transparent'}`}
                            >
                                Tất cả ({allCount})
                            </span>
                            <span
                                onClick={() => setActiveStatus('dispatched')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeStatus === 'dispatched' ? 'font-bold text-[#8e44ad] border-[#8e44ad]' : 'font-normal text-[#8e44ad] border-transparent'}`}
                            >
                                Mới tạo ({dispatchedCount})
                            </span>
                            <span
                                onClick={() => setActiveStatus('waiting')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeStatus === 'waiting' ? 'font-bold text-[#ed7d31] border-[#ed7d31]' : 'font-normal text-[#ed7d31] border-transparent'}`}
                            >
                                Đang chờ ({waitingCount})
                            </span>
                            <span
                                onClick={() => setActiveStatus('active')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeStatus === 'active' ? 'font-bold text-[#1849d6] border-[#1849d6]' : 'font-normal text-[#1849d6] border-transparent'}`}
                            >
                                Đang thực hiện ({activeCount})
                            </span>
                            <span
                                onClick={() => setActiveStatus('completed')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeStatus === 'completed' ? 'font-bold text-[#148634] border-[#148634]' : 'font-normal text-[#148634] border-transparent'}`}
                            >
                                Hoàn thành ({completedCount})
                            </span>
                            <span
                                onClick={() => setActiveStatus('failed')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeStatus === 'failed' ? 'font-bold text-[#c60808] border-[#c60808]' : 'font-normal text-[#c60808] border-transparent'}`}
                            >
                                Lỗi ({failedCount})
                            </span>
                        </div>
                    </OverlayScrollbarsComponent>
                    <OverlayScrollbarsComponent className="flex-1  !pr-[10px] !pb-[10px] !pl-[10px]" options={{ scrollbars: { autoHide: 'leave', theme: 'os-theme-dark os-theme-hover' } }}>
                        {loading ? (
                            <div className="flex h-full items-center justify-center !pt-[0px] !pr-[10px] !pb-[10px] !pl-[10px]">
                                <h1>đang tải...</h1>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="flex h-full items-center justify-center py-4 text-gray-400 text-[11px] font-normal">
                                Chưa có lệnh nào ở trạng thái này
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredTasks.map(task => {
                                    let borderColor = 'border-gray-200';
                                    let statusColor = 'bg-gray-400';
                                    let tagColor = 'text-gray-600 bg-gray-100';
                                    if (task.status === 'completed') {
                                        borderColor = 'border-green-200';
                                        statusColor = 'bg-[#148634]';
                                        tagColor = 'text-green-700 bg-green-50';
                                    } else if (task.status === 'dispatched') {
                                        borderColor = 'border-purple-200';
                                        statusColor = 'bg-purple-500';
                                        tagColor = 'text-purple-700 bg-purple-50';
                                    } else if (task.status === 'active') {
                                        borderColor = 'border-blue-200';
                                        statusColor = 'bg-blue-500';
                                        tagColor = 'text-blue-700 bg-blue-50';
                                    } else if (task.status === 'waiting') {
                                        borderColor = 'border-orange-200';
                                        statusColor = 'bg-orange-500';
                                        tagColor = 'text-orange-700 bg-orange-50';
                                    } else if (task.status === 'failed') {
                                        borderColor = 'border-red-200';
                                        statusColor = 'bg-red-500';
                                        tagColor = 'text-red-700 bg-red-50';
                                    }

                                    return (
                                        <div key={task.id} className={`pt-[6px] pb-[7px] pl-[10px] h-[52px] pr-[16px] rounded-md border ${borderColor} flex flex-row items-center gap-2 min-w-0`}>
                                            {/* Left Column: Status Dot */}
                                            <div className="flex items-center justify-center shrink-0">
                                                <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                                            </div>

                                            {/* Right Column: Content */}
                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                <div className="flex justify-between items-center min-w-0 gap-2">
                                                    <div className="flex gap-2 items-center min-w-0 flex-1">
                                                        <span className={`px-2 py-0.5 !bg-[#d2ffdb] !text-[#009130] rounded-xl text-[10px] font-medium shrink-0 ${tagColor}`}>{task.type}</span>
                                                        <span className="text-[12px] font-normal text-[#1849d6] truncate min-w-0" title={task.code}>{task.code}</span>
                                                    </div>
                                                    <span className="text-[12px] text-[#54545499] bg-[#f5f5f5] rounded-[20px] w-[70px] h-[20px] inline-flex items-center justify-center leading-none shrink-0">{task.plt}</span>
                                                </div>
                                                <div className="text-[11px] text-[#545454] truncate" title={task.desc}>{task.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </OverlayScrollbarsComponent>
                </div>

                {/* Panel 2: Log hệ thống */}
                <div className="bg-white rounded-lg border border-[rgba(3,103,204,0.3)] shadow-[0px_4px_4px_0px_#0000000D] flex flex-col overflow-hidden h-[243px]">
                    <div className="pt-[8px] pl-[10px] border-b border-[rgba(3,103,204,0.3)]  pb-[7px] font-normal text-[#484848] text-[14px] leading-none">Log hệ thống</div>
                    <OverlayScrollbarsComponent className="flex-1 px-[20px] py-[10px]" options={{ scrollbars: { autoHide: 'leave', theme: 'os-theme-dark os-theme-hover' } }}>
                        <div className="flex flex-col ">
                            {mockSystemLogs.map((log, idx) => (
                                <div key={idx} className="flex gap-2 text-[12px] h-[35px] items-center border-b-[0.5px] border-[#E7ECFC] min-w-0" >
                                    <span className="text-[#545454] text-[12px] font-normal whitespace-nowrap">{log.time}</span>
                                    <span className="text-[#484848] text-[12px] font-normal leading-tight truncate flex-1 min-w-0" title={log.message}>{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </OverlayScrollbarsComponent>
                </div>

                {/* Panel 3: Danh sách hoạt động */}
                <div className="bg-white rounded-lg border border-[rgba(3,103,204,0.3)] shadow-[0px_4px_4px_0px_#0000000D] flex flex-col overflow-hidden h-[243px]">
                    <div className="pt-[8px] pl-[10px] border-b border-[rgba(3,103,204,0.3)]  pb-[7px] font-normal text-[#484848] text-[14px] leading-none">Danh sách hoạt động</div>
                    <OverlayScrollbarsComponent
                        className="text-[11px] px-[10px] py-[10px] leading-none text-[#545454]"
                        options={{ scrollbars: { autoHide: 'leave', visibility: 'auto' } }}
                    >
                        <div className="flex gap-[10px] whitespace-nowrap">
                            <span
                                onClick={() => setActiveDeviceFilter('all')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeDeviceFilter === 'all' ? 'font-bold text-[#076eb8] border-[#076eb8]' : 'font-normal text-[#076eb8] border-transparent'}`}
                            >
                                Tất cả ({devAllCount})
                            </span>
                            <span
                                onClick={() => setActiveDeviceFilter('active')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeDeviceFilter === 'active' ? 'font-bold text-[#27AE60] border-[#27AE60]' : 'font-normal text-[#27AE60] border-transparent'}`}
                            >
                                Hoạt động ({devActiveCount})
                            </span>
                            <span
                                onClick={() => setActiveDeviceFilter('inactive')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeDeviceFilter === 'inactive' ? 'font-bold text-gray-500 border-gray-500' : 'font-normal text-gray-500 border-transparent'}`}
                            >
                                Đang bận ({devInactiveCount})
                            </span>
                            <span
                                onClick={() => setActiveDeviceFilter('error')}
                                className={`cursor-pointer transition-all duration-200 pb-[1px] border-b-[1px] ${activeDeviceFilter === 'error' ? 'font-bold text-red-500 border-red-500' : 'font-normal text-red-500 border-transparent'}`}
                            >
                                Lỗi ({devErrorCount})
                            </span>
                        </div>
                    </OverlayScrollbarsComponent>
                    <OverlayScrollbarsComponent className="flex-1  !pr-[10px] !pb-[10px] !pl-[10px]" options={{ scrollbars: { autoHide: 'leave', theme: 'os-theme-dark os-theme-hover' } }}>
                        {devicesLoading ? (
                            <div className="flex h-full items-center justify-center !pt-[0px] !pr-[10px] !pb-[10px] !pl-[10px]">
                                <h1 className="text-[12px] text-gray-500 font-normal">đang tải...</h1>
                            </div>
                        ) : filteredDevices.length === 0 ? (
                            <div className="flex h-full items-center justify-center py-4 text-gray-400 text-[11px] font-normal">
                                Không có thiết bị nào ở trạng thái này
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredDevices.map((activity, idx) => {
                                    let borderColor = 'border-gray-200';
                                    let iconBg = 'bg-[#E8F4FF]';
                                    if (activity.error) {
                                        borderColor = 'border-red-200';
                                        iconBg = 'bg-red-50';
                                    } else if (!activity.active) {
                                        iconBg = 'bg-gray-100';
                                    } else {
                                        borderColor = 'border-blue-200';
                                    }

                                    return (
                                        <div key={idx} className={`p-3 rounded-md border ${borderColor} flex items-center justify-between min-w-0 gap-2`}>
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-[35px] h-[35px] relative flex items-center justify-center shrink-0">
                                                    {/* Outer dashed ring representing status */}
                                                    <img
                                                        src={activity.error ? "/icon.svg/nred.svg" : (activity.active ? "/icon.svg/nblue.svg" : "/icon.svg/ngray.svg")}
                                                        className="absolute inset-0 w-full h-full object-contain"
                                                        alt="status ring"
                                                    />
                                                    {/* Inner shuttle icon */}
                                                    <img
                                                        src={activity.active ? "/svgMap/st2-shuttle.svg" : "/icon.svg/stoff.svg"}
                                                        className="w-[20px] h-[15px] object-contain relative z-10"
                                                        alt="shuttle icon"
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className={`text-[12px] font-bold truncate ${activity.error ? 'text-red-500' : (activity.active ? 'text-[#27AE60]' : 'text-[#A3A3A3]')}`} title={activity.id}>{activity.id}</span>
                                                    <span className="text-[11px] text-[#545454] truncate" title={activity.task}>Nhiệm vụ: {activity.task}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 border border-[#5ce968] bg-[#F4FDF5] px-1.5 py-0.5 rounded text-[10px] text-[#217328] font-bold whitespace-nowrap shrink-0">
                                                <img
                                                    src="/icon.svg/pin.svg"
                                                    className="w-[10px] h-[10px] object-contain"
                                                    alt="pin icon"
                                                />
                                                {activity.battery}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </OverlayScrollbarsComponent>
                </div>

                {/* Panel 4: Thống kê loại lệnh */}
                <div className="bg-white rounded-lg border border-[rgba(3,103,204,0.3)] shadow-[0px_4px_4px_0px_#0000000D] flex flex-col overflow-hidden h-[243px]">
                    <div className="pt-[8px] pl-[10px] border-b border-[rgba(3,103,204,0.3)]  pb-[7px] font-normal text-[#484848] text-[14px] leading-none">Thống kê loại lệnh</div>
                    <div className="flex-1 flex p-4 items-center">
                        {/* Circle chart */}
                        <div className="w-1/3 flex justify-center">
                            <div className="relative w-20 h-20 rounded-full border-[8px] border-[#076eb8] flex items-center justify-center flex-col">
                                <span className="text-[10px] text-[#A3A3A3] mt-1">Tổng số</span>
                                <span className="text-[16px] font-bold text-[#076eb8] leading-none">{mockStats.total}</span>
                            </div>
                        </div>
                        {/* List */}
                        <div className="w-2/3 pl-2 flex flex-col gap-2 min-w-0">
                            <div className="flex flex-col min-w-0">
                                <div className="flex justify-between items-center text-[12px] font-bold text-[#141416] min-w-0 gap-1">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className="w-2 h-2 rounded-full bg-[#076eb8] shrink-0"></div>
                                        <span className="truncate" title="Nhập hàng">Nhập hàng</span> <DownOutlined className="text-[10px] shrink-0" />
                                    </div>
                                    <span className="shrink-0">{mockStats.total}</span>
                                </div>
                                <div className="flex flex-col gap-1.5 mt-2 pl-4 min-w-0">
                                    {mockStats.inbound.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px] text-[#545454] min-w-0 gap-1">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#076eb8] shrink-0"></div>
                                                <span className="truncate" title={item.label}>{item.label}</span>
                                            </div>
                                            <span className="shrink-0">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[12px] font-bold text-[#141416] mt-1 min-w-0 gap-1">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-2 h-2 rounded-full bg-[#076eb8] shrink-0"></div>
                                    <span className="truncate" title="Xuất hàng">Xuất hàng</span> <DownOutlined className="text-[10px] shrink-0" />
                                </div>
                                <span className="shrink-0">{mockStats.outbound}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </OverlayScrollbarsComponent>
    );
}