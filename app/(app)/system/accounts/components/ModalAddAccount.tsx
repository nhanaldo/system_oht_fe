"use client";

import { Modal, Form, Input, Button, message, Select } from "antd";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountAddParams } from "@/types/account";
import { addAccount, updateAccount } from "../accountAction";
import { PlusOutlined } from "@ant-design/icons";


interface ModalAddAccountProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    roleOptions?: { label: string, value: string }[];
    editingRecord?: any;
}

export default function ModalAddAccount({ open, onClose, onSuccess, roleOptions, editingRecord }: ModalAddAccountProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [tempAvatarUrl, setTempAvatarUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const selectedRoleId = Form.useWatch('role_id', form);
    const selectedRoleName = roleOptions?.find(r => r.value === selectedRoleId)?.label;

    useEffect(() => {
        if (open && editingRecord) {
            form.setFieldsValue({
                code: editingRecord.code,
                name: editingRecord.name,
                username: editingRecord.username,
                email: editingRecord.email,
                role_id: editingRecord.role_ids?.[0] || editingRecord.role_id || (editingRecord.role_names?.[0] ? roleOptions?.find(r => r.label.toLowerCase() === editingRecord.role_names?.[0].toLowerCase())?.value : undefined),
            });
            if (editingRecord.avatar) {
                setAvatarUrl(editingRecord.avatar);
                setTempAvatarUrl(editingRecord.avatar);
            } else {
                setAvatarUrl('');
                setTempAvatarUrl('');
            }
        } else if (open) {
            form.resetFields();
            setAvatarUrl('');
            setTempAvatarUrl('');
        }
    }, [open, editingRecord, form, roleOptions]);

    const handleCancel = () => {
        form.resetFields();
        setAvatarUrl('');
        setTempAvatarUrl('');
        onClose();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload: any = {
                code: values.code?.trim(),
                username: values.username?.trim(),
                email: values.email?.trim(),
                name: values.name?.trim(),
                avatar: avatarUrl || undefined,
                role_ids: values.role_id ? [values.role_id] : [],
            };

            const response = editingRecord
                ? await updateAccount(editingRecord.id, payload)
                : await addAccount(payload);

            if (response.success) {
                messageApi.success(editingRecord ? "Cập nhật tài khoản thành công" : "Thêm mới tài khoản thành công");
                form.resetFields();
                setAvatarUrl('');
                if (onSuccess) onSuccess();
                onClose();
                router.refresh();
            } else {
                messageApi.error(response.error || (editingRecord ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi thêm mới"));
            }
        } catch (error) {
            console.error("Validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Đọc file ảnh thành base64 URL
    const readFileAsUrl = (file: File): Promise<string> =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });

    // Nén ảnh thành chuỗi Base64 kích thước cực nhỏ (48x48, JPEG) để đường link siêu ngắn
    const compressToPng = (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 48;
                const MAX_HEIGHT = 48;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.5));
                } else {
                    resolve(base64Str);
                }
            };
            img.onerror = () => {
                resolve(base64Str);
            };
        });
    };

    // Upload ảnh lần đầu
    const handleFirstUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const rawUrl = await readFileAsUrl(file);
        const compressedUrl = await compressToPng(rawUrl);
        setAvatarUrl(compressedUrl);
        setTempAvatarUrl(compressedUrl);
    };

    // Đổi ảnh trong preview modal
    const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const rawUrl = await readFileAsUrl(file);
        const compressedUrl = await compressToPng(rawUrl);
        setTempAvatarUrl(compressedUrl);
    };

    // Xác nhận đổi ảnh
    const handleConfirmAvatar = () => {
        setAvatarUrl(tempAvatarUrl);
        setPreviewOpen(false);
    };

    // Hủy đổi ảnh
    const handleCancelPreview = () => {
        setTempAvatarUrl(avatarUrl); // revert
        setPreviewOpen(false);
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                            style={{ cursor: 'pointer', color: '#595959', fontSize: 16 }}
                            onClick={handleCancel}
                        >
                            ←
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A' }}>
                            {editingRecord ? "Chỉnh sửa tài khoản" : "Thêm mới tài khoản"}
                        </span>
                    </div>
                }
                open={open}
                onCancel={handleCancel}
                footer={null}
                width={700}
                centered
                className="rounded-[8px]"
            >
                <div className="py-4 px-4">
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                    >
                        {/* Mã nhân viên */}
                        <Form.Item
                            label={<span className="text-[#1A1A1A]">Mã nhân viên <span style={{ color: 'red' }}>*</span></span>}
                            name="code"
                            required={false}
                            rules={[{ required: true, whitespace: true, message: "Vui lòng nhập mã nhân viên!" }]}
                        >
                            <Input placeholder="Ví dụ: NV001" className="h-[38px] rounded-md" />
                        </Form.Item>

                        {/* Họ và tên */}
                        <Form.Item
                            label={<span className="text-[#1A1A1A]">Họ và tên <span style={{ color: 'red' }}>*</span></span>}
                            name="name"
                            required={false}
                            rules={[{ required: true, whitespace: true, message: "Vui lòng nhập họ và tên!" }]}
                        >
                            <Input placeholder="Nhập họ và tên" className="h-[38px] rounded-md" />
                        </Form.Item>

                        {/* Tên đăng nhập */}
                        <Form.Item
                            label={<span className="text-[#1A1A1A]">Tên đăng nhập <span style={{ color: 'red' }}>*</span></span>}
                            name="username"
                            required={false}
                            rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên đăng nhập!" }]}
                        >
                            <Input placeholder="Nhập tên đăng nhập" className="h-[38px] rounded-md" />
                        </Form.Item>

                        {/* Email */}
                        <Form.Item
                            label={<span className="text-[#1A1A1A]">Email <span style={{ color: 'red' }}>*</span></span>}
                            name="email"
                            required={false}
                            rules={[
                                { required: true, message: "Vui lòng nhập email!" },
                                { type: 'email', message: "Email không hợp lệ!" },
                            ]}
                        >
                            <Input placeholder="Nhập Email" className="h-[38px] rounded-md" />
                        </Form.Item>

                        {/* Vai trò */}
                        <Form.Item
                            label={<span className="text-[#1A1A1A]">Vai trò <span style={{ color: 'red' }}>*</span></span>}
                            name="role_id"
                            required={false}
                            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
                        >
                            <Select
                                placeholder="Chọn vai trò"
                                className="h-[38px] rounded-md"
                                options={roleOptions || []}
                            />
                        </Form.Item>


                        {/* Hình ảnh */}
                        <Form.Item
                            label={<span className="text-[#1A1A1A]">Hình ảnh</span>}
                        >
                            {avatarUrl ? (
                                <div
                                    onClick={() => { setTempAvatarUrl(avatarUrl); setPreviewOpen(true); }}
                                    style={{
                                        width: 72,
                                        height: 72,
                                        cursor: 'pointer',
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        border: '1px solid #d9d9d9',
                                    }}
                                >
                                    <img
                                        src={avatarUrl}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFirstUpload}
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: 72,
                                            height: 72,
                                            border: '1px dashed #d9d9d9',
                                            borderRadius: 6,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#8c8c8c',
                                            fontSize: 12,
                                            gap: 4,
                                        }}
                                    >
                                        <PlusOutlined style={{ fontSize: 16 }} />
                                        <span>Upload</span>
                                    </div>
                                </>
                            )}
                        </Form.Item>

                        {/* Buttons */}
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

            {/* Image Preview Modal */}
            <Modal
                title="Hình ảnh"
                open={previewOpen}
                onCancel={handleCancelPreview}
                centered
                width={480}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                        <Button
                            onClick={handleCancelPreview}
                            className="min-w-[80px] rounded-[20px]"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleConfirmAvatar}
                            style={{ backgroundColor: '#0265B9', borderRadius: 20, minWidth: 80 }}
                        >
                            Cập nhật
                        </Button>
                    </div>
                }
            >
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    {/* Ảnh preview lớn */}
                    <div style={{
                        width: 260,
                        height: 260,
                        margin: '0 auto',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #e8e8e8',
                    }}>
                        <img
                            src={tempAvatarUrl}
                            alt="preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Nút đổi ảnh */}
                    <div style={{ marginTop: 20 }}>
                        <input
                            type="file"
                            accept="image/*"
                            id="change-avatar-input"
                            style={{ display: 'none' }}
                            onChange={handleChangeAvatar}
                        />
                        <Button
                            onClick={() => document.getElementById('change-avatar-input')?.click()}
                            style={{ borderRadius: 20, minWidth: 140 }}
                        >
                            Đổi ảnh đại diện
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
