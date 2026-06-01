"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import { Input, Space, message, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { deleteWarehouse } from "../warehouseAcction";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";

const ModalAddWarehouse = dynamic(() => import("./ModalAddWarehouse"), { ssr: false });

interface WorkflowTableProps {
    raw?: any[];
}

export default function WorkflowTable({ raw = [] }: WorkflowTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [messageApi, messageContext] = message.useMessage();

    const router = useRouter();

    const filteredData = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return raw;
        return raw.filter((item: any) =>
            (item.name || "").toLowerCase().includes(q) ||
            (item.code || "").toLowerCase().includes(q)
        );
    }, [raw, searchText]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
    };

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        content: string;
        onConfirm: () => Promise<void> | void;
        onCancel?: () => void;
        loading: boolean;
    }>({
        open: false,
        title: "Thông báo",
        content: "",
        onConfirm: () => { },
        loading: false,
    });

    const openConfirmModal = (
        title: string,
        content: string,
        onConfirm: () => Promise<void> | void,
        onCancel?: () => void
    ) => {
        setConfirmModal({
            open: true,
            title,
            content,
            onConfirm,
            onCancel,
            loading: false,
        });
    };

    const closeConfirmModal = () => {
        if (confirmModal.onCancel) {
            confirmModal.onCancel();
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
    };

    const handleConfirm = async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        await confirmModal.onConfirm();
        setConfirmModal((prev) => ({ ...prev, loading: false }));
    };

    const handleDelete = (record: any) => {
        const name = record.name || "kho này";

        openConfirmModal(
            "Thông báo",
            `Bạn có chắc chắn muốn xóa ${name} không?`,
            async () => {
                try {
                    const res: any = await deleteWarehouse(record.id);
                    if (res && res.error) {
                        messageApi.error(res.error);
                    } else {
                        messageApi.success(`Đã xóa kho ${record.name} thành công`);
                        setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));
                        router.refresh();
                    }
                } catch {
                    messageApi.error("Có lỗi xảy ra khi xóa kho");
                } finally {
                    setConfirmModal((prev) => ({ ...prev, open: false }));
                }
            }
        );
    };

    const handleBatchDelete = () => {
        if (selectedRowKeys.length === 0) return;

        openConfirmModal(
            "Thông báo",
            `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} kho đã chọn không?`,
            async () => {
                try {
                    const deletePromises = selectedRowKeys.map((id) => deleteWarehouse(id.toString()));
                    const results = await Promise.all(deletePromises);

                    const errors = results.filter((res: any) => res?.error);
                    if (errors.length > 0) {
                        messageApi.error(`Có lỗi xảy ra khi xóa ${errors.length} kho`);
                    } else {
                        messageApi.success(`Đã xóa thành công ${selectedRowKeys.length} mục đã chọn`);
                        setSelectedRowKeys([]);
                        router.refresh();
                    }
                } catch {
                    messageApi.error("Có lỗi xảy ra khi xóa");
                } finally {
                    setConfirmModal((prev) => ({ ...prev, open: false }));
                }
            }
        );
    };

    const columns = useMemo(
        () =>
            getColumns({
                router,
                onDelete: handleDelete,
                onEdit: (record) => {
                    setSelectedRow(record);
                    showModal();
                },
            }),
        [router, filteredData, selectedRowKeys]
    );

    return (
        <div className="flex flex-col h-full min-h-0">
            {messageContext}
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">
                        Quản lý thông tin kho
                    </h2>
                    <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">
                        Đã chọn: {selectedRowKeys.length} mục
                    </p>
                </div>
                <ConfigProvider
                    theme={{
                        components: {
                            Input: {
                                colorBorder: "#DADBDD",
                                hoverBorderColor: "#DADBDD",
                                activeBorderColor: "#DADBDD",
                                activeShadow: "none",
                            },
                        },
                    }}
                >
                    <Space style={{ gap: 15 }}>
                        <Input
                            placeholder="Nhập vào tìm kiếm"
                            prefix={<SearchOutlined style={{ color: "#545454", fontSize: "18.34px", opacity: 0.6 }} />}
                            className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px]"
                            style={{ width: "300px", fontSize: "16px", height: "40px" }}
                            value={searchText}
                            onChange={onSearchChange}
                        />
                        <Image
                            src="/icon.svg/delete.svg"
                            alt="Xóa"
                            width={40}
                            height={40}
                            onClick={handleBatchDelete}
                            className={`cursor-pointer hover:opacity-80 transition-opacity ${selectedRowKeys.length === 0 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                                }`}
                        />
                        <Image
                            src="/icon.svg/create.svg"
                            alt="Thêm"
                            width={40}
                            height={40}
                            onClick={showModal}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Space>
                </ConfigProvider>
            </div>

            <div className="w-full h-[1px] bg-gray-200 mb-3 shrink-0"></div>
            <div className="flex-1 min-h-0">
                <CustomTable
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        columnWidth: 46
                    }}
                    columns={columns as any}
                    dataTable={filteredData}
                    keyIndex="id"

                />
            </div>

            {isModalOpen && (
                <ModalAddWarehouse
                    open={isModalOpen}
                    onSubmit={() => { }}
                    onClose={handleCancel}
                    children={selectedRow}
                />
            )}

            <ModalConfirmDelete
                open={confirmModal.open}
                onClose={closeConfirmModal}
                onConfirm={handleConfirm}
                title={confirmModal.title}
                content={confirmModal.content}
                loading={confirmModal.loading}
            />
        </div>
    );
}