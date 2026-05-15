"use client";

import { Modal, Select, Button, message, Form } from "antd";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import FormItemController from "@/components/ui/CustomController";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWarehouses, updateAccountWarehouses } from "../accountAction";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const schema = z.object({
    warehouse_ids: z.array(z.string()).optional().default([]),
});

interface ModalConfigWarehouseProps {
    open: boolean;
    onClose: () => void;
    record?: any;
}

export default function ModalConfigWarehouse({ open, onClose, record }: ModalConfigWarehouseProps) {
    const [warehouses, setWarehouses] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();

    const { control, handleSubmit, reset, formState: { isDirty } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            warehouse_ids: [],
        }
    });

    useEffect(() => {
        if (open) {
            const fetchWarehouses = async () => {
                setLoading(true);
                try {
                    const res: any = await getWarehouses();
                    const list = Array.isArray(res)
                        ? res
                        : (res?.elements || res?.rows || res?.data || []);
                    const options = list.map((w: any) => ({
                        label: w.name,
                        value: w.id,
                    }));
                    setWarehouses(options);
                } catch (err) {
                    console.error("Failed to load warehouses", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchWarehouses();

            if (record) {
                reset({
                    warehouse_ids: record.warehouse_ids || [],
                });
            } else {
                reset({ warehouse_ids: [] });
            }
        } else {
            reset({ warehouse_ids: [] });
        }
    }, [open, record, reset]);

    const handleCancel = () => {
        reset();
        onClose();
    };

    const handleSubmitForm = async (data: any) => {
        if (!record?.id) return;
        setIsSubmitting(true);
        try {
            const response = await updateAccountWarehouses(record.id, data.warehouse_ids || []);

            if (response.success) {
                messageApi.success("Cấu hình kho sử dụng thành công");
                setTimeout(() => {
                    onClose();
                    router.refresh();
                }, 800);
            } else {
                messageApi.error(response.error || "Có lỗi xảy ra khi cập nhật kho");
            }
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                // classNames={"config-warehouse-modal"}
                title={
                    <span style={{ fontSize: 18, fontWeight: 500, color: '#484848' }}>
                        Cấu hình kho sử dụng
                    </span>
                }
                open={open}
                onCancel={handleCancel}
                footer={null}
                width={800}
                centered
                className="rounded-[8px] "
                styles={{

                    container: {
                        padding: "16px 24px 30px 24px",
                    }
                }}
            >
                <div className="h-[1px] bg-[#C0C0C0] w-full mt-[7px] "></div>
                <ModalThemeProvider>
                    <div className="w-full flex items-center justify-center">


                        <div className="pt-[42px] px-4 ">

                            <Form onFinish={handleSubmit(handleSubmitForm)} className="flex flex-col items-center justify-center md:min-w-[716px]">
                                <div className="w-full flex justify-center mb-[50px]">
                                    <FormItemController
                                        name="warehouse_ids"
                                        label="Kho"
                                        style={{ marginBottom: 0 }}
                                        control={control}
                                        wrapperCol={{ flex: 'none', style: { paddingLeft: 0 } }}
                                        labelCol={{
                                            style: {
                                                minWidth: 100,
                                                height: 40,
                                                fontSize: 14,
                                                fontWeight: 500,
                                                textAlign: "left",
                                                display: "flex",
                                                alignItems: "center",
                                                color: "#404040",
                                                marginRight: 10
                                            }
                                        }}
                                        render={(field) => (
                                            <Select
                                                value={field.value || []}
                                                onChange={(val) => field.onChange(val ?? [])}
                                                onBlur={field.onBlur}
                                                mode="multiple"
                                                placeholder="Chọn kho"
                                                // xóa dấu x dư thừA 
                                                // allowClear
                                                loading={loading}
                                                suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                                className="w-full rounded-md moi"
                                                options={warehouses}
                                                style={{ fontSize: 14, color: '#545454', height: 40 }}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex justify-center gap-[20px]  w-full">
                                    <Button
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                        className="w-[55px] h-[30px]"
                                        style={{ borderRadius: '20px', borderColor: '#a1a1a1', color: '#a1a1a1' }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        htmlType="submit"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                        className="w-[54px] h-[30px]"
                                        style={{
                                            backgroundColor: isSubmitting ? "#f5f5f5" : '#076eb8',
                                            borderColor: isSubmitting ? "#d9d9d9" : '#076eb8',
                                            color: isSubmitting ? "rgba(0, 0, 0, 0.25)" : "white",
                                            borderRadius: '20px'
                                        }}
                                    >
                                        Lưu
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </ModalThemeProvider>
            </Modal>
        </>
    );
}
