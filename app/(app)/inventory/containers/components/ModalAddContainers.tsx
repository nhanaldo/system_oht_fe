"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Input } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container, ModalAddContainersProps } from "@/types/container";
import { createContainer, updateContainer } from "../containersAction";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
    code: z.string().trim().min(1, "Mã loại pallet không được để trống"),
    name: z.string().trim().min(1, "Tên loại pallet không được để trống"),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    payload: z.string().trim().min(1, "Tải trọng không được để trống"),
    description: z.string().optional(),
});

type ContainerFormData = z.infer<typeof schema>;

const parseMetadata = (metadata: any) => {
    // trả vê dữ liệu rổng nếu ko có data
    if (!metadata) return {};
    // nếu metadata là object thì return luôn
    if (typeof metadata === "object") return metadata;
    // nếu metadata là string thì đưa về json 
    try {
        return JSON.parse(metadata);
    } catch (e) {
        return {};
    }
};

export default function ModalAddContainers({
    open,
    onClose,
    onSuccess,
    editingRecord,
    warehouseId,
    existingContainers,
}: ModalAddContainersProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<ContainerFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: "",
            name: "",
            length: "",
            width: "",
            height: "",
            payload: "",
            description: "",
        },
    });

    useEffect(() => {
        if (editingRecord && open) {
            reset({
                code: editingRecord.code ?? "",
                name: editingRecord.container_type ?? "",
                payload: editingRecord.status ?? "",
                description: editingRecord.qr_code ?? "",
                length: "",
                width: "",
                height: "",
            });
        } else if (!open) {
            reset({
                code: "",
                name: "",
                length: "",
                width: "",
                height: "",
                payload: "",
                description: "",
            });
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: ContainerFormData) => {
        const isDuplicate = existingContainers?.some(
            (c) =>
                c.code.toLowerCase().trim() === data.code.toLowerCase().trim() &&
                c.id !== editingRecord?.id
        );

        if (isDuplicate) {
            showError("Loại pallet này đã tồn tại trong kho");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                code: data.code,
                container_type: data.name,
                status: data.payload.toString(),
                qr_code: data.description || "",
            };

            if (editingRecord) {
                const res = await updateContainer(warehouseId, editingRecord.id, payload);

                if (res.success) {
                    showSuccess("Cập nhật loại pallet thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể cập nhật loại pallet");
                }
            } else {
                const res = await createContainer(warehouseId, payload);

                if (res.success) {
                    showSuccess("Thêm mới loại pallet thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể thêm mới loại pallet");
                }
            }
        } catch (error) {
            showError("Đã xảy ra lỗi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const commonLabelCol = {
        md: { flex: "200px" },
        xs: { span: 24 },
        style: {
            height: 40,
            fontSize: 14,
            fontWeight: 400,
            textAlign: "left" as const,
            display: "flex",
            alignItems: "center",
            color: "#404040",
        },
    };

    const commonWrapperCol = {
        md: { flex: "auto" },
        xs: { span: 24 },
        style: { paddingLeft: 0, maxWidth: "100%" },
    };

    return (
        <ModalThemeProvider>
            <Modal
                closable={true}
                title={
                    <span style={{ fontSize: 18, fontWeight: 500, color: "#484848" }}>
                        {!!editingRecord ? "Chỉnh sửa loại pallet" : "Thêm mới loại pallet"}
                    </span>
                }
                open={open}
                width={800}
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
                <div className="flex flex-col items-center w-full">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] md:mb-[30px] mt-[9px]"></div>
                    <Form
                        onFinish={handleSubmit(handleSubmitForm)}
                        className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]"
                    >
                        <FormItemController
                            name="code"
                            label="Mã loại pallet"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mã loại pallet"
                                />
                            )}
                        />

                        <FormItemController
                            name="name"
                            label="Tên loại pallet"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên loại pallet"
                                />
                            )}
                        />

                        <FormItemController
                            name="length"
                            label="Dài"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    disabled
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập chiều dài"
                                />
                            )}
                        />

                        <FormItemController
                            name="width"
                            label="Rộng (mm)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    disabled
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập chiều rộng"
                                />
                            )}
                        />

                        <FormItemController
                            name="height"
                            label="Cao (mm)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    disabled
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập chiều cao"
                                />
                            )}
                        />

                        <FormItemController
                            name="payload"
                            label="Tải trọng (kg)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tải trọng tối đa"
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
                                    placeholder="Nhập mô tả"
                                />
                            )}
                        />

                        <div className="flex flex-row items-center justify-center gap-[20px] mt-[30px] ">
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
                                Hủy
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
    );
}
