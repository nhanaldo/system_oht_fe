"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Select, Input } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Workflow } from "@/types/workflow";
import { createWorkflow, updateWorkflow } from "../workflowsAction";
import { useToast } from "@/components/ui/Toast";

interface ModalAddWorkflowsProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingRecord?: Workflow | null;
    warehouseId: string;
    existingWorkflows?: Workflow[];
}

const schema = z.object({
    name: z.string().trim().min(1, "Tên quy trình không được để trống"),
    type: z.string().trim().min(1, "Loại quy trình không được để trống"),
    description: z.string().trim().optional(),
});

type WorkflowFormData = z.infer<typeof schema>;

const PROCESS_TYPE_OPTIONS = [
    { label: "Nhập cổng trên - tầng 1", value: "INBOUND_GATE_TOP_FLOOR_1" },
    { label: "Nhập cổng trên - tầng 2", value: "INBOUND_GATE_TOP_FLOOR_2" },
    { label: "Nhập cổng dưới - tầng 1", value: "INBOUND_GATE_BOTTOM_FLOOR_1" },
    { label: "Nhập cổng dưới - tầng 2", value: "INBOUND_GATE_BOTTOM_FLOOR_2" },
    { label: "Xuất cổng trên - tầng 1", value: "OUTBOUND_GATE_TOP_FLOOR_1" },
    { label: "Xuất cổng trên - tầng 2", value: "OUTBOUND_GATE_TOP_FLOOR_2" },
    { label: "Xuất cổng dưới - tầng 1", value: "OUTBOUND_GATE_BOTTOM_FLOOR_1" },
    { label: "Xuất cổng dưới - tầng 2", value: "OUTBOUND_GATE_BOTTOM_FLOOR_2" },
];

export default function ModalAddWorkflows({ open, onClose, onSuccess, editingRecord, warehouseId, existingWorkflows }: ModalAddWorkflowsProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const { control, handleSubmit, reset, formState: { isDirty } } = useForm<WorkflowFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            type: "",
            description: "",
        }
    });

    useEffect(() => {
        if (editingRecord && open) {
            reset({
                name: editingRecord.name ?? "",
                type: editingRecord.code ?? "",
                description: editingRecord.description ?? "",
            });
        } else if (!open) {
            reset({ name: "", type: "", description: "" });
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: WorkflowFormData) => {
        // Kiểm tra trùng loại quy trình (code) ở phía FE để thông báo ngay
        const isDuplicate = existingWorkflows?.some(w =>
            w.code === data.type && w.id !== editingRecord?.id
        );

        if (isDuplicate) {
            showError("Loại quy trình này đã tồn tại");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingRecord) {
                const res = await updateWorkflow(warehouseId, editingRecord.id, {
                    name: data.name,
                    code: data.type,
                    description: data.description,
                });

                if (res.success) {
                    showSuccess("Cập nhật quy trình thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể cập nhật quy trình");
                }
            } else {
                const res = await createWorkflow(warehouseId, {
                    name: data.name,
                    code: data.type,
                    description: data.description,
                });

                if (res.success) {
                    showSuccess("Thêm mới quy trình thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể thêm mới quy trình");
                }
            }
        } catch (error) {
            showError("Đã xảy ra lỗi");
        } finally {
            setIsSubmitting(false);
        }
    }

    const commonLabelCol = {
        md: { flex: '200px' },
        xs: { span: 24 },
        style: {
            height: 40,
            fontSize: 14,
            fontWeight: 400,
            textAlign: "left" as const,
            display: "flex",
            alignItems: "center",
            color: "#404040",
        }
    };

    const commonWrapperCol = {
        md: { flex: 'auto' },
        xs: { span: 24 },
        style: { paddingLeft: 0, maxWidth: '100%' }
    };

    return (
        <ModalThemeProvider>
            <Modal
                closable={true}
                title={
                    <span style={{ fontSize: 18, fontWeight: 500, color: '#484848' }}>
                        {!!editingRecord ? "Chỉnh sửa quy trình" : "Thêm mới quy trình"}
                    </span>
                }
                open={open}
                width={1000}
                centered
                zIndex={1005}
                className="responsive-modal"
                styles={{
                    mask: {
                        backdropFilter: "blur(0px)"
                    },
                    container: {
                        padding: "20px 40px 30px 40px",
                    }
                }}
                footer={null}
                onCancel={onClose}
                destroyOnHidden
            >
                <div className="flex flex-col items-center w-full">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] md:mb-[30px] mt-[9px]"></div>
                    <Form onFinish={handleSubmit(handleSubmitForm)} className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]">
                        <FormItemController
                            name="name"
                            label="Tên quy trình"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên quy trình"
                                />
                            )}
                        />

                        <FormItemController
                            name="type"
                            label="Loại quy trình"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    placeholder="Chọn loại quy trình áp dụng"
                                    options={PROCESS_TYPE_OPTIONS}
                                    className="w-full h-[40px]"
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                />
                            )}
                        />

                        <FormItemController
                            name="description"
                            label="Mô tả"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Mô tả quy trình"
                                />
                            )}
                        />

                        <div className="flex flex-row items-center justify-center gap-[20px] mt-[30px]">
                            <Button
                                onClick={onClose}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: "white",
                                    color: "#A1A1A1",
                                    border: "1px solid #A1A1A1",
                                    padding: "5px 15px",
                                    height: 30,
                                    width: 80,
                                    borderRadius: 20,
                                }}
                            >
                                Quay về
                            </Button>
                            <Button
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting || (!isDirty && !editingRecord)}
                                style={{
                                    backgroundColor: isSubmitting ? "#f5f5f5" : "#076EB8",
                                    color: isSubmitting ? "rgba(0, 0, 0, 0.25)" : "white",
                                    border: isSubmitting ? "1px solid #d9d9d9" : "none",
                                    padding: "5px 15px",
                                    height: 30,
                                    minWidth: 54,
                                    borderRadius: 20,
                                }}
                            >
                                Lưu
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </ModalThemeProvider>
    )
}
