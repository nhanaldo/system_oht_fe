"use client";

import { Modal, Button, message, Select, Space, Input, Form } from "antd";
import { useState, useEffect } from "react";
import { addPermission, getPublicIcons, getResources, updatePermission } from "../permissionsAction";
import Image from "next/image";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormItemController from "@/components/ui/CustomController";

const schema = z.object({
    name: z.string().trim().min(1, "Vui lòng nhập Menu"),
    icon: z.string().min(1, "Vui lòng chọn Icon"),
    parent_id: z.string().min(1, "Vui lòng chọn nhóm cha"),
    path: z.string().trim().optional(),
    resource_id: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.parent_id !== 'root' && (!data.path || data.path.trim() === "")) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng nhập đường dẫn",
            path: ["path"],
        });
    }
});

type FormValues = z.infer<typeof schema>;

interface ModalAddPermissionsProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onSwitchToSub?: (data: any) => void;
    menuTree?: any[];
    initialData?: any;
}

export default function ModalAddPermissions({ open, onClose, onSuccess, menuTree, initialData }: ModalAddPermissionsProps) {
    const [loading, setLoading] = useState(false);
    const [icons, setIcons] = useState<string[]>([]);
    const [resources, setResources] = useState<{ label: string; value: string }[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [mounted, setMounted] = useState(false);

    const { control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            icon: "",
            parent_id: "root",
            path: "",
            resource_id: undefined,
        }
    });

    const parentId = watch("parent_id");
    const isSubMenu = parentId !== "root";
    const isEdit = !!initialData;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchIcons = async () => {
            const response = await getPublicIcons();
            if (response.success && response.data) {
                setIcons(response.data);
            }
        };
        fetchIcons();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name || "",
                    icon: initialData.icon || "",
                    parent_id: initialData.parent_id || "root",
                    path: initialData.path || "",
                    resource_id: initialData.resource_id || undefined,
                });
            } else {
                reset({
                    name: "",
                    icon: "",
                    parent_id: "root",
                    path: "",
                    resource_id: undefined,
                });
            }
        }
    }, [open, reset, initialData]);

    useEffect(() => {
        if (!isSubMenu) return;
        const fetchResources = async () => {
            setResourcesLoading(true);
            try {
                const res = await getResources({ limit: 100 });
                if (res.success && res.data) {
                    const elements = res.data?.elements || res.data?.rows || res.data?.data || res.data || [];
                    setResources(
                        (elements as any[]).map((r: any) => ({
                            label: r.code,
                            value: r.id,
                        }))
                    );
                }
            } catch {
                // ignore
            } finally {
                setResourcesLoading(false);
            }
        };
        fetchResources();
    }, [isSubMenu]);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const payload: any = {
                name: values.name.trim(),
                icon: values.icon,
                parent_id: values.parent_id === 'root' ? [] : values.parent_id,
            };

            // Chỉ gửi path và resource_id nếu là menu con
            // Đối với menu cha, không gửi để giữ nguyên dữ liệu cũ trên server
            if (isSubMenu) {
                payload.path = values.path?.trim() || '';
                payload.resource_id = values.resource_id || null;
            } else if (!isEdit) {
                // Nếu là thêm mới menu cha thì mới set rỗng
                payload.path = '';
                payload.resource_id = null;
            }

            const response = isEdit
                ? await updatePermission(initialData.id, payload)
                : await addPermission(payload);

            if (response.success) {
                messageApi.success(isEdit ? "Cập nhật chức năng thành công" : "Thêm mới chức năng thành công");
                reset();
                if (onSuccess) onSuccess();
                onClose();
            } else {
                messageApi.error(response.error || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Submit Failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const flattenTree = (nodes: any[], result: any[] = []) => {
        if (!nodes) return result;
        nodes.forEach(node => {
            result.push({ label: node.name, value: node.id });
            if (node.children && node.children.length > 0) {
                flattenTree(node.children, result);
            }
        });
        return result;
    };

    const parentOptions = [
        { label: 'Root', value: 'root' },
        ...flattenTree(menuTree || [])
    ];

    if (!mounted) return null;

    const commonLabelCol = {
        style: {
            minWidth: 200,
            height: 40,
            fontSize: 14,
            fontWeight: 400,
            textAlign: "left" as const,
            display: "flex",
            alignItems: "center",
            color: "#404040",
        }
    };

    const commonWrapperCol = { style: { paddingLeft: 0 } };

    return (
        <Modal
            title={<span className="text-[18px] font-roboto font-semibold text-[#2C352C]">{isEdit ? "Chỉnh sửa chức năng" : "Thêm mới chức năng"}</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={800}
            destroyOnHidden
            styles={{
                mask: {
                    backdropFilter: "blur(0px)"
                },

                container: {
                    padding: "19px 24px 29px 24px",
                }
            }}
        >
            {contextHolder}
            <ModalThemeProvider>
                <div className="flex flex-col items-center">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[30px] mt-[9px]"></div>

                    <Form onFinish={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center md:min-w-[716px]">
                        <FormItemController
                            control={control}
                            name="name"
                            label="Menu"
                            required
                            style={{ width: "100%", marginBottom: 20 }}
                            labelCol={commonLabelCol}
                            wrapperCol={commonWrapperCol}
                            render={(field) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder="Nhập Menu"
                                    className="w-full h-[40px] rounded-md p-2"
                                />
                            )}
                        />

                        <FormItemController
                            control={control}
                            name="icon"
                            label="Icon"
                            required
                            style={{ width: "100%", marginBottom: 20 }}
                            labelCol={commonLabelCol}
                            wrapperCol={commonWrapperCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    placeholder="Chọn icon"
                                    className="w-full rounded-md"
                                    style={{ height: 40 }}
                                    showSearch
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                >
                                    {icons.map(iconFile => (
                                        <Select.Option key={iconFile} value={iconFile}>
                                            <Space align="center">
                                                <div className="w-4 h-4 relative flex items-center justify-center">
                                                    <Image
                                                        src={`/icon.svg/${iconFile}`}
                                                        alt={iconFile}
                                                        width={16}
                                                        height={16}
                                                        style={{ objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <span>{iconFile}</span>
                                            </Space>
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        />

                        <FormItemController
                            control={control}
                            name="parent_id"
                            label="Menu cha"
                            required
                            style={{ width: "100%", marginBottom: 20 }}
                            labelCol={commonLabelCol}
                            wrapperCol={commonWrapperCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    placeholder="Root"
                                    className="w-full rounded-md"
                                    style={{ height: 40 }}
                                    options={parentOptions}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    disabled={isEdit && initialData.parent_id !== 'root'}
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        if (val === 'root') {
                                            setValue('path', '');
                                            setValue('resource_id', undefined);
                                        }
                                    }}
                                />
                            )}
                        />

                        {isSubMenu && (
                            <>
                                <FormItemController
                                    control={control}
                                    name="path"
                                    label="Đường dẫn"
                                    required
                                    style={{ width: "100%", marginBottom: 20 }}
                                    labelCol={commonLabelCol}
                                    wrapperCol={commonWrapperCol}
                                    render={(field) => (
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="Nhập đường dẫn"
                                            className="w-full h-[40px] rounded-md p-2"
                                        />
                                    )}
                                />

                                <FormItemController
                                    control={control}
                                    name="resource_id"
                                    label="Resource"
                                    style={{ width: "100%", marginBottom: 30 }}
                                    labelCol={commonLabelCol}
                                    wrapperCol={commonWrapperCol}
                                    render={(field) => (
                                        <Select
                                            {...field}
                                            placeholder="Chọn resource"
                                            className="w-full rounded-md"
                                            style={{ height: 40 }}
                                            options={resources}
                                            loading={resourcesLoading}
                                            // disabled={isEdit && initialData.parent_id !== 'root'}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                        />
                                    )}
                                />
                            </>
                        )}

                        <div className="flex flex-row items-center justify-center w-full gap-[20px] mt-[26px]">
                            <Button
                                onClick={onClose}
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
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{
                                    backgroundColor: loading ? "#f5f5f5" : "#076EB8",
                                    color: loading ? "rgba(0, 0, 0, 0.25)" : "white",
                                    border: loading ? "1px solid #d9d9d9" : "none",
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
            </ModalThemeProvider>
        </Modal>
    );
}
