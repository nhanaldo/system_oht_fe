'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Tag, Upload, App } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Account } from '@/types/account';
import { updateAccountProfile, updateAccountPassword } from '../../system/accounts/accountAction';

interface AccountProfileProps {
    initialData: Account | null;
}

export default function AccountProfile({ initialData }: AccountProfileProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'personal' | 'password'>('personal');
    const [avatar, setAvatar] = useState<string>(initialData?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { message: messageApi } = App.useApp();

    const handleUpdate = async (values: any) => {
        if (!initialData?.id) return;
        setLoading(true);
        try {
            const res = await updateAccountProfile(initialData.id, {
                name: values.name,
                avatar: avatar,
            });
            if (res.success) {
                messageApi.success('Cập nhật thông tin cá nhân thành công!');
                if (avatar) {
                    localStorage.setItem("avatarUrl", avatar);
                }
                router.push('/home');
            } else {
                messageApi.error(res.error || 'Cập nhật thất bại');
            }
        } catch (err: any) {
            messageApi.error(err.message || 'Đã xảy ra lỗi khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (values: any) => {
        if (!initialData?.id) return;
        if (values.new_password !== values.confirm_new_password) {
            messageApi.error('Mật khẩu mới và Xác nhận mật khẩu không trùng khớp!');
            return;
        }
        setLoading(true);
        try {
            const res = await updateAccountPassword(initialData.id, {
                old_password: values.old_password,
                new_password: values.new_password,
                confirm_new_password: values.confirm_new_password,
            });
            if (res.success) {
                messageApi.success('Thay đổi mật khẩu thành công!');
                form.resetFields();
                router.push('/home');
            } else {
                messageApi.error(res.error || 'Thay đổi mật khẩu thất bại');
            }
        } catch (err: any) {
            messageApi.error(err.message || 'Đã xảy ra lỗi khi thay đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    const displayValue = (val: any) => val || "Chưa cập nhật";

    return (
        <div className="w-full bg-[#F8F9FA] p-6 min-h-screen">
            {/* Header Breadcrumb */}
            <div className="mb-6">
                <span className="text-[14px] text-[#8C8C8C] font-roboto">Thông tin tài khoản - cá nhân</span>
            </div>

            {/* Profile Main Card */}
            <div className="w-full bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-8">
                <h2 className="text-[18px] font-roboto font-medium text-[#1A1A1A] mb-6 pb-4 border-b border-gray-100">
                    Thông tin tài khoản
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Avatar & Name */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-start border-r border-gray-100 pr-0 lg:pr-10 pb-8 lg:pb-0">
                        <div className="relative w-[180px] h-[180px] rounded-full">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover border border-gray-100"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1378C0]/20 to-[#1378C0]/5 flex items-center justify-center border border-gray-100">
                                    <span className="text-[48px] font-medium text-[#1378C0]">
                                        {initialData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        if (e.target?.result) {
                                            const base64Data = e.target.result as string;
                                            setAvatar(base64Data);
                                            messageApi.success('Đã tải lên ảnh đại diện mới thành công!');
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                    return false;
                                }}
                            >
                                <button className="absolute bottom-2 right-2 bg-white shadow-md border border-gray-100 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                                    <CameraOutlined className="text-gray-500 text-[16px]" />
                                </button>
                            </Upload>
                        </div>
                        <h3 className="mt-5 text-[16px] font-roboto font-medium text-[#333333]">
                            {displayValue(initialData?.name)}
                        </h3>
                    </div>

                    {/* Right Column: Profile Fields */}
                    <div className="lg:col-span-8">
                        {/* Tab Headers */}
                        <div className="flex gap-8 mb-8 border-b border-gray-100 pb-3">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`text-[15px] font-roboto font-medium transition-colors relative pb-3 ${
                                    activeTab === 'personal' ? 'text-[#1378C0]' : 'text-[#8C8C8C] hover:text-gray-600'
                                }`}
                            >
                                Cá nhân
                                {activeTab === 'personal' && (
                                    <div className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-[#1378C0] rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`text-[15px] font-roboto font-medium transition-colors relative pb-3 ${
                                    activeTab === 'password' ? 'text-[#1378C0]' : 'text-[#8C8C8C] hover:text-gray-600'
                                }`}
                            >
                                Thay đổi mật khẩu
                                {activeTab === 'password' && (
                                    <div className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-[#1378C0] rounded-full" />
                                )}
                            </button>
                        </div>

                        {/* Tab Contents */}
                        {activeTab === 'personal' ? (
                            <Form
                                form={form}
                                layout="horizontal"
                                labelCol={{ span: 5 }}
                                wrapperCol={{ span: 19 }}
                                colon={false}
                                onFinish={handleUpdate}
                                initialValues={{
                                    name: initialData?.name || '',
                                    username: initialData?.username || '',
                                    email: initialData?.email || '',
                                    code: initialData?.code || '',
                                    roles: initialData?.role_names?.join(', ') || '',
                                }}
                            >
                                <Form.Item
                                    name="name"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Họ và tên</span>}
                                >
                                    <Input
                                        placeholder="Chưa cập nhật"
                                        className="rounded-md border-gray-200 h-[38px] text-[#333]"
                                        value={initialData?.name || ''}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="username"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Tên đăng nhập</span>}
                                >
                                    <Input
                                        disabled
                                        className="rounded-md border-gray-200 h-[38px] bg-gray-50/50 text-[#8C8C8C]"
                                        value={initialData?.username || ''}
                                    />
                                </Form.Item>
 
                                <Form.Item
                                    name="email"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Email</span>}
                                >
                                    <Input
                                        disabled
                                        placeholder="Chưa cập nhật"
                                        className="rounded-md border-gray-200 h-[38px] bg-gray-50/50 text-[#8C8C8C]"
                                        value={initialData?.email || ''}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="code"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">MSNV</span>}
                                >
                                    <Input
                                        disabled
                                        className="rounded-md border-gray-200 h-[38px] bg-gray-50/50 text-[#8C8C8C]"
                                        placeholder="Chưa cập nhật"
                                        value={initialData?.code || ''}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="roles"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Quyền</span>}
                                >
                                    <Input
                                        disabled
                                        className="rounded-md border-gray-200 h-[38px] bg-gray-50/50 text-[#8C8C8C]"
                                        placeholder="Chưa cập nhật"
                                        value={initialData?.role_names?.join(', ') || ''}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Kho</span>}
                                >
                                    <div className="flex flex-wrap gap-2 min-h-[38px] items-center border border-gray-200 rounded-md p-2 bg-gray-50/50">
                                        {initialData?.warehouse_names && initialData.warehouse_names.length > 0 ? (
                                            initialData.warehouse_names.map((wh, idx) => (
                                                <Tag
                                                    key={idx}
                                                    closable={false}
                                                    className="m-0 bg-[#E6F4FF] border-[#B3D8FF] text-[#1378C0] px-3 py-0.5 rounded-full font-roboto"
                                                >
                                                    {wh}
                                                </Tag>
                                            ))
                                        ) : (
                                            <span className="text-[14px] text-[#8C8C8C] font-roboto pl-1">Chưa cập nhật</span>
                                        )}
                                    </div>
                                </Form.Item>

                                <div className="flex justify-end mt-8 gap-4">
                                    <Button
                                        type="default"
                                        onClick={() => router.push('/home')}
                                        className="border-gray-300 hover:border-gray-400 h-[36px] px-6 rounded-full font-roboto font-medium text-gray-600"
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="bg-[#1378C0] border-[#1378C0] h-[36px] px-6 rounded-full font-roboto font-medium"
                                    >
                                        Cập nhật
                                    </Button>
                                </div>
                            </Form>
                        ) : (
                            <Form
                                form={form}
                                layout="horizontal"
                                labelCol={{ span: 5 }}
                                wrapperCol={{ span: 19 }}
                                colon={false}
                                onFinish={handleUpdatePassword}
                            >
                                <Form.Item
                                    name="old_password"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Mật khẩu cũ</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                                >
                                    <Input.Password
                                        placeholder="Nhập mật khẩu cũ"
                                        className="rounded-md border-gray-200 h-[38px] text-[#333]"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="new_password"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Mật khẩu mới</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                                >
                                    <Input.Password
                                        placeholder="Nhập mật khẩu mới"
                                        className="rounded-md border-gray-200 h-[38px] text-[#333]"
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="confirm_new_password"
                                    label={<span className="text-[14px] text-[#5F5D5D] font-roboto">Xác nhận mật khẩu mới</span>}
                                    rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
                                >
                                    <Input.Password
                                        placeholder="Xác nhận mật khẩu mới"
                                        className="rounded-md border-gray-200 h-[38px] text-[#333]"
                                    />
                                </Form.Item>

                                <div className="flex justify-end mt-8 gap-4">
                                    <Button
                                        type="default"
                                        onClick={() => router.push('/home')}
                                        className="border-gray-300 hover:border-gray-400 h-[36px] px-6 rounded-full font-roboto font-medium text-gray-600"
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="bg-[#1378C0] border-[#1378C0] h-[36px] px-6 rounded-full font-roboto font-medium"
                                    >
                                        Cập nhật
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
