"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { Form, Button, Modal, InputNumber, Input, message, Select } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalProps } from "@/types/common";
import { createWarehouse, updateWarehouse, WareHouseProps } from "../warehouseAcction";
import { useRouter } from "next/navigation";
import { useNotify } from "@/hook/notification/NotificationProvider";

// Định nghĩa Schema validation bằng Zod
const schema = z.object({
    name: z.string().trim().min(1, "Tên kho không được để trống"),
    code: z.string().trim().min(1, "Mã kho không được để trống"),
    row: z.number({ message: "Thông tin dãy phải là số" }).min(1, "Số dãy phải lớn hơn 0").optional(),
    column: z.number({ message: "Thông tin cột phải là số" }).min(1, "Số cột phải lớn hơn 0").optional(),
    status: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ModalAddWarehouse({
    open,
    onClose,
    children,
}: ModalProps<any>) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const notify = useNotify();
    const router = useRouter();
    const [modal, contextHolder] = Modal.useModal();
    const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
    const [formData, setFormData] = useState<FormValues | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }, // Lấy đối tượng errors ra để hiển thị trạng thái lỗi
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",        // 🔥 BẮT LỖI NGAY KHI USER VỪA NHẬP CHỮ (On Change)
        reValidateMode: "onChange", // Tự động xóa thông báo lỗi ngay khi user vừa sửa lại cho đúng
        defaultValues: {
            name: "",
            code: "",
            row: undefined,
            column: undefined,
            status: "NEW",
        },
    });

    // Theo dõi trạng thái đóng/mở modal để đổ dữ liệu cũ vào (nếu là edit) hoặc clear form (nếu là add mới)
    useEffect(() => {
        if (children && open) {
            const rawStatus = (children.Status || "NEW").toUpperCase();
            reset({
                name: children.Name ?? "",
                code: children.Code ?? "",
                row: children.Row ?? 10,
                column: children.Column ?? 10,
                status: rawStatus === "NEW" || rawStatus === "CREATED" ? "NEW" : rawStatus,
            });
        } else if (!open) {
            reset({
                name: "",
                code: "",
                row: 1,
                column: 1,
                status: "NEW",
            });
        }
    }, [children, open, reset]);

    const handleSubmitForm = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload: WareHouseProps = {
                name: data.name,
                code: data.code,
                row: data.row ?? children?.row ?? 10,
                column: data.column ?? children?.column ?? 10,
                config: {},
                status: (data.status || "new").toUpperCase(),
                total_positions: 0,
            };

            let response: any;
            if (children?.ID) {
                response = await updateWarehouse(children.ID, payload);
            } else {
                response = await createWarehouse(payload);
            }

            if (response && response.error) {
                notify.error(response.error);
            } else {
                notify.success(
                    children?.ID ? "Cập nhật thông tin kho thành công" : "Thêm mới kho thành công"
                );
                router.refresh();
                reset();
                onClose();
            }
        } catch (error: any) {
            console.error("Submit error:", error);
            notify.error("Đã xảy ra lỗi không xác định");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFormSubmit = (data: FormValues) => {
        setFormData(data);
        setConfirmSubmitOpen(true);
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

    const isEditActive = !!(children?.id || children?.ID) && (children.Status || "").toUpperCase() === "ACTIVE";

    return (
        <ModalThemeProvider>
            {contextHolder}
            <Modal
                closable={true}
                title={
                    <span style={{ fontSize: 18, fontWeight: 500, color: "#484848" }}>
                        {children?.id ? "Chỉnh sửa thông tin kho" : "Thêm mới kho"}
                    </span>
                }
                open={open}
                width={1000}
                centered
                zIndex={1060}
                styles={{
                    mask: {
                        backdropFilter: "blur(0px)",
                    },
                    container: {
                        padding: "20px 40px 30px 40px",
                    },
                }}
                footer={null}
                onCancel={onClose}
                destroyOnHidden// Sử dụng thuộc tính chuẩn thay vì destroyOnHidden
            >
                <div className="flex flex-col items-center w-full">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] md:mb-[30px] mt-[9px]"></div>

                    <Form
                        onFinish={handleSubmit(onFormSubmit)}
                        className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]"
                    >
                        {/* Tên kho */}
                        <FormItemController
                            name="code"
                            label="Mã kho"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    disabled={!!(children?.id || children?.ID)}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mã kho"
                                />
                            )}
                        />

                        <FormItemController
                            name="name"
                            label="Tên kho"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    disabled={isEditActive}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên kho"
                                />
                            )}
                        />

                        {/* Mã kho */}

                        <FormItemController
                            name="column"
                            label="Số cột"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <InputNumber
                                    style={{ width: "100%", height: 40 }}
                                    {...field}
                                    disabled={isEditActive}
                                    value={field.value || undefined}
                                    className="w-full rounded-md flex items-center"
                                    placeholder="Nhập số cột"
                                />
                            )}
                        />

                        {/* Số dãy */}
                        <FormItemController
                            name="row"
                            label="Số dãy"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <InputNumber
                                    style={{ width: "100%", height: 40 }}
                                    {...field}
                                    disabled={isEditActive}
                                    value={field.value || undefined}
                                    className="w-full rounded-md flex items-center"
                                    placeholder="Nhập số dãy"
                                />
                            )}
                        />

                        {/* Số cột */}


                        {/* Trạng thái - Chỉ hiển thị khi chỉnh sửa */}
                        {(children?.id || children?.ID) && (
                            <FormItemController
                                name="status"
                                label="Trạng thái"
                                style={{ width: "100%", marginBottom: 20 }}
                                control={control}
                                wrapperCol={commonWrapperCol}
                                labelCol={commonLabelCol}
                                render={(field) => (
                                    <Select
                                        {...field}
                                        className="w-full h-[40px] rounded-md"
                                        placeholder="Chọn trạng thái"
                                        options={[
                                            { value: 'NEW', label: 'Mới tạo' },
                                            { value: 'MAINTENANCE', label: 'Đang bảo trì' },
                                            { value: 'ACTIVE', label: 'Đang sử dụng' },
                                        ]}
                                    />
                                )}
                            />
                        )}

                        {/* Nút điều hướng Footer */}
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

            <ModalConfirmDelete
                open={confirmSubmitOpen}
                title={children?.id ? "Xác nhận chỉnh sửa" : "Xác nhận thêm mới"}
                content={children?.id ? "Bạn có chắc chắn muốn lưu các thay đổi này không?" : "Bạn có chắc chắn muốn thêm mới kho này không?"}
                loading={isSubmitting}
                onClose={() => setConfirmSubmitOpen(false)}
                onConfirm={() => {
                    if (formData) {
                        handleSubmitForm(formData).finally(() => setConfirmSubmitOpen(false));
                    }
                }}
            />
        </ModalThemeProvider>
    );
}