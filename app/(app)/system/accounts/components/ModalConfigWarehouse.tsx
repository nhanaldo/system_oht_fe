"use client";

import { Modal, Form, Select, Button, message } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWarehouses, updateAccountWarehouses } from "../accountAction";

interface ModalConfigWarehouseProps {
    open: boolean;
    onClose: () => void;
    record?: any;
}

export default function ModalConfigWarehouse({ open, onClose, record }: ModalConfigWarehouseProps) {
    const [form] = Form.useForm();
    const [warehouses, setWarehouses] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();

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
                    console.log(options);
                    setWarehouses(options);
                } catch (err) {
                    console.error("Failed to load warehouses", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchWarehouses();

            if (record) {
                form.setFieldsValue({
                    warehouse_ids: record.warehouse_ids || [],
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, record, form]);

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    const handleOk = async () => {
        if (!record?.id) return;
        try {
            const values = await form.validateFields();
            setLoading(true);
            const response = await updateAccountWarehouses(record.id, values.warehouse_ids || []);

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
            console.error("Validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={
                    <span style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A' }}>
                        Cấu hình kho sử dụng
                    </span>
                }
                open={open}
                onCancel={handleCancel}
                footer={null}
                width={600}
                centered
                className="rounded-[8px]"
            >
                <div className="py-8 px-4">
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                    >
                        <Form.Item
                            label={<span className="text-[#1A1A1A] font-medium">Kho</span>}
                            name="warehouse_ids"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn kho"
                                allowClear
                                loading={loading}
                                className="rounded-md"
                                options={warehouses}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <div className="flex justify-center gap-4 mt-8">
                            <Button
                                onClick={handleCancel}
                                className="h-[34px] px-6 rounded-full border border-gray-300 text-gray-500 hover:text-gray-700"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleOk}
                                loading={loading}
                                className="h-[34px] px-6 rounded-full bg-[#006dcc] hover:bg-[#005fb3] border-none"
                            >
                                Lưu
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    );
}
