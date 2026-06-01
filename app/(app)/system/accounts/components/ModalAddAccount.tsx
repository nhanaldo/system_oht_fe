"use client";

import { UploadFile } from "antd/lib/upload/interface";
import FormItemController from "@/components/ui/CustomController";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { Form, GetProp, Button, Image, Modal, Select, Upload, UploadProps, Input } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAccount, updateAccount, uploadFile } from "../accountAction";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
//lấy ra kiểu dữ liệu chính xác của tệp tin (File) mà component <Upload> của Ant Design sử dụng khi xử lý ảnh
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]; // định nghĩa kiểu dữ liệu cho file ( CẤU TRÚC CÓ SẴN CỦA ANT DESIGN )

//hàm chuyển file ảnh thành chuỗi base64 ( để hiển thị ảnh ngay lập tức )
const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const schema = z.object({
    name: z.string().trim().min(1, "Họ và tên không được để trống"),
    username: z.string()
        .min(1, "Tên đăng nhập không được để trống")
        .regex(/^[^\s]+$/, "Tên đăng nhập không được chứa dấu cách")
        .refine(val => !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(val), "Tên đăng nhập không được chứa tiếng Việt có dấu")
        .regex(/^[a-zA-Z0-9_.]+$/, "Tên đăng nhập không được chứa ký tự đặc biệt"),
    code: z.string().trim().min(1, "Mã nhân viên không được để trống"),
    email: z.string().trim()
        .min(1, "Email không được để trống")
        .email("Email không đúng định dạng"),
    role_id: z.string().trim().min(1, "Vai trò không được để trống"),
    avatar: z.any().optional(),
});

interface ModalAddAccountProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    roleOptions?: { label: string, value: string }[];
    editingRecord?: any;
}

