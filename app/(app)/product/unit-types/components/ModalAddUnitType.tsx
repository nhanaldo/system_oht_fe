"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Input } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UnitType, ModalAddUnitTypeProps } from "@/types/unit-type";
import { createUnitOfMeasure, updateUnitOfMeasure } from "../unit-typesAction";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
    code: z.string().trim().min(1, "Mã đơn vị tính không được để trống"),
    name: z.string().trim().min(1, "Đơn vị tính không được để trống"),
    description: z.string().trim().optional(),
});

type UnitTypeFormData = z.infer<typeof schema>;

export default function ModalAddUnitType({
    open,
    onClose,
    onSuccess,
    editingRecord,
    existingUnitTypes,
}: ModalAddUnitTypeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<UnitTypeFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: "",
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (editingRecord && open) {
            reset({
                code: editingRecord.code ?? "",// nộp giá trị cũ vào cho form edit
                name: editingRecord.name ?? "",
                description: editingRecord.description ?? editingRecord.discripsion ?? "",
            });
        } else if (!open) {
            reset({ code: "", name: "", description: "" });// reset form khi đóng modal
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: UnitTypeFormData) => {
        const isDuplicate = existingUnitTypes?.some(
            (u) =>
                u.name.toLowerCase().trim() === data.name.toLowerCase().trim() &&
                u.id !== editingRecord?.id
        );

        if (isDuplicate) {
            showError("Đơn vị tính này đã tồn tại");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingRecord) {
                const res = await updateUnitOfMeasure(editingRecord.id, {
                    code: "",
                    name: data.name,
                    description: data.description,
                });

                if (res.success) {
                    showSuccess("Cập nhật đơn vị tính thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể cập nhật đơn vị tính");
                }
            } else {
                const res = await createUnitOfMeasure({
                    code: data.code,
                    name: data.name,
                    description: data.description,
                });

                if (res.success) {
                    showSuccess("Thêm mới đơn vị tính thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể thêm mới đơn vị tính");
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
                        {!!editingRecord ? "Chỉnh sửa đơn vị tính" : "Thêm mới đơn vị tính"}
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
                <div className="flex flex-col items-center w-full">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] md:mb-[30px] mt-[9px]"></div>
                    <Form
                        onFinish={handleSubmit(handleSubmitForm)}
                        className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]"
                    >
                        {!editingRecord && (
                            <FormItemController
                                name="code"
                                label="Mã đơn vị tính"
                                style={{ width: "100%", marginBottom: 20 }}
                                control={control}
                                required
                                wrapperCol={commonWrapperCol}
                                labelCol={commonLabelCol}
                                render={(field) => (
                                    <Input
                                        {...field}
                                        className="w-full h-[40px] rounded-md p-2"
                                        placeholder="Nhập mã đơn vị tính"
                                    />
                                )}
                            />
                        )}
                        <FormItemController
                            name="name"
                            label="Đơn vị tính"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên đơn vị tính (ví dụ: kg, cái, thùng...)"
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
                                    placeholder="Nhập mô tả đơn vị tính..."
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
    );
}
