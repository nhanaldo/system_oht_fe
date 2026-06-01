"use client";

import { Modal, Button, Input, Form } from "antd";
import { useState, useEffect } from "react";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormItemController from "@/components/ui/CustomController";
import { addResource, updateResource } from "../resourcesAction";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
    name: z.string().min(1, "Vui lòng nhập tên resource"),
    code: z.string().min(1, "Vui lòng nhập mã resource"),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ModalAddResourcesProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onRefresh?: () => void;
    initialData?: any;
}

export default function ModalAddResources({ open, onClose, onSuccess, onRefresh, initialData }: ModalAddResourcesProps) {
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    const isEdit = !!initialData;

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
        }
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name || "",
                    code: initialData.code || "",
                    description: initialData.description || "",
                });
            } else {
                reset({
                    name: "",
                    code: "",
                    description: "",
                });
            }
        }
    }, [open, reset, initialData]);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const res = isEdit
                ? await updateResource(initialData.id, values)
                : await addResource(values);

            if (res.success) {
                showSuccess(isEdit ? "Cập nhật resource thành công" : "Thêm mới resource thành công");
                if (onRefresh) onRefresh();
                if (onSuccess) onSuccess();
                onClose();
            } else {
                showError("Resources này đã tồn tại");
            }
        } catch (error: any) {
            showError("Có lỗi xảy ra, vui lòng thử lại");
            console.error(error);
        } finally {
            setLoading(false);
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
        <Modal
            title={<span className="text-[18px] font-roboto font-semibold text-[#2C352C]">{isEdit ? "Chỉnh sửa Resource" : "Thêm mới Resource"}</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            centered
            destroyOnHidden
            className="responsive-modal"
            styles={{
                mask: {
                    backdropFilter: "blur(0px)"
                },

                container: {
                    padding: "16px 24px 35px 24px",
                }
            }}
        >
            <div className="flex flex-col items-center w-full">
                <div className="h-[1px] bg-[#C0C0C0] w-full mb-[30px] mt-[9px]"></div>

                <Form
                    onFinish={handleSubmit(onSubmit)}
                    className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]"
                >
                    <FormItemController
                        control={control}
                        name="name"
                        label="Resource"
                        required
                        style={{ width: "100%", marginBottom: 20 }}
                        labelCol={commonLabelCol}
                        wrapperCol={commonWrapperCol}
                        render={(field) => (
                            <Input
                                {...field}
                                placeholder="Nhập Resource"
                                className="w-full h-[40px] rounded-md p-2"
                            />
                        )}
                    />

                    {!isEdit && (
                        <FormItemController
                            control={control}
                            name="code"
                            label="Code"
                            required
                            style={{ width: "100%", marginBottom: 20 }}
                            labelCol={commonLabelCol}
                            wrapperCol={commonWrapperCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    placeholder="Nhập Code"
                                    className="w-full h-[40px] rounded-md p-2"
                                />
                            )}
                        />
                    )}

                    <FormItemController
                        control={control}
                        name="description"
                        label="Mô tả"
                        style={{ width: "100%", marginBottom: 30 }}
                        labelCol={commonLabelCol}
                        wrapperCol={{
                            md: { flex: '0 0 520px' },
                            xs: { span: 24 },
                            style: { paddingLeft: 0, maxWidth: '100%' }
                        }}
                        render={(field) => (
                            <Input
                                {...field}
                                placeholder="Nhập mô tả"
                                className="w-full h-[40px] rounded-md p-2"
                            />
                        )}
                    />

                    <div className="flex flex-row items-center justify-center gap-[20px] mt-[20px] w-full">
                        <Button
                            onClick={onClose}
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
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{
                                backgroundColor: loading ? "#f5f5f5" : "#076EB8",
                                color: loading ? "rgba(0, 0, 0, 0.25)" : "white",
                                border: loading ? "1px solid #d9d9d9" : "none",
                                padding: "5px 15px",
                                height: 30,
                                width: 54,
                                borderRadius: 20,
                            }}
                        >
                            Lưu
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
