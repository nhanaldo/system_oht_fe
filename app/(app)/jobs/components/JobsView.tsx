'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Spin, Button, Row, Col, Divider } from 'antd';
import ModalThemeProvider from '@/components/ui/ModalThemeProvider';
import { getJobDetail } from '../jobAction';
import dayjs from 'dayjs';

interface JobsViewProps {
    open: boolean;
    onClose: () => void;
    jobId: string;
    warehouseId: string;
}

export default function JobsView({ open, onClose, jobId, warehouseId }: JobsViewProps) {
    const [loading, setLoading] = useState(false);
    const [jobData, setJobData] = useState<any>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!open || !jobId || !warehouseId) return;
            setLoading(true);
            try {
                const res: any = await getJobDetail(warehouseId, jobId);
                if (res?.success && res?.data) {
                    setJobData(res.data.elements || res.data);
                } else {
                    console.error("Lỗi lấy chi tiết job:", res?.error);
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết job:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [open, jobId, warehouseId]);

    const renderStatusTag = (status: string) => {
        let bgColor = '#f5f5f5';
        let textColor = '#555555';
        let text = status;
        let width = '80px';
        const v = status?.toUpperCase();

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
            <span
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
                    fontSize: '12px'
                }}
            >
                {text}
            </span>
        );
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return 'NULL';
        return dayjs(timeStr).format('HH:mm DD/MM/YYYY');
    };

    return (
        <ModalThemeProvider>
            <Modal
                closable={true}
                title={
                    <span style={{ fontSize: 18, fontWeight: 500, color: "#484848" }}>
                        Chi tiết công việc
                    </span>
                }
                open={open}
                width={1000}
                centered
                zIndex={1005}
                className="responsive-modal"
                styles={{
                    mask: {
                        backdropFilter: "blur(0px)",
                    },
                    container: {
                        padding: "19px 24px 30px 24px",
                    },
                }}
                footer={null}
                onCancel={onClose}
                destroyOnHidden
            >
                {/* xs={24} md={11 tự động điều chỉnh theo kích thước màn hình */}
                {/* Cho màn hình điện thoại di động - dưới 576px */}
                {/* md={11} (Cho màn hình máy tính/tablet - từ 768px trở lên) */}
                <div className="flex flex-col w-full min-h-[200px]">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] mt-[9px]"></div>
                    {loading ? (
                        <div className="flex-1 flex justify-center items-center py-12">
                            <Spin size="large" />
                        </div>
                    ) : jobData ? (
                        <div className="w-full text-[#484848] text-[14px]">
                            {/* Thông tin chung */}
                            <h3 className="font-medium text-[15px] mb-3 text-[#076EB8]">Thông tin chung</h3>
                            <Row gutter={24} align="stretch">
                                {/* Cột Trái */}
                                <Col xs={24} md={11} className="flex flex-col gap-3">
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]">Mã lệnh:</span>
                                        <span className="font-normal text-[#076eb8]">{jobData.code || 'NULL'}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]">Tên kho:</span>
                                        <span className="font-normal text-[#484848] ">{jobData.warehouse_name || 'NULL'}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100 items-center">
                                        <span className="text-[#1c1c1c]">Trạng thái:</span>
                                        <span>{renderStatusTag(jobData.status)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className="text-[#1c1c1c]">Thời gian tạo:</span>
                                        <span className="font-normal text-[#484848]">{formatTime(jobData.created_at)}</span>
                                    </div>
                                </Col>

                                {/* Đường kẻ dọc giữa */}
                                <Col xs={0} md={2} className="!flex !flex-row !justify-center py-3">
                                    <div className="w-[1px] bg-gray-200 h-full" />
                                </Col>

                                {/* Cột Phải */}
                                <Col xs={24} md={11} className="flex flex-col gap-3">
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]   display-flex items-center">Loại lệnh:</span>
                                        <span className="font-normal text-[#1849d6]">
                                            {jobData.job_type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]">Quy trình:</span>
                                        <span className="font-normal text-[#484848]">{jobData.workflow_name || 'NULL'}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className="text-[#1c1c1c]">Độ ưu tiên:</span>
                                        <span className="font-normal text-[#484848]">{jobData.priority ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className="text-[#1c1c1c]">Hoàn thành lúc:</span>
                                        <span className="font-normal">{formatTime(jobData.finished_at) || 'NULL'}</span>
                                    </div>
                                </Col>
                            </Row>

                            <Divider className="my-5" />

                            {/* Thông tin đầu vào */}
                            <h3 className="font-medium text-[15px] mb-3 text-[#076EB8]">Thông tin sản phẩm & vị trí</h3>
                            <Row gutter={24} align="stretch">
                                {/* Cột Trái */}
                                <Col xs={24} md={11} className="flex flex-col gap-3">
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]">Mã sản phẩm (SKU):</span>
                                        <span className="font-normal text-[#076eb8]">{jobData.input?.sku_code || 'NULL'}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]">Làn cổng (Lane):</span>
                                        <span className="font-normal">{jobData.input?.lane || 'NULL'}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className="text-[#1c1c1c]">Tầng mục tiêu:</span>
                                        <span className="font-normal text-[#484848]">{jobData.input?.target_floor_number ?? 'NULL'}</span>
                                    </div>
                                </Col>

                                {/* Đường kẻ dọc giữa */}
                                <Col xs={0} md={2} className="!flex !flex-row !justify-center py-3">
                                    <div className="w-[1px] bg-gray-200 h-full" />
                                </Col>

                                {/* Cột Phải */}
                                <Col xs={24} md={11} className="flex flex-col gap-3">
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]">Số lượng:</span>
                                        <span className="font-normal text-[#484848]">{jobData.input?.quantity ?? 'NULL'}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100">
                                        <span className=" text-[#1c1c1c]">
                                            {jobData.job_type === 'EXPORT' ? 'Vị trí xuất:' : 'Vị trí lưu trữ:'}
                                        </span>
                                        <span className="font-normal">
                                            {(jobData.job_type === 'EXPORT'
                                                ? jobData.input?.pickup_location_code
                                                : jobData.input?.target_location_code) || 'NULL'}
                                        </span>
                                    </div>
                                </Col>
                            </Row>

                            <div className="flex justify-end mt-8">
                                <Button
                                    onClick={onClose}
                                    style={{
                                        backgroundColor: "#076EB8",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 24px",
                                        height: 34,
                                        borderRadius: 20,
                                        fontWeight: 500
                                    }}
                                >
                                    Xác nhận
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex justify-center items-center py-12 text-gray-500">
                            Không tải được dữ liệu chi tiết công việc.
                        </div>
                    )}
                </div>
            </Modal>
        </ModalThemeProvider>
    );
}
