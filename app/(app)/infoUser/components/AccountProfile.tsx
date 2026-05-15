'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Tag, Upload, App } from 'antd';
import ModalThemeProvider from '@/components/ui/ModalThemeProvider';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Account } from '@/types/account';
import { updateAccountProfile, uploadFile } from '../../system/accounts/accountAction';
import ResetPassword from './ResetPassword';

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
                if (avatar) {
                    window.dispatchEvent(new CustomEvent('avatar-changed', { detail: avatar }));
                }
                messageApi.success('Cập nhật thông tin cá nhân thành công!');
            }
        } catch (err: any) {
            messageApi.error(err.message || 'Đã xảy ra lỗi khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    const displayValue = (val: any) => val || "Chưa cập nhật";

    return (
        <div className="w-full h-full p-2 pb-4 ">
            {/* Profile Main Card */}
            <div className="w-full h-full bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-5 sm:p-[30px] overflow-auto">
                <h2 className="text-[16px] font-roboto font-semibold text-[#2C352C] mb-[50px] lg:mb-[44px]">
                    Thông tin tài khoản
                </h2>

                {/* Layout: flex-col on mobile, flex-row on lg+ */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">

                    {/* Left Column: Avatar & Name */}
                    <div className=" mt-[44px] flex flex-col items-center justify-start lg:w-[300px] xl:w-[380px] shrink-0 pb-6 lg:pb-0">
                        {/* Avatar */}
                        <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] xl:w-[250px] xl:h-[250px] rounded-full">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover border border-gray-100"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1378C0]/20 to-[#1378C0]/5 flex items-center justify-center border border-gray-100">
                                    <span className="text-[40px] sm:text-[48px] font-medium text-[#1378C0]">
                                        {initialData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                beforeUpload={async (file) => {
                                    const formData = new FormData();
                                    formData.append('storage_provider', 'minio');
                                    formData.append('folder', '/upload');
                                    formData.append('file', file);

                                    const hide = messageApi.loading('Đang tải ảnh lên...', 0);
                                    try {
                                        const res = await uploadFile(formData);
                                        hide();
                                        if (res.success && res.data?.elements?.url) {
                                            const imageUrl = res.data.elements.url;
                                            setAvatar(imageUrl);
                                            messageApi.success('Đã tải lên ảnh đại diện mới thành công!');
                                        } else {
                                            messageApi.error(res.error || 'Tải ảnh lên thất bại');
                                        }
                                    } catch (err: any) {
                                        hide();
                                        messageApi.error('Đã xảy ra lỗi khi tải ảnh lên');
                                    }
                                    return false;
                                }}
                            >
                                <button className="absolute bottom-2 right-2 bg-white shadow-md w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                                    <Image src="/icon.svg/Camera_light.svg" alt="Camera" width={30} height={30} />
                                </button>
                            </Upload>
                        </div>
                        <h3 className="mt-5 text-[16px] font-roboto font-medium text-[#333333] text-center">
                            {displayValue(initialData?.name)}
                        </h3>

                        {/* Horizontal divider for mobile */}
                        <div className="w-full h-[1px] bg-[#C0C0C0] mt-6 lg:hidden" />
                    </div>

                    {/* Vertical divider for desktop */}
                    <div className="hidden lg:block w-[1px] bg-[#C0C0C0] mx-8 self-stretch h-[440px]" />

                    {/* Right Column: Profile Fields */}
                    <div className="flex-1 min-w-0 mt-[44px]" >
                        {/* Tab Headers */}
                        <div className="flex gap-6 sm:gap-8 mb-[30px]">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`text-[14px] sm:text-[16px] font-roboto font-medium transition-colors relative  ${activeTab === 'personal' ? 'text-[#1378C0]' : 'text-[#292D32] hover:text-gray-600'}`}
                            >
                                Cá nhân
                                {activeTab === 'personal' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1378C0] rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`text-[14px] sm:text-[16px] font-roboto font-medium transition-colors relative  ${activeTab === 'password' ? 'text-[#1378C0]' : 'text-[#292D32] hover:text-gray-600'}`}
                            >
                                Thay đổi mật khẩu
                                {activeTab === 'password' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1378C0] rounded-full" />
                                )}
                            </button>
                        </div>

                        {/* Tab Contents */}
                        {activeTab === 'personal' ? (
                            <ModalThemeProvider>
                                <Form
                                    form={form}
                                    layout="horizontal"
                                    labelAlign="left"

                                    colon={false}
                                    onFinish={handleUpdate}
                                    className="w-full max-w-[750px]"
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
                                        label={<span className="text-[14px] text-[#484848] font-roboto">Họ và tên</span>}
                                        labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                                        wrapperCol={{ flex: 'none' }}// tắt flex auto

                                    >
                                        <Input
                                            placeholder="Chưa cập nhật"
                                            className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                                            value={initialData?.name || ''}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="username"
                                        label={<span className="text-[14px] text-[#484848] font-roboto">Tên đăng nhập</span>}
                                        labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                                        wrapperCol={{ flex: 'none' }}
                                    >
                                        <Input
                                            disabled
                                            className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                                            style={{ backgroundColor: '#f2f4f8' }}
                                            value={initialData?.username || ''}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label={<span className="text-[14px] text-[#484848] font-roboto">Email</span>}
                                        labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                                        wrapperCol={{ flex: 'none' }}
                                    >
                                        <Input
                                            disabled
                                            placeholder="Chưa cập nhật"
                                            className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                                            style={{ backgroundColor: '#f2f4f8' }}
                                            value={initialData?.email || ''}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="code"
                                        label={<span className="text-[14px] text-[#484848] font-roboto">MSNV</span>}
                                        labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                                        wrapperCol={{ flex: 'none' }}
                                    >
                                        <Input
                                            disabled
                                            className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                                            style={{ backgroundColor: '#f2f4f8' }}
                                            placeholder="Chưa cập nhật"
                                            value={initialData?.code || ''}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="roles"
                                        label={<span className="text-[14px] text-[#484848] font-roboto">Quyền</span>}
                                        labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                                        wrapperCol={{ flex: 'none' }}
                                    >
                                        <Input
                                            disabled
                                            className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                                            style={{ backgroundColor: '#f2f4f8' }}
                                            placeholder="Chưa cập nhật"
                                            value={initialData?.role_names?.join(', ') || ''}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className="text-[14px] text-[#484848] font-roboto">Kho</span>}
                                        labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                                        wrapperCol={{ flex: 'none' }}
                                    >
                                        <div
                                            className="flex flex-wrap gap-2 min-h-[40px] items-center border border-[#C0C0C0] rounded-md p-2"
                                            style={{ backgroundColor: '#f2f4f8' }}
                                        >
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

                                    <div className="flex justify-end mt-8 gap-4 mr-[69px]">
                                        <Button
                                            type="default"
                                            onClick={() => router.push('/home')}
                                            className="!border-[#a1a1a1] !text-[#a1a1a1] !h-[30px] !w-[86px] !rounded-[20px] !font-medium !text-[14px]"
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            className="!bg-[#076eb8] !border-[#076eb8] !h-[30px] !w-[86px] !rounded-[20px] font-medium !text-[14px]"
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                </Form>
                            </ModalThemeProvider>
                        ) : (
                            <ResetPassword userId={initialData?.id || ''} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
