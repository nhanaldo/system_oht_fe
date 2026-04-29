'use client';

import React, { useState } from 'react';
import {
    SearchOutlined,
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    SyncOutlined,
    UnlockOutlined,
    LockOutlined,
    ArrowLeftOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { Modal, Form, Input, Select, Upload, Button, Space, Popconfirm, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';

interface UserData {
    id: number;
    fullName: string;
    username: string;
    email: string;
    role: string;
    status: string;
}

const INITIAL_USERS: UserData[] = [
    { id: 1, fullName: 'Phạm Anh Đức', username: 'phamanhduc', email: 'phamanhduc@gmail.com', role: 'Admin', status: 'active' },
    { id: 2, fullName: 'Nguyễn Thành An', username: 'nguyenthanhan', email: 'nguyenthanhan@gmail.com', role: 'User', status: 'inactive' },
    { id: 3, fullName: 'Bùi Gia Lê', username: 'buigiale', email: 'buigiale@gmail.com', role: 'User', status: 'active' },
    { id: 4, fullName: 'Hà Bửu Hoàn', username: 'habuuhoan', email: 'habuuhoan@gmail.com', role: 'User', status: 'inactive' },
    { id: 5, fullName: 'Nguyễn Duy Mạnh', username: 'nguyenduymanh', email: 'nguyenduymanh@gmail.com', role: 'User', status: 'active' },
    { id: 6, fullName: 'Võ Trung Duy', username: 'votrungduy', email: 'votrungduy@gmail.com', role: 'Admin', status: 'inactive' },
    { id: 7, fullName: 'Nguyễn Văn Trọng', username: 'nguyenvantrong', email: 'nguyenvantrong@gmail.com', role: 'Admin', status: 'active' },
    { id: 8, fullName: 'Nguyễn Thị Huệ Trang', username: 'nguyenthihuetrang', email: 'nguyenthihuetrang@gmail.com', role: 'User', status: 'inactive' },
    { id: 9, fullName: 'Trần Văn Nghĩa', username: 'tranvannghia', email: 'tranvannghia@gmail.com', role: 'User', status: 'active' },
    { id: 10, fullName: 'Nguyễn Văn Hào', username: 'nguyenvanhao', email: 'nguyenvanhao@gmail.com', role: 'User', status: 'inactive' },
];

export default function AccountProfile() {
    const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [tempPreviewImage, setTempPreviewImage] = useState('');
    const [tempFile, setTempFile] = useState<UploadFile | null>(null);
    // chuyển file ảnh thành chuỗi base64 
    const getBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }
        const url = file.url || (file.preview as string);
        setTempPreviewImage(url);
        setTempFile(file);
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const showModal = (user?: UserData) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue(user);
            // If there's an avatar URL in user data in the future, we would set fileList here
        } else {
            setEditingUser(null);
            form.resetFields();
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setFileList([]);
        setEditingUser(null);
    };

    const handleSave = () => {
        form.validateFields().then(values => {
            if (editingUser) {
                // Edit existing user
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u));
                messageApi.success('Cập nhật tài khoản thành công');
            } else {
                // Add new user
                const newUser: UserData = {
                    id: Date.now(), // Generate a unique ID
                    fullName: values.fullName,
                    username: values.username,
                    email: values.email,
                    role: values.role,
                    status: 'active' // Default status
                };
                setUsers([...users, newUser]);
                messageApi.success('Thêm mới tài khoản thành công');
            }
            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);
            setEditingUser(null);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRowKeys(users.map(user => user.id));
        } else {
            setSelectedRowKeys([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRowKeys(prev =>
            prev.includes(id) ? prev.filter(key => key !== id) : [...prev, id]
        );
    };

    const handleDelete = (id: number) => {
        setUsers(users.filter(user => user.id !== id));
        messageApi.success('Xóa tài khoản thành công');
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col min-h-0">
            {contextHolder}
            {/* Header controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                    <h2 className="text-xl font-medium text-gray-800">Quản lý tài khoản</h2>
                    <p className="text-sm text-gray-500 mt-1">Đã chọn: {selectedRowKeys.length} mục</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Nhập vào tìm kiếm"
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 transition-all"
                        />
                    </div>
                    <select className="border border-gray-200 rounded-lg px-3 py-2 text-s   m text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white min-w-[120px] outline-none">
                        <option value="">Vai trò</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                    </select>
                    <Popconfirm
                        title={<span className="font-medium">Thông báo</span>}
                        description="Bạn có chắc chắn muốn xóa các tài khoản đã chọn không?"
                        onConfirm={() => {
                            if (selectedRowKeys.length === 0) return;
                            setUsers(users.filter(user => !selectedRowKeys.includes(user.id)));
                            setSelectedRowKeys([]);
                            messageApi.success('Xóa tài khoản thành công');
                        }}
                        okText="Xác nhận"
                        cancelText="Hủy"
                        placement="bottomRight"
                        okButtonProps={{ className: "rounded-full bg-[#076EB8]" }}
                        cancelButtonProps={{ className: "rounded-full" }}
                        disabled={selectedRowKeys.length === 0}
                    >
                        <button
                            className={`w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${selectedRowKeys.length > 0
                                    ? 'border-blue-500 text-blue-500 hover:bg-blue-50'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <DeleteOutlined className="text-lg" />
                        </button>
                    </Popconfirm>
                    <button
                        onClick={() => showModal()}
                        className="w-9 h-9 flex items-center justify-center border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <PlusOutlined className="text-lg" />
                    </button>
                </div>
            </div>

            {/* Table wrapper with scrolling */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-center whitespace-nowrap min-w-[1000px]">
                    <thead className="bg-[#076EB8] text-white sticky top-0 z-10">
                        <tr>
                            <th className="py-3 px-4 font-medium w-12 border-b border-[#076EB8]">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300"
                                    checked={selectedRowKeys.length === users.length && users.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="py-3 px-4 font-medium border-b border-[#076EB8]">STT</th>
                            <th className="py-3 px-4 font-medium text-left border-b border-[#076EB8]">Họ và tên</th>
                            <th className="py-3 px-4 font-medium border-b border-[#076EB8]">Tên đăng nhập</th>
                            <th className="py-3 px-4 font-medium border-b border-[#076EB8]">Email</th>
                            <th className="py-3 px-4 font-medium border-b border-[#076EB8]">Vai trò</th>
                            <th className="py-3 px-4 font-medium border-b border-[#076EB8]">Trạng thái</th>
                            <th className="py-3 px-4 font-medium border-b border-[#076EB8]">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                        {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedRowKeys.includes(user.id)}
                                        onChange={() => handleSelectRow(user.id)}
                                    />
                                </td>
                                <td className="py-3 px-4">{index + 1}</td>
                                <td className="py-3 px-4 text-left font-medium text-gray-900">{user.fullName}</td>
                                <td className="py-3 px-4">{user.username}</td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Admin'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-green-100 text-green-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {user.status === 'active' ? (
                                        <UnlockOutlined className="text-green-500 text-lg" />
                                    ) : (
                                        <LockOutlined className="text-red-500 text-lg" />
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-center gap-4 text-blue-500">
                                        <button 
                                            className="hover:text-blue-700 transition-colors" 
                                            title="Sửa"
                                            onClick={() => showModal(user)}
                                        >
                                            <EditOutlined className="text-lg" />
                                        </button>
                                        <button className="hover:text-blue-700 transition-colors" title="Đặt lại mật khẩu">
                                            <SyncOutlined className="text-lg" />
                                        </button>
                                        <Popconfirm
                                            title={<span className="font-medium">Thông báo</span>}
                                            description="Bạn có chắc chắn muốn xóa tài khoản này không?"
                                            onConfirm={() => handleDelete(user.id)}
                                            okText="Xác nhận"
                                            cancelText="Hủy"
                                            placement="topRight"
                                            okButtonProps={{ className: "rounded-full bg-[#076EB8]" }}
                                            cancelButtonProps={{ className: "rounded-full" }}
                                        >
                                            <button className="hover:text-red-600 text-blue-500 transition-colors" title="Xóa">
                                                <DeleteOutlined className="text-lg" />
                                            </button>
                                        </Popconfirm>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Thêm Mới / Chỉnh Sửa */}
            <Modal
                title={
                    <Space size="middle" className="pb-2">
                        <ArrowLeftOutlined onClick={handleCancel} className="cursor-pointer text-gray-500 hover:text-gray-800" />
                        <span className="text-base font-medium">
                            {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm mới tài khoản'}
                        </span>
                    </Space>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={
                    <div className="flex justify-center gap-4 mt-8 pb-4">
                        <Button
                            onClick={handleCancel}
                            className="rounded-full px-8"
                        >
                            Quay về
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            className="rounded-full px-8 bg-[#076EB8]"
                        >
                            Lưu
                        </Button>
                    </div>
                }
                width={800}
                centered
            >
                <div className="px-4 py-6 md:px-10">
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        colon={false}
                    >
                        <Form.Item
                            name="fullName"
                            label={<span className="font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input placeholder="Nhập họ và tên" className="rounded-md py-1.5" />
                        </Form.Item>

                        <Form.Item
                            name="username"
                            label={<span className="font-medium text-gray-700">Tên đăng nhập <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                        >
                            <Input placeholder="Nhập tên đăng nhập" className="rounded-md py-1.5" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={<span className="font-medium text-gray-700">Email <span className="text-red-500">*</span></span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input placeholder="Nhập Email" className="rounded-md py-1.5" />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label={<span className="font-medium text-gray-700">Vai trò <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        >
                            <Select placeholder="Chọn vai trò" className="h-9">
                                <Select.Option value="Admin">Admin</Select.Option>
                                <Select.Option value="User">User</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="avatar"
                            label={<span className="font-medium text-gray-700">Hình ảnh</span>}
                        >
                            <Upload
                                listType="picture-card"
                                maxCount={1}
                                fileList={fileList}
                                onChange={handleChange}
                                onPreview={handlePreview}
                                beforeUpload={() => false}
                            >
                                {fileList.length >= 1 ? null : (
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <PlusOutlined />
                                        <div className="mt-2 text-sm">Upload</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
            {/* Modal Image Preview */}
            <Modal
                title={<span className="text-base font-medium">Hình ảnh</span>}
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={
                    <div className="flex justify-end gap-4 mt-4 border-t border-gray-100 pt-4">
                        <Button
                            onClick={() => setPreviewOpen(false)}
                            className="rounded-full px-6 text-gray-600 hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                if (tempFile) {
                                    setFileList([tempFile]);
                                }
                                setPreviewOpen(false);
                            }}
                            className="rounded-full px-6 bg-[#076EB8]"
                        >
                            Cập nhật
                        </Button>
                    </div>
                }
                width={500}
                centered
            >
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-64 h-64 rounded-full overflow-hidden mb-6 border border-gray-200">
                        <img
                            src={tempPreviewImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4 opacity-80">
                            <DownloadOutlined className="text-white text-2xl" />
                        </div>
                    </div>

                    <Upload
                        showUploadList={false}
                        beforeUpload={async (file) => {
                            const url = await getBase64(file);
                            setTempPreviewImage(url);
                            setTempFile({
                                uid: '-1',
                                name: file.name,
                                status: 'done',
                                url: url,
                                originFileObj: file
                            });
                            return false;
                        }}
                    >
                        <Button className="rounded-full bg-blue-50 text-[#076EB8] border-none px-6 py-2 h-auto font-medium hover:bg-blue-100">
                            Đổi ảnh đại diện
                        </Button>
                    </Upload>
                </div>
            </Modal>
        </div>
    );
}
