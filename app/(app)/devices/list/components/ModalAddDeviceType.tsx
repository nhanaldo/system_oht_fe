"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Input } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDeviceType, updateDeviceType } from "../listAction";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

const schema = z.object({
    code: z.string().trim().min(1, "Mã nhóm thiết bị không được để trống"),
    name: z.string().trim().min(1, "Tên nhóm thiết bị không được để trống"),
    description: z.string().trim().optional(),
    max_load: z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().min(0, "Tải trọng phải lớn hơn hoặc bằng 0").optional()),
    max_speed: z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().min(0, "Tốc độ phải lớn hơn hoặc bằng 0").optional()),
});

interface ModalAddDeviceTypeProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingRecord?: any;
}

export default function ModalAddDeviceType({ open, onClose, onSuccess, editingRecord }: ModalAddDeviceTypeProps) {
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
            max_load: undefined,
            max_speed: undefined,
        }
    });

    const canSubmit = isDirty;

    useEffect(() => {
        if (editingRecord && open) {
            let maxLoad = undefined;
            let maxSpeed = undefined;
            if (editingRecord.default_spec) {
                try {
                    const spec = typeof editingRecord.default_spec === 'string' 
                        ? JSON.parse(editingRecord.default_spec) 
                        : editingRecord.default_spec;
                    maxLoad = spec?.max_load;
                    maxSpeed = spec?.max_speed;
                } catch (e) {
                    console.error("Failed to parse default_spec:", e);
                }
            }

            reset({
                code: editingRecord.code ?? "",
                name: editingRecord.name ?? "",
                description: editingRecord.description ?? "",
                max_load: maxLoad,
                max_speed: maxSpeed,
            });
        } else if (!open) {
            reset({
                code: "",
                name: "",
                description: "",
                max_load: undefined,
                max_speed: undefined,
            });
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: any) => {
        setIsSubmitting(true);
        try {
            const spec: any = {};
            if (data.max_load != null) spec.max_load = Number(data.max_load);
            if (data.max_speed != null) spec.max_speed = Number(data.max_speed);

            const payload: any = {
                code: data.code?.trim(),
                name: data.name?.trim(),
                description: data.description?.trim(),
                default_spec: Object.keys(spec).length > 0 ? JSON.stringify(spec) : "{}",
            };

            let response;
            if (editingRecord?.id) {
                response = await updateDeviceType(editingRecord.id, payload);
            } else {
                response = await addDeviceType(payload);
            }

            if (response.success) {
                showSuccess(editingRecord?.id ? 'Cập nhật nhóm thiết bị thành công' : 'Thêm mới nhóm thiết bị thành công');
                reset({
                    code: "",
                    name: "",
                    description: "",
                    max_load: undefined,
                    max_speed: undefined,
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
                        {!!editingRecord?.id ? "Chỉnh sửa nhóm thiết bị" : "Thêm mới nhóm thiết bị"}
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
                            label="Mã nhóm thiết bị"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    value={field.value as string}
                                    aria-label="Mã nhóm thiết bị"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mã nhóm thiết bị"
                                />
                            )}
                        />

                        <FormItemController
                            name="name"
                            label="Tên nhóm thiết bị"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    value={field.value as string}
                                    aria-label="Tên nhóm thiết bị"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên nhóm thiết bị"
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
                                    value={field.value as string}
                                    aria-label="Mô tả"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mô tả"
                                />
                            )}
                        />

                        {/* <FormItemController
                            name="max_load"
                            label="Tải trọng tối đa (kg)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    value={field.value as number}
                                    aria-label="Tải trọng tối đa"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tải trọng tối đa"
                                />
                            )}
                        />

                        <FormItemController
                            name="max_speed"
                            label="Tốc độ tối đa (m/s)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.1"
                                    value={field.value as number}
                                    aria-label="Tốc độ tối đa"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tốc độ tối đa"
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
