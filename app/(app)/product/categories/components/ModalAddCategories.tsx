"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Input, Select } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, ModalAddCategoriesProps } from "@/types/category";
import { createCategory, updateCategory } from "../categoriesAction";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
    code: z.string().trim().min(1, "Phẩm cấp không được để trống"),
    banana_variety: z.string().trim().min(1, "Giống chuối không được để trống"),
    name: z.string().trim().min(1, "Chủng loại không được để trống"),
    market: z.string().trim().min(1, "Thị trường không được để trống"),
    description: z.string().trim().optional(),
});

type CategoryFormData = z.infer<typeof schema>;

export default function ModalAddCategories({
    open,
    onClose,
    onSuccess,// đã gán router.refresh(); 
    editingRecord,
    warehouseId,
    existingCategories,
}: ModalAddCategoriesProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: "",
            name: "",
            description: "",
            banana_variety: "",
            market: undefined,
        },
    });

    useEffect(() => {
        if (editingRecord && open) {
            reset({
                code: editingRecord.code ?? "",
                name: editingRecord.name ?? "",
                description: editingRecord.description ?? "",
                banana_variety: editingRecord.banana_variety ?? "",
                market: editingRecord.market ?? "",
            });
        } else if (!open) {
            reset({ code: "", name: "", description: "", banana_variety: "", market: undefined });
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: CategoryFormData) => {
        const isDuplicate = existingCategories?.some(
            (c) =>
                c.code.toLowerCase().trim() === data.code.toLowerCase().trim() &&
                c.id !== editingRecord?.id
        );

        if (isDuplicate) {
            showError("Phẩm cấp này đã tồn tại trong kho");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingRecord) {
                const res = await updateCategory(warehouseId, editingRecord.id, {
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    banana_variety: data.banana_variety,
                    market: data.market,
                });
                
                if (res.success) {
                    showSuccess("Cập nhật phẩm cấp thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể cập nhật phẩm cấp");
                }
            } else {
                const res = await createCategory(warehouseId, {
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    banana_variety: data.banana_variety,
                    market: data.market,
                });

                if (res.success) {
                    showSuccess("Thêm mới phẩm cấp thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể thêm mới phẩm cấp");
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
                        {!!editingRecord ? "Chỉnh sửa phẩm cấp" : "Thêm mới phẩm cấp"}
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
                        <FormItemController
                            name="code"
                            label="Phẩm cấp"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên phẩm cấp"
                                />
                            )}
                        />

                        <FormItemController
                            name="banana_variety"
                            label="Giống chuối"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập giống chuối"
                                />
                            )}
                        />

                        <FormItemController
                            name="name"
                            label="Chủng loại"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập chủng loại"
                                />
                            )}
                        />

                        <FormItemController
                            name="market"
                            label="Thị trường"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    value={field.value || undefined}
                                    placeholder="Chọn thị trường xuất khẩu"
                                    options={[
                                        { label: "Nhật Bản", value: "Nhật Bản" },
                                        { label: "Trung Quốc", value: "Trung Quốc" },
                                    ]}
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
                                    placeholder="Nhập mô tả phẩm cấp..."
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
