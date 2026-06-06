"use client";

import { useState } from "react";
import Image from "next/image";
import { BoxType, BoxTypeTableProps } from "@/types/box-type";
import CustomTable from "@/components/ui/CustomTable";
import { getBoxTypesColumns } from "./BoxTypeColumn";
import { Input, Space, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalAddBoxType from "./ModalAddBoxType";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { useRouter } from "next/navigation";
import { deleteBoxType } from "../boxTypesAction";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { useToast } from "@/components/ui/Toast";

export default function BoxTypeTable({ raw, warehouseId }: BoxTypeTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<BoxType | null>(null);

    // States for deletion modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();
    const { showSuccess, showError } = useToast();

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleAddClick = () => {
        setEditingRecord(null);
        setModalOpen(true);
    };

    const handleEditClick = (record: BoxType) => {
        setEditingRecord(record);
        setModalOpen(true);
    };

    const handleDeleteClick = (id: string | string[]) => {
        const ids = Array.isArray(id) ? id : [id];
        setDeletingIds(ids);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingIds.length === 0) return;
        setIsDeleting(true);
        try {
            for (const id of deletingIds) {
                const res = await deleteBoxType(warehouseId, id);
                if (!res.success) {
                    showError(res.error || `Không thể xóa loại thùng ID: ${id}`);
                    setIsDeleting(false);
                    return;
                }
            }

            showSuccess(
                deletingIds.length > 1
                    ? "Xóa các loại thùng thành công"
                    : "Xóa loại thùng thành công"
            );
            setDeleteModalOpen(false);
            setSelectedRowKeys([]);
            router.refresh();
        } catch (error) {
            showError("Đã xảy ra lỗi khi xóa");
        } finally {
            setIsDeleting(false);
            setDeletingIds([]);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingRecord(null);
    };

    const handleSuccess = () => {
        router.refresh();
    };

    // Filter box-types based on search name, dimensions, material, or tare weight
    const filteredData = raw.filter((item) => {
        const searchLower = searchText.toLowerCase();
        return (
            (item.name || "").toLowerCase().includes(searchLower) ||
            (item.dimensions || "").toLowerCase().includes(searchLower) ||
            (item.material || "").toLowerCase().includes(searchLower) ||
            String(item.tare_weight || "").toLowerCase().includes(searchLower)
        );
    });

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <div className="flex flex-col h-full min-h-0 relative p-4">
            {/* Header toolbar */}
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">
                        Quản lý loại thùng
                    </h2>
                    <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">
                        Đã chọn: {selectedRowKeys.length} mục
                    </p>
                </div>
                <ModalThemeProvider>
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
                        <Space style={{ gap: "15px" }}>
                            <Input
                                placeholder="Nhập vào tìm kiếm"
                                prefix={
                                    <SearchOutlined
                                        style={{ color: "#545454", fontSize: "18.34px", opacity: 0.6 }}
                                    />
                                }
                                className="rounded-[8px] placeholder:text-[#545454] !w-[200px] lg:!w-[300px]"
                                style={{
                                    width: "300px",
                                    height: "40px",
                                    fontFamily: "Roboto",
                                    fontSize: "16px",
                                }}
                                value={searchText}
                                onChange={onSearchChange}
                            />

                            <div className="flex items-center gap-[15px]">
                                <Image
                                    src="/icon.svg/delete.svg"
                                    alt="Xóa nhiều"
                                    width={40}
                                    height={40}
                                    onClick={() =>
                                        hasSelected &&
                                        handleDeleteClick(selectedRowKeys.map((k) => String(k)))
                                    }
                                    className={`hidden lg:block transition-opacity ${hasSelected
                                        ? "cursor-pointer hover:opacity-80"
                                        : "opacity-50 cursor-not-allowed"
                                        }`}
                                />
                                <Image
                                    src="/icon.svg/create.svg"
                                    alt="Thêm mới"
                                    width={40}
                                    height={40}
                                    onClick={handleAddClick}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                />
                            </div>
                        </Space>
                    </ConfigProvider>
                </ModalThemeProvider>
            </div>

            <div className="w-full h-[1px] bg-gray-200 mb-3 shrink-0"></div>

            {/* Table wrapper */}
            <div className="flex-1 min-h-0">
                <CustomTable
                    dataTable={filteredData}
                    columns={getBoxTypesColumns(handleDeleteClick, handleEditClick)}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        columnWidth: 46,
                    }}
                />
            </div>

            {/* Add / Edit Modal */}
            <ModalAddBoxType
                open={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
                editingRecord={editingRecord}
                warehouseId={warehouseId}
                existingBoxTypes={raw}
            />

            {/* Confirmation delete modal */}
            <ModalConfirmDelete
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Xác nhận xóa"
                content={
                    deletingIds.length > 1
                        ? `Bạn có chắc chắn muốn xóa ${deletingIds.length} loại thùng đã chọn không?`
                        : "Bạn có chắc chắn muốn xóa loại thùng này không? Hành động này không thể hoàn tác."
                }
            />
        </div>
    );
}
