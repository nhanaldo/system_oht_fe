"use client";

import { Modal, Input, Button, Form } from "antd";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import FormItemController from "@/components/ui/CustomController";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addRole, updateRole } from "../roleAction";
import { RoleAddParams } from "@/types/role";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
    name: z.string().min(1, "Vui lòng nhập tên vai trò hợp lệ (không để trống)!").trim(),
    description: z.string().optional(),
});

interface ModalAddRoleProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    roleOptions?: { label: string, value: string }[];
    editingRecord?: any;
}

export default function ModalAddRole({ open, onClose, onSuccess, roleOptions, editingRecord }: ModalAddRoleProps) {
    const isEditMode = !!editingRecord?.id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const { control, handleSubmit, reset, formState: { isDirty } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            description: "",
        }
    });

    useEffect(() => {
        if (open) {
            if (editingRecord) {
                reset({
                    name: editingRecord.name ?? "",
                    description: editingRecord.description ?? "",
                });
            } else {
                reset({ name: "", description: "" });
            }
        } else {
            reset({ name: "", description: "" });
        }
    }, [open, editingRecord, reset]);

    const handleCancel = () => {
        reset();
        onClose();
    };

    const handleSubmitForm = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                // Edit mode
                const response = await updateRole(editingRecord.id, {
                    name: data.name,
                    description: data.description?.trim(),
                });

                if (response.success) {
                    showSuccess("Cập nhật vai trò thành công");
                    reset();
                    if (onSuccess) onSuccess();
                    onClose();
                    router.refresh();
                } else {
                    showError(response.error || "Có lỗi xảy ra khi cập nhật");
                }
            } else {
                // Add mode
                const newName = data.name;
                const isDuplicate = roleOptions?.some(opt =>
                    opt.value.trim().toLowerCase() === newName.toLowerCase()
                );

                if (isDuplicate) {
                    showError("Vai trò này đã tồn tại!");
                    setIsSubmitting(false);
                    return;
                }

                const payload: RoleAddParams = {
                    name: newName,
                    description: data.description?.trim(),
                };

                const response = await addRole(payload);

                if (response.success) {
                    showSuccess("Thêm mới vai trò thành công");
                    reset();
                    if (onSuccess) onSuccess();
                    onClose();
                    router.refresh();
                } else {
                    showError(response.error || "Có lỗi xảy ra khi thêm mới");
                }
            }
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const commonLabelCol = {
        md: { flex: '160px' },
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
        md: { flex: '1' },
        xs: { span: 24 },
        style: { paddingLeft: 0, maxWidth: '100%' }
    };

    return (
        <Modal
            title={
                <span className="text-[18px] font-medium text-[#484848]">
                    {isEditMode ? "Chỉnh sửa vai trò" : "Thêm mới vai trò"}
                </span>
            }
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            centered
            className="responsive-modal"
            forceRender
            styles={{
                header: {
                    paddingBottom: '16px',
                    marginBottom: '24px'
                },
                mask: { backdropFilter: "blur(0px)" },
                container: { padding: "20px 40px 30px 40px" }
            }}
            destroyOnHidden
        >
            <div className="h-[1px] bg-[#C0C0C0] w-full mt-[9px]"></div>
            <ModalThemeProvider>
                <div className="mt-[25px] px-4 w-full flex items-center justify-center">
                    <Form onFinish={handleSubmit(handleSubmitForm)} className="flex flex-col items-center justify-center w-full max-w-full md:w-[680px]">

                        <FormItemController
                            name="name"
                            label="Vai trò"
                            style={{ width: "100%", }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    placeholder="Nhập tên vai trò"
                                    className="w-full h-[40px] rounded-md p-2"
                                />
                            )}
                        />

                        <FormItemController
                            name="description"
                            label="Mô tả"
                            style={{ width: "100%", marginBottom: 30 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    placeholder="Nhập mô tả"
                                    className="w-full h-[40px] rounded-md p-2"
                                />
                            )}
                        />

                        <div className="flex justify-center gap-[20px] mb-[10px] items-center">
                            <Button
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="w-[80px] h-[30px]"
                                style={{ borderRadius: '20px', borderColor: '#a1a1a1', color: '#a1a1a1', backgroundColor: "white" }}
                            >
                                Quay lại
                            </Button>
                            <Button
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                className="w-[54px] h-[30px]"
                                style={{
                                    backgroundColor: isSubmitting ? "#f5f5f5" : '#076eb8',
                                    borderColor: isSubmitting ? "#d9d9d9" : '#076eb8',
                                    color: isSubmitting ? "rgba(0, 0, 0, 0.25)" : "white",
                                    borderRadius: '20px'
                                }}
                            >
                                Lưu
                            </Button>
                        </div>
                    </Form>
                </div>
            </ModalThemeProvider>
        </Modal>
    );
}
