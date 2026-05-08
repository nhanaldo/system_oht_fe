"use client";

import { Modal, Form, Input, Button, message } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateRole } from "../roleAction";
import { Role } from "@/types/role";

interface ModalUpdateRoleProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    role: Role | null;
    roleOptions?: { label: string, value: string }[];
}

export default function ModalUpdateRole({ open, onClose, onSuccess, role, roleOptions }: ModalUpdateRoleProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();

    useEffect(() => {
        if (open && role) {
            form.setFieldsValue({
                name: role.name,
                description: role.description,
            });
        } else {
            form.resetFields();
        }
    }, [open, role, form]);

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    const handleOk = async () => {
        if (!role?.id) return;
        try {
            const values = await form.validateFields();
            setLoading(true);

            const newName = values.name?.trim();
            const isDuplicate = roleOptions?.some(opt => 
                opt.value.trim().toLowerCase() === newName.toLowerCase() && 
                opt.value.trim().toLowerCase() !== role.name?.trim().toLowerCase()
            );

            if (isDuplicate) {
                messageApi.error("Vai trò này đã tồn tại!");
                setLoading(false);
                return;
            }

            const payload = {
                name: newName,
                description: values.description?.trim(),
            };

            const response = await updateRole(role.id, payload);
            console.log(response);

            if (response.success) {
                messageApi.success("Cập nhật vai trò thành công");

                form.resetFields();
                if (onSuccess) onSuccess();
                onClose();
                router.refresh();
            } else {
                messageApi.error(response.error || "Có lỗi xảy ra khi cập nhật");
            }
        } catch (error) {
            console.error("Validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<span className="text-[16px] font-medium text-[#1A1A1A]">Cập nhật vai trò</span>}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={700}
            centered
            className="rounded-[8px]"
            forceRender
        >
            {contextHolder}
            <div className="py-6 px-4">
                <Form
                    form={form}
                    layout="horizontal"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                >
                    <Form.Item
                        label={<span className="text-[#1A1A1A]">Vai trò</span>}
                        name="name"
                        rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên vai trò hợp lệ (không để trống)!" }]}
                    >
                        <Input placeholder="Nhập tên vai trò" className="h-[38px] rounded-md" />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-[#1A1A1A]">Mô tả</span>}
                        name="description"
                    >
                        <Input placeholder="Nhập mô tả" className="h-[38px] rounded-md" />
                    </Form.Item>

                    <div className="flex justify-center gap-4 mt-8">
                        <Button
                            onClick={handleCancel}
                            className="min-w-[100px] h-[36px] rounded-[20px] text-[#5F5D5D] border-gray-300"
                        >
                            Quay về
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleOk}
                            loading={loading}
                            className="min-w-[100px] h-[36px] rounded-[20px] bg-[#0265B9]"
                        >
                            Lưu
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