export default function ModalAddAccount({ open, onClose, onSuccess, roleOptions, editingRecord }: ModalAddAccountProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const { control, handleSubmit, reset, setValue, trigger, formState: { isDirty } } = useForm({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            name: "",
            username: "",
            code: "",
            email: "",
            role_id: "",
            avatar: null,
        }
    });
    //mở rộng chức năng modal để preview ảnh ( xem trước ảnh)
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    // const [mounted, setMounted] = useState(false);


    // xác định xem người dùng đã thực sự thay đổi ảnh đại diện (avatar) hay chưa, 
    // từ đó quyết định xem có cho phép nhấn nút "Lưu" (canSubmit) hay không.
    const isAvatarChanged = editingRecord?.id
        ? (fileList.length === 0 && !!editingRecord.avatar) || (fileList.length > 0 && !!fileList[0].originFileObj)
        : fileList.length > 0;
    // cho phép nhấn nút lưu khi có sự thay đổi dữ liệu 
    const canSubmit = isDirty || isAvatarChanged;
    // xử lý khi mở modal ( sửa hoặc thêm ) & reset form khi đóng modal 
    useEffect(() => {// xử lí lấy vai trò 
        if (editingRecord && open) {
            const roleId = editingRecord.role_ids?.[0] || editingRecord.role_id || (editingRecord.role_names?.[0] ? roleOptions?.find(r => r.label.toLowerCase() === editingRecord.role_names?.[0].toLowerCase())?.value : undefined);
            reset({
                name: editingRecord.name ?? "",
                username: editingRecord.username ?? "",
                code: editingRecord.code ?? "",
                email: editingRecord.email ?? "",
                role_id: roleId ?? "",
                avatar: null
            });
            // Set fileList with existing avatar if available
            if (editingRecord.avatar) {
                setFileList([{
                    uid: '-1', // ID giả định cho file đã tồn tại
                    name: 'avatar',
                    status: 'done', // Báo cho Ant Design biết ảnh này đã tải lên thành công rồi
                    url: editingRecord.avatar as string, // Link ảnh cũ từ server để làm ảnh thu nhỏ (thumbnail)
                }]);
            } else {
                setFileList([]); // Nếu không có ảnh cũ, xóa danh sách ảnh
            }

        } else if (!open) {//Khi Modal đóng lại
            setFileList([]); // Xóa danh sách tệp ảnh đã chọn
            setPreviewImage(''); // Xóa đường dẫn ảnh xem trước phóng to
            setPreviewOpen(false); // Đóng modal xem trước ảnh (nếu đang mở)
            reset({ name: "", username: "", code: "", email: "", role_id: "", avatar: null }); // Xóa sạch dữ liệu tất cả các ô chữ trong form
        }

    }, [editingRecord, open, reset, roleOptions]);
    // phóng to ảnh khi người dùng nhấn vào ảnh
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const handleBeforeUpload = (file: FileType) => {
        return false;
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8, color: "#545454" }}>Upload</div>
        </button>
    );

    const stylesFn: UploadProps<any>['styles'] = (info) => {
        if (info.props.multiple) {
            return {
                list: { color: "#54545499" },
                root: { border: '1px solid #D9D9D9', color: "#54545499" },
                item: { color: "#54545499", borderRadius: 2, backgroundColor: 'rgba(5, 5, 5, 0.06)', height: 30 },
            } satisfies UploadProps<any>['styles'];
        }
        return {};
    };

    const handleSubmitForm = async (data: any) => {
        setIsSubmitting(true);
        try {
            let avatarUrl = editingRecord?.avatar || '';

            // Handle file upload if there's a new file
            if (fileList[0]?.originFileObj) {
                const formData = new FormData();
                formData.append('storage_provider', 'minio');
                formData.append('folder', '/upload');
                formData.append('file', fileList[0].originFileObj);

                const res = await uploadFile(formData);
                if (res.success && res.data?.elements?.url) {
                    avatarUrl = res.data.elements.url;
                } else {
                    showError(res.error || 'Tải ảnh lên thất bại');
                    setIsSubmitting(false);
                    return;
                }
            } else if (fileList.length === 0) {
                avatarUrl = ''; // user removed avatar
            }

            const payload: any = {
                code: data.code?.trim(),
                username: data.username?.trim(),
                email: data.email?.trim(),
                name: data.name?.trim(),
                avatar: avatarUrl || undefined,
                role_ids: data.role_id ? [data.role_id] : [],
            };

            let response;
            if (editingRecord?.id) {
                response = await updateAccount(editingRecord.id, payload);
            } else {
                response = await addAccount(payload);
            }

            if (response.success) {
                showSuccess(editingRecord?.id ? 'Cập nhật tài khoản thành công' : 'Thêm mới tài khoản thành công');

                // Cập nhật avatar trên Header nếu đang chỉnh sửa chính tài khoản của mình
                const currentAccountId = document.cookie.split('; ').find(row => row.startsWith('accountId='))?.split('=')[1];
                if (editingRecord && editingRecord.id === currentAccountId && avatarUrl) {
                    localStorage.setItem("avatarUrl", avatarUrl);
                    window.dispatchEvent(new CustomEvent('avatar-changed', { detail: avatarUrl }));
                }

                reset({ name: "", username: "", code: "", email: "", role_id: "", avatar: null });
                setFileList([]);
                onClose();
                onSuccess?.();
                router.refresh();
            } else {
                showError(response.error || (editingRecord?.id ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi thêm mới"));
            }
        } catch (error: any) {
            console.error('Error:', error);
            showError('Đã xảy ra lỗi không xác định');
        } finally {
            setIsSubmitting(false);
        }
    }

    const commonLabelCol = {
        md: { flex: '200px' }, // chữ tiêu đề bên trái khóad cứng 
        xs: { span: 24 }, //trên mobile thì chữ tiêu đề chiếm hết chiều rộng 
        style: {
            height: 40,
            fontSize: 14,
            fontWeight: 400,// định dạng font chữ 
            textAlign: "left" as const,
            display: "flex",//chữ tiêu đề canh giữa theo chiều dọc
            alignItems: "center",//căn chỉnh theo chiều dọc 
            color: "#404040",
        }
    };

    const commonWrapperCol = {
        md: { flex: 'auto' },// độ rộng input sẽ tự co giãn
        xs: { span: 24 },
        style: { paddingLeft: 0, maxWidth: '100%' }
    };

    return (
        <ModalThemeProvider>
            <Modal
                closable={true}
                title={
                    <span style={{ fontSize: 18, fontWeight: 500, color: '#484848' }}>
                        {!!editingRecord?.id ? "Chỉnh sửa tài khoản" : "Thêm mới tài khoản"}
                    </span>
                }
                open={open}
                width={1000}
                centered
                zIndex={1005}
                className="responsive-modal"
                styles={{
                    mask: {
                        backdropFilter: "blur(0px)"
                    },
                    container: {
                        padding: "20px 40px 30px 40px",
                    }
                }}
                footer={null}
                onCancel={onClose}
                destroyOnHidden
            >
                <div className="flex flex-col items-center w-full">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] md:mb-[30px] mt-[9px]"></div>
                    {/* //giới hạn toàn bộ form là 720px */}
                    <Form onFinish={handleSubmit(handleSubmitForm)} className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]">
                        <FormItemController
                            name="name"
                            label="Họ và tên"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    aria-label="Họ và tên"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập họ và tên"
                                />
                            )}
                        />

                        <FormItemController
                            name="username"
                            label="Tên đăng nhập"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    aria-label="Tên đăng nhập"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập tên đăng nhập"
                                />
                            )}
                        />

                        <FormItemController
                            name="code"
                            label="Mã nhân viên"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    aria-label="Mã nhân viên"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập mã nhân viên"
                                />
                            )}
                        />

                        <FormItemController
                            name="email"
                            label="Email"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input
                                    value={field.value}
                                    onChange={(e) => {
                                        // Update form value silently without triggering validation
                                        setValue("email", e.target.value, { shouldValidate: false });
                                    }}
                                    onBlur={() => {
                                        // Trigger validation only when leaving the input (on blur)
                                        trigger("email");
                                    }}
                                    aria-label="Email"
                                    className="w-full h-[40px] rounded-md p-2"
                                    placeholder="Nhập email"
                                />
                            )}
                        />

                        <FormItemController
                            name="role_id"
                            label="Vai trò"
                            style={{ width: "100%", marginBottom: 20 }}
                            control={control}
                            required
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    value={roleOptions && roleOptions.length > 0 ? (field.value || undefined) : undefined}
                                    onChange={(val) => field.onChange(val ?? "")}
                                    onBlur={field.onBlur}
                                    style={{ height: 40 }}
                                    placeholder="Chọn vai trò"
                                    options={roleOptions || []}
                                    className="w-full rounded-md  "
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                />
                            )}
                        />

                        <FormItemController
                            name="avatar"
                            label="Hình ảnh"
                            style={{ width: "100%" }}
                            control={control}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <>
                                    <Upload
                                        beforeUpload={handleBeforeUpload}
                                        listType="picture-card"
                                        fileList={fileList}
                                        onPreview={handlePreview}
                                        onChange={handleChange}
                                        accept="image/*"
                                        styles={stylesFn}
                                        className="avatar-uploader-full"
                                    >
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {previewImage && (
                                        <Image
                                            styles={{ root: { display: 'none' } }}
                                            preview={{
                                                open: previewOpen,
                                                onOpenChange: (visible) => setPreviewOpen(visible),
                                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                            }}
                                            src={previewImage}
                                            alt="Preview"
                                        />
                                    )}
                                </>
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
                                Quay lại
                            </Button>
                            <Button
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: isSubmitting ? "#f5f5f5" : "#076EB8",
                                    color: isSubmitting ? "rgba(0, 0, 0, 0.25)" : "white",
                                    border: isSubmitting ? "1px solid #d9d9d9" : "none",
                                    padding: "5px 15px",
                                    height: 30,
                                    width: 54,
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
    )
}
