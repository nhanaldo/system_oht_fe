"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, InputNumber, Input, message } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalProps } from "@/types/common";
import { createWarehouse, updateWarehouse, WareHouseProps } from "../warehouseAcction";
import { useRouter } from "next/navigation";

// Định nghĩa Schema validation bằng Zod
const schema = z.object({
    name: z.string().trim().min(1, "Tên kho không được để trống"),
    code: z.string().trim().min(1, "Mã kho không được để trống"),
    number_tower: z.number({ message: "Thông tin modle phải là số" }).min(1, "Số module phải lớn hơn 0").optional(),
    row: z.number({ message: "Thông tin dãy phải là số" }).min(1, "Số dãy phải lớn hơn 0").optional(),
    column: z.number({ message: "Thông tin cột phải là số" }).min(1, "Số cột phải lớn hơn 0").optional(),
    number_floor: z.number({ message: "Thông tin tầng phải là số" }).min(1, "Số tầng phải lớn hơn 0").optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ModalAddWarehouse({
    open,
    onClose,
    children,
}: ModalProps<any>) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();

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
            number_tower: 1,
            row: 10,
            column: 10,
            number_floor: 1,
        },
    });

    // Theo dõi trạng thái đóng/mở modal để đổ dữ liệu cũ vào (nếu là edit) hoặc clear form (nếu là add mới)
    useEffect(() => {
        if (children && open) {
            reset({
                name: children.name ?? "",
                code: children.code ?? "",
                number_tower: children.number_tower ?? 1,
                row: children.row ?? 10,
                column: children.column ?? 10,
                number_floor: children.number_floor ?? 1,
            });
        } else if (!open) {
            reset({
                name: "",
                code: "",
                number_tower: 1,
                row: 1,
                column: 1,
                number_floor: 1,
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
                number_tower: data.number_tower ?? children?.number_tower ?? 1,
                number_floor: data.number_floor ?? children?.number_floor ?? 1,
                total_position: (data.row ?? children?.row ?? 10) * (data.column ?? children?.column ?? 10),
                config: children?.config || {},
            };

            let response: any;
            if (children?.id) {
                response = await updateWarehouse(children.id, payload);
                console.log("update warehouse", response)
            } else {
                response = await createWarehouse(payload);
            }

            if (response && response.error) {
                messageApi.error(response.error);
            } else {
                messageApi.success(
                    children?.id ? "Cập nhật thông tin kho thành công" : "Thêm mới kho thành công"
                );
                router.refresh();
                reset();
                onClose();
            }
        } catch (error: any) {
            console.error("Submit error:", error);
            messageApi.error("Đã xảy ra lỗi không xác định");
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
                {contextHolder}
                <div className="flex flex-col items-center w-full">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] md:mb-[30px] mt-[9px]"></div>

                    <Form
                        onFinish={handleSubmit(handleSubmitForm)}
                        className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]"
                    >
                        {/* Tên kho */}
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
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên kho"
                                />
                            )}
                        />

                        {/* Mã kho */}
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
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mã kho"
                                />
                            )}
                        />

                        {/* Chỉ hiện các trường cấu hình ma trận nếu là tạo kho mới */}
                        {/* {!children?.id && (
                            <> */}
                        {/* Số module */}
                        <FormItemController
                            name="number_tower"
                            label="Số module"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <InputNumber
                                    style={{ width: "100%", height: 40 }}
                                    {...field}
                                    value={field.value || undefined}
                                    className="w-full rounded-md flex items-center"
                                    placeholder="Nhập số module"
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
                                    value={field.value || undefined}
                                    className="w-full rounded-md flex items-center"
                                    placeholder="Nhập số dãy"
                                />
                            )}
                        />

                        {/* Số cột */}
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
                                    value={field.value || undefined}
                                    className="w-full rounded-md flex items-center"
                                    placeholder="Nhập số cột"
                                />
                            )}
                        />

                        {/* Số tầng */}
                        <FormItemController
                            name="number_floor"
                            label="Số tầng"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <InputNumber
                                    style={{ width: "100%", height: 40 }}
                                    {...field}
                                    value={field.value || undefined}
                                    className="w-full rounded-md flex items-center"
                                    placeholder="Nhập số tầng"
                                />
                            )}
                        />
                        {/* </>
                            )} */}

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
        </ModalThemeProvider>
    );
}