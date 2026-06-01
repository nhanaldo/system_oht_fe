"use client";

import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, Button, Modal, Input, Select } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BoxType, ModalAddBoxTypeProps, BoxTypeFormData } from "@/types/box-type";
import { createBoxType, updateBoxType, getUnitOfMeasures } from "../boxTypesAction";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
    name: z.string().trim().min(1, "Loại thùng không được để trống"),
    dimensions: z.string()
        .trim()
        .min(1, "Kích thước không được để trống")
        .regex(/^[0-9\s*xX]+$/, "Kích thước phải là số hoặc chứa các ký tự '*', 'x' (VD: 600*60 hoặc 600x400)"),
    tare_weight: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number({ message: "Trọng lượng vỏ thùng không được để trống" }).min(0, "Trọng lượng vỏ thùng phải lớn hơn hoặc bằng 0")
    ),
    material: z.string().trim().min(1, "Chất liệu không được để trống"),
    unit_of_measure_id: z.string().trim().min(1, "Đơn vị tính không được để trống"),
});

export default function ModalAddBoxType({
    open,
    onClose,
    onSuccess,
    editingRecord,
    warehouseId,
    existingBoxTypes,
}: ModalAddBoxTypeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uoms, setUoms] = useState<{ id: string; name: string }[]>([]);
    const { showSuccess, showError } = useToast();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<BoxTypeFormData>({
        resolver: zodResolver(schema),
        mode: "onChange",        // 🔥 BẮT LỖI NGAY KHI USER VỪA NHẬP CHỮ (On Change)
        reValidateMode: "onChange",  // Tự động xóa thông báo lỗi ngay khi sửa lại cho đúng
        defaultValues: {
            name: "",
            dimensions: "",
            tare_weight: undefined,
            material: "",
            unit_of_measure_id: "",
        },
    });

    useEffect(() => {
        if (open) {
            const fetchUoms = async () => {
                const res: any = await getUnitOfMeasures();
                if (res.success) {
                    const data = Array.isArray(res.data)
                        ? res.data
                        : (res.data?.elements || res.data?.rows || []);
                    setUoms(data);
                }
            };
            fetchUoms();
        }
    }, [open]);

    useEffect(() => {
        if (editingRecord && open) {
            const parseDimensions = (val: any) => {
                if (val === null || val === undefined) return "";
                return String(val);
            };

            const parseTareWeight = (val: any) => {
                if (val === null || val === undefined || val === "") return undefined;
                const num = Number(val);
                return isNaN(num) ? val : num;
            };

            reset({
                name: editingRecord.name ?? "",
                dimensions: parseDimensions(editingRecord.dimensions),
                tare_weight: parseTareWeight(editingRecord.tare_weight),
                material: editingRecord.material ?? "",
                unit_of_measure_id: editingRecord.unit_of_measure_id ?? "",
            });
        } else if (!open) {
            reset({
                name: "",
                dimensions: "",
                tare_weight: undefined,
                material: "",
                unit_of_measure_id: "",
            });
        }
    }, [editingRecord, open, reset]);

    const handleSubmitForm = async (data: BoxTypeFormData) => {
        const isDuplicate = existingBoxTypes?.some(
            (b) =>
                b.name.toLowerCase().trim() === data.name.toLowerCase().trim() &&
                b.id !== editingRecord?.id
        );

        if (isDuplicate) {
            showError("Loại thùng này đã tồn tại trong kho");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingRecord) {
                const res = await updateBoxType(warehouseId, editingRecord.id, {
                    name: data.name,
                    dimensions: String(data.dimensions),
                    tare_weight: data.tare_weight,
                    material: data.material,
                    unit_of_measure_id: data.unit_of_measure_id,
                });
                if (res.success) {
                    showSuccess("Cập nhật loại thùng thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể cập nhật loại thùng");
                }
            } else {
                const res = await createBoxType(warehouseId, {
                    name: data.name,
                    dimensions: String(data.dimensions),
                    tare_weight: data.tare_weight,
                    material: data.material,
                    unit_of_measure_id: data.unit_of_measure_id,
                });

                if (res.success) {
                    showSuccess("Thêm mới loại thùng thành công");
                    onClose();
                    onSuccess?.();
                } else {
                    showError(res.error || "Không thể thêm mới loại thùng");
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
                        {!!editingRecord ? "Chỉnh sửa loại thùng" : "Thêm mới loại thùng"}
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
                            name="name"
                            label="Loại thùng"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập loại thùng"
                                />
                            )}
                        />

                        <FormItemController
                            name="dimensions"
                            label="Kích thước (mm)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập kích thước thùng (VD: 600*60 hoặc 600x400x250)"
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />

                        <FormItemController
                            name="tare_weight"
                            label="Trọng lượng vỏ thùng (kg)"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.001"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập trọng lượng vỏ thùng"
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            )}
                        />

                        <FormItemController
                            name="material"
                            label="Chất liệu"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập chất liệu"
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
                                    options={uoms.map((u) => ({
                                        label: u.name,
                                        value: u.id,
                                    }))}
                                    className="w-full h-[40px]"
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
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
