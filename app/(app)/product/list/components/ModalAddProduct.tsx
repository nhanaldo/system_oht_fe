"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Input, Select, Switch } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProduct, updateProduct } from "../listAction";
import { useToast } from "@/components/ui/Toast";
import { ModalAddProductProps, ProductItem } from "@/types/product";

const schema = z.object({
    code: z.string().trim().min(1, "Mã sản phẩm không được để trống"),
    name: z.string().trim().min(1, "Tên sản phẩm không được để trống"),
    category_id: z.string().trim().min(1, "Phẩm cấp không được để trống"),
    weight: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number({ message: "Khối lượng không được để trống" }).min(0, "Khối lượng phải lớn hơn hoặc bằng 0")
    ),
    unit_of_measure_id: z.string().trim().min(1, "Đơn vị tính không được để trống"),
    method_id: z.string().trim().min(1, "Quy cách không được để trống"),
    is_active: z.boolean(),
    description: z.string().optional(),
});

export default function ModalAddProduct({
    open,
    onClose,
    warehouseId,
    categoryOptions,
    uomOptions,
    methodOptions,
    editingRecord,
    onSuccess,
    existingProducts
}: ModalAddProductProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();
    const isEdit = !!editingRecord;

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<any>({
        resolver: zodResolver(schema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            code: "",
            name: "",
            category_id: "",
            weight: undefined,
            unit_of_measure_id: "",
            method_id: "",
            is_active: true,
            description: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (editingRecord) {
                reset({
                    code: editingRecord.code ?? "",
                    name: editingRecord.name ?? "",
                    category_id: editingRecord.category_id ?? "",
                    weight: editingRecord.weight !== undefined && editingRecord.weight !== null ? Number(editingRecord.weight) : undefined,
                    unit_of_measure_id: editingRecord.unit_of_measure_id ?? "",
                    method_id: editingRecord.method_id ?? "",
                    is_active: editingRecord.is_active ?? true,
                    description: editingRecord.description ?? "",
                });
            } else {
                reset({
                    code: "",
                    name: "",
                    category_id: "",
                    weight: undefined,
                    unit_of_measure_id: "",
                    method_id: "",
                    is_active: true,
                    description: "",
                });
            }
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: any) => {
        const isDuplicate = existingProducts?.some(
            (p: any) =>
                p.code.toLowerCase().trim() === data.code.toLowerCase().trim() &&
                p.id !== editingRecord?.id
        );

        if (isDuplicate) {
            showError("Mã sản phẩm này đã tồn tại trong kho")
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                code: data.code,
                name: data.name,
                category_id: data.category_id,
                weight: data.weight,
                unit_of_measure_id: data.unit_of_measure_id,
                method_id: data.method_id,
                is_active: data.is_active,
                description: data.description || "",
                warehouse_id: warehouseId,
            };

            let res;
            if (isEdit) {
                res = await updateProduct(warehouseId, editingRecord.id, payload);
            } else {
                res = await createProduct(warehouseId, payload);
            }

            if (res.success) {
                showSuccess(isEdit ? "Cập nhật sản phẩm thành công" : "Thêm mới sản phẩm thành công");
                console.log("here", res);

                onClose();
                onSuccess?.();
            } else {
                showError(res.error || "Không thể thực hiện tác vụ");
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
                        {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm mới sản phẩm"}
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
                        padding: "20px 24px 30px 24px",
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
                            label="Mã sản phẩm"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mã sản phẩm (ví dụ: 43CP-SEIKA-18)"
                                />
                            )}
                        />

                        <FormItemController
                            name="name"
                            label="Tên sản phẩm"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên sản phẩm"
                                />
                            )}
                        />

                        <FormItemController
                            name="category_id"
                            label="Phẩm cấp / Danh mục"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    value={field.value || undefined}
                                    placeholder="Chọn nhóm phẩm cấp"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={categoryOptions}
                                    className="w-full h-[40px]"
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ opacity: 0.6 }} />}
                                    virtual={false}
                                    styles={{ popup: { root: { maxHeight: 'none', overflow: 'hidden' } } }}
                                    popupRender={(menu) => (
                                        <OverlayScrollbarsComponent
                                            options={{
                                                scrollbars: {
                                                    autoHide: 'leave',
                                                    autoHideDelay: 500,
                                                }
                                            }}
                                            style={{ maxHeight: '250px' }}
                                        >
                                            {menu}
                                        </OverlayScrollbarsComponent>
                                    )}
                                />
                            )}
                        />

                        <FormItemController
                            name="unit_of_measure_id"
                            label="Đơn vị tính"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    value={field.value || undefined}
                                    placeholder="Chọn đơn vị tính"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={uomOptions}
                                    className="w-full h-[40px]"
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ opacity: 0.6 }} />}
                                    virtual={false}
                                    styles={{ popup: { root: { maxHeight: 'none', overflow: 'hidden' } } }}
                                    popupRender={(menu) => (
                                        <OverlayScrollbarsComponent
                                            options={{
                                                scrollbars: {
                                                    autoHide: 'leave',
                                                    autoHideDelay: 500,
                                                }
                                            }}
                                            style={{ maxHeight: '250px' }}
                                        >
                                            {menu}
                                        </OverlayScrollbarsComponent>
                                    )}
                                />
                            )}
                        />

                        <FormItemController
                            name="weight"
                            label="Khối lượng (kg)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.1"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập khối lượng"
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            )}
                        />

                        <FormItemController
                            name="method_id"
                            label="Quy cách / Phương pháp"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    value={field.value || undefined}
                                    placeholder="Chọn quy cách"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={methodOptions.map(m => ({ label: m.code || m.label, value: m.value }))}
                                    className="w-full h-[40px]"
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ opacity: 0.6 }} />}
                                    virtual={false}
                                    styles={{ popup: { root: { maxHeight: 'none', overflow: 'hidden' } } }}
                                    popupRender={(menu) => (
                                        <OverlayScrollbarsComponent
                                            options={{
                                                scrollbars: {
                                                    autoHide: 'leave',
                                                    autoHideDelay: 500,
                                                }
                                            }}
                                            style={{ maxHeight: '250px' }}
                                        >
                                            {menu}
                                        </OverlayScrollbarsComponent>
                                    )}
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
                                <Input.TextArea
                                    {...field}
                                    className="w-full rounded-md p-2 !h-[40px] "
                                    placeholder="Nhập mô tả sản phẩm"

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
