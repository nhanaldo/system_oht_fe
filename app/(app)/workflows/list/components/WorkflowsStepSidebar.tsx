"use client";

import React from "react";
import { Button, Input, Select, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Image from "next/image";
import { createWorkflowStep } from "../workflowsAction";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useToast } from "@/components/ui/Toast";

import { WorkflowStep } from "@/types/workflow";

interface WorkflowsStepSidebarProps {
    steps: WorkflowStep[];
    deviceTypes: any[];
    warehouseId: string;
    workflowId: string;
    onStepCreated: () => void;
    handleDragStart: (e: React.DragEvent, stepId: string, source: "left-pool" | "right-flow") => void;
}

export default function WorkflowsStepSidebar({
    steps,
    deviceTypes,
    warehouseId,
    workflowId,
    onStepCreated,
    handleDragStart
}: WorkflowsStepSidebarProps) {
    const { showSuccess, showError } = useToast();
    const [form] = Form.useForm();

    const handleCreateStep = async (values: any) => {
        try {
            const payload = {
                device_type_id: values.device_type_id,
                workflow_step_name: values.workflow_step_name,
                action_type: values.action_type,
                default_params: {},
                step_order: 0 // Mặc định ở Sidebar pool khi tạo mới
            };
            const res = await createWorkflowStep(warehouseId, workflowId, payload);
            if (res.success) {
                showSuccess("Thêm mới bước quy trình thành công");
                form.resetFields();
                onStepCreated();
            } else {
                showError(res.error || "Thêm mới bước quy trình thất bại");
            }
        } catch (error) {
            showError("Đã xảy ra lỗi khi thêm mới bước");
        }
    };

    return (
        <div className="absolute left-0 top-0 bottom-0 w-[284px] z-10 bg-white flex flex-col gap-[15px] overflow-hidden border-r border-[#E0E0E0] shadow-lg pb-[16px] shrink-0">
            <div
                className="text-[#076EB8] text-[15px] h-[45px] flex items-center justify-between border-b-[0.5px] border-[#D9D9D9] px-[15px] shrink-0 "
                style={{ fontWeight: 600 }}
            >
                <span>Tổng số bước đã thiết lập: {steps.length}</span>
            </div>

            <OverlayScrollbarsComponent
                defer
                options={{
                    scrollbars: {
                        autoHide: 'leave',
                        autoHideDelay: 500,
                    },
                }}
                style={{ maxHeight: '100%' }}
                className="flex-1"
            >
                <div className="flex flex-col gap-[15px] px-[15px] pt-1">
                    {/* Create Step Form */}
                    <div className="bg-white px-[15px] py-[10px] rounded-lg shadow-sm border-[0.5px] border-[#076EB8]/30 border-dashed">
                        <ModalThemeProvider>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                    .no-label-padding .ant-form-item-label {
                                        padding-bottom: 0px !important;
                                    }
                                `
                            }} />
                            <h3 className="text-[#076EB8] text-[15px] font-semibold !mb-[10px]">Tạo bước mới</h3>
                            <Form form={form} layout="vertical" onFinish={handleCreateStep} className="no-label-padding">
                                <Form.Item
                                    name="workflow_step_name"
                                    label={<span className="text-[14px] text-[#404040] ">Tên bước <span className="text-red-500">*</span></span>}
                                    className="!mb-[10px]"
                                    rules={[{ required: true, message: "Vui lòng nhập tên bước!" }]}
                                >
                                    <Input placeholder="Nhập mã mộc" className="h-[38px] rounded-md" />
                                </Form.Item>
                                <Form.Item
                                    name="device_type_id"
                                    label={<span className="text-[14px] text-[#404040]">Chọn loại thiết bị <span className="text-red-500">*</span></span>}
                                    className="!mb-[10px]"
                                    rules={[{ required: true, message: "Vui lòng chọn loại thiết bị!" }]}
                                >
                                    <Select
                                        placeholder="Chọn loại thiết bị"
                                        className="h-[38px]"
                                        options={deviceTypes.map((dt: any) => ({
                                            value: dt.id,
                                            label: dt.code ? `${dt.code}` : dt.name
                                        }))}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="action_type"
                                    label={<span className="text-[13px] text-[#404040]">Loại hành động <span className="text-red-500">*</span></span>}
                                    className="!mb-[12px]"
                                    rules={[{ required: true, message: "Vui lòng nhập loại hành động!" }]}
                                >
                                    <Input placeholder="Nhập mã Code" className="h-[38px] rounded-md" />
                                </Form.Item>
                            </Form>
                        </ModalThemeProvider>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        block
                        onClick={() => form.submit()}
                        className="!h-[32px] !rounded-[20px] !bg-[#076EB8] !text-white !text-[13px] font-medium mt-1 transition-colors"
                    >
                        Thêm mới bước
                    </Button>
                    <div className="border-[0.5px] border-[#e8e8e8]"></div>

                    {/* Available Step List Pool */}
                    <div className="flex flex-col gap-[10px]">
                        <h3 className="text-[#076eb8] text-[16px] font-bold">Bước thực hiện:</h3>

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            className="flex flex-col gap-2 min-h-[300px] rounded-lg border-dashed"
                        >
                            {/* Nút Bắt đầu */}
                            <div className="flex items-center gap-3 p-[7px] bg-white rounded-md border border-[#0c9aff] cursor-default select-none">
                                <Image src="/icon.svg/open.svg" alt="Bắt đầu" width={20} height={20} className="shrink-0" />
                                <span className="text-[14px] text-[#076EB8] font-medium">Bắt đầu</span>
                            </div>

                            {steps.map((step) => {
                                return (
                                    <div
                                        key={step.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, step.id, "left-pool")}
                                        className="flex items-center justify-between p-3 bg-white rounded-md border border-[#0C9AFF] cursor-grab"
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <Image
                                                src="/icon.svg/doc.svg"
                                                alt="Bước"
                                                width={20}
                                                height={20}
                                                className="opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
                                            />
                                            <span className="text-[14px] text-[#076eb8] font-medium truncate">{step.workflow_step_name}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Nút Kết thúc */}
                            <div className="flex items-center gap-3 p-[7px] bg-white rounded-md border border-[#0c9aff] cursor-default select-none">
                                <Image src="/icon.svg/close.svg" alt="Kết thúc" width={20} height={20} className="shrink-0" />
                                <span className="text-[14px] text-[#076EB8] font-medium">Kết thúc</span>
                            </div>
                        </div>
                    </div>
                </div>
            </OverlayScrollbarsComponent>
        </div>
    );
}
