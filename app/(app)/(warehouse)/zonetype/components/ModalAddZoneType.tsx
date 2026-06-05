"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Input } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addZoneType, updateZoneType } from "../zonetype";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

const schema = z.object({
    code: z.string().trim().min(1, "Mã loại khu vực không được để trống"),
    name: z.string().trim().min(1, "Tên loại khu vực không được để trống"),
    description: z.string().trim().optional(),
});

interface ModalAddZoneTypeProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingRecord?: any;
}

export default function ModalAddZoneType({ open, onClose, onSuccess, editingRecord }: ModalAddZoneTypeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const { control, handleSubmit, reset, formState: { isDirty } } = useForm({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            code: "",
            name: "",
            description: "",
        }
    });

    useEffect(() => {
        if (editingRecord && open) {
            reset({
                code: editingRecord.code ?? "",
                name: editingRecord.name ?? "",
                description: editingRecord.description ?? "",
            });
        } else if (!open) {
            reset({
                code: "",
                name: "",
                description: "",
            });
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload: any = {
                code: data.code?.trim(),
                name: data.name?.trim(),
                description: data.description?.trim(),
            };

            let response;
            if (editingRecord?.id) {
                response = await updateZoneType(editingRecord.id, payload);
            } else {
                response = await addZoneType(payload);
            }

            if (response.success) {
                showSuccess(editingRecord?.id ? 'Cập nhật loại khu vực thành công' : 'Thêm mới loại khu vực thành công');
                reset({
                    code: "",
                    name: "",
                    description: "",
                });
                onClose();
                onSuccess?.();
                router.refresh();
            } else {
                showError(response.error || (editingRecord?.id ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi thêm mới"));
            }
        } catch (error: any) {
            console.error('Error submitting form:', error);
            showError('Đã xảy ra lỗi không xác định');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        {!!editingRecord?.id ? "Chỉnh sửa loại khu vực" : "Thêm mới loại khu vực"}
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
                            name="code"
                            label="Mã loại khu vực"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    value={field.value as string}
                                    aria-label="Mã loại khu vực"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mã loại khu vực"
                                />
                            )}
                        />

                        <FormItemController
                            name="name"
                            label="Tên loại khu vực"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    value={field.value as string}
                                    aria-label="Tên loại khu vực"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên loại khu vực"
                                />
                            )}
                        />

                        {/* <FormItemController
                            name="description"
                            label="Mô tả"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    value={field.value as string}
                                    aria-label="Mô tả"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mô tả"
                                />
                            )}
                        /> */}

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
                                Quay lại
                            </Button>
                            <Button
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: isSubmitting ? "#f5f5f5" : "#076EB8",
                                    color: isSubmitting ? "rgba(0, 0, 0, 0.25)" : "white",
                                    border: isSubmitting ? "1px solid #d9d9d9" : "none",
                                    padding: "5px 15px",
                                    height: 30,
                                    width: 80,
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
    );
}
