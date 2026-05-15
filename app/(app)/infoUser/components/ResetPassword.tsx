"use client";

import React, { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { useRouter } from 'next/navigation';
import { updateAccountPassword } from '../../system/accounts/accountAction';
import ModalThemeProvider from '@/components/ui/ModalThemeProvider';

interface ResetPasswordProps {
    userId: string;
    onCancel?: () => void;
}

export default function ResetPassword({ userId, onCancel }: ResetPasswordProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { message: messageApi } = App.useApp();

    const handleUpdatePassword = async (values: any) => {
        if (!userId) return;
        if (values.new_password === values.old_password) {
            messageApi.error('Mật khẩu mới không được giống mật khẩu cũ!');
            return;
        }
        if (values.new_password.length < 6) {
            messageApi.error('Độ dài mật khẩu tối thiểu: 6 ký tự!');
            return;
        }
        const asciiRegex = /^[\x21-\x7E]+$/;
        if (!asciiRegex.test(values.new_password)) {
            messageApi.error('Mật khẩu không được chứa dấu hoặc khoảng trắng!');
            return;
        }
        if (values.new_password !== values.confirm_new_password) {
            messageApi.error('Mật khẩu mới và Xác nhận mật khẩu không trùng khớp!');
            return;
        }
        setLoading(true);
        try {
            const res = await updateAccountPassword(userId, {
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

    return (
        <ModalThemeProvider>
            <Form
                form={form}
                layout="horizontal"
                labelAlign="left"
                colon={false}
                requiredMark={false}// xóa dấu màu đỏ
                onFinish={handleUpdatePassword}
                className="w-full max-w-[750px]"
            >
                <Form.Item
                    name="old_password"
                    label={<span className="text-[14px] text-[#484848] font-roboto">Mật khẩu cũ</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                    labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                    wrapperCol={{ flex: 'none' }}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu cũ"
                        className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                    />
                </Form.Item>

                <Form.Item
                    name="new_password"
                    label={<span className="text-[14px] text-[#484848] font-roboto">Mật khẩu mới</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 6, message: 'Độ dài mật khẩu tối thiểu: 6 ký tự!' },
                        {
                            pattern: /^[\x21-\x7E]+$/,
                            message: 'Mật khẩu không được chứa dấu hoặc khoảng trắng!'
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('old_password') !== value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu mới không được giống mật khẩu cũ!'));
                            },
                        }),
                    ]}
                    labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                    wrapperCol={{ flex: 'none' }}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu mới"
                        className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                    />
                </Form.Item>

                <Form.Item
                    name="confirm_new_password"
                    label={<span className="text-[14px] text-[#484848] font-roboto">Xác nhận mật khẩu mới</span>}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('new_password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu mới và Xác nhận mật khẩu không trùng khớp!'));
                            },
                        }),
                    ]}
                    labelCol={{ flex: 'none', style: { minWidth: 160, display: 'flex', alignItems: 'center' } }}
                    wrapperCol={{ flex: 'none' }}
                >
                    <Input.Password
                        placeholder="Xác nhận mật khẩu mới"
                        className="rounded-md border-[#C0C0C0] h-[40px] text-[#484848]"
                    />
                </Form.Item>

                <div className="flex justify-end mt-8 gap-4 mr-[69px]">
                    <Button
                        type="default"
                        onClick={onCancel || (() => router.push('/home'))}
                        className="!border-[#a1a1a1] !text-[#a1a1a1] !h-[30px] !w-[86px] !rounded-[20px] !font-medium !text-[14px] "
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="!bg-[#076eb8] !border-[#076eb8] !h-[30px] !w-[86px] !rounded-[20px]  font-medium !text-[14px] "
                    >
                        Cập nhật
                    </Button>
                </div>
            </Form>
        </ModalThemeProvider>
    );
}
