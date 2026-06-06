"use client";

import { useState } from "react";
import Image from "next/image";
import { UnitType, UnitTypesTableProps } from "@/types/unit-type";
import CustomTable from "@/components/ui/CustomTable";
import { getUnitTypesColumns } from "./UnitTypesColumn";
import { Input, Space, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalAddUnitType from "./ModalAddUnitType";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { useRouter } from "next/navigation";
import { deleteUnitOfMeasure } from "../unit-typesAction";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { useToast } from "@/components/ui/Toast";

export default function UnitTypesTable({ raw }: UnitTypesTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<UnitType | null>(null);

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

    const handleEditClick = (record: UnitType) => {
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
                const res = await deleteUnitOfMeasure(id);
                if (!res.success) {
                    showError(res.error || `Không thể xóa đơn vị tính ID: ${id}`);
                    setIsDeleting(false);
                    return;
                }
            }

            showSuccess(
                deletingIds.length > 1
                    ? "Xóa các đơn vị tính thành công"
                    : "Xóa đơn vị tính thành công"
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

    // Filter unit-types based on search name or description/discripsion
    const filteredData = raw.filter((item) => {
        const searchLower = searchText.toLowerCase();
        const desc = item.description || item.discripsion || "";
        return (
            (item.name || "").toLowerCase().includes(searchLower) ||
            desc.toLowerCase().includes(searchLower)
        );
    });

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Header toolbar */}
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">Đơn vị Tính </h2>
                    <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">Đã chọn: {selectedRowKeys.length} mục</p>
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
                                    alt="Xóa"
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
                                    alt="Thêm"
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
                    columns={getUnitTypesColumns(handleDeleteClick, handleEditClick)}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        columnWidth: 46,
                    }}
                />
            </div>

            {/* Add / Edit Modal */}
            <ModalAddUnitType
                open={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
                editingRecord={editingRecord}
                existingUnitTypes={raw}
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
                        ? `Bạn có chắc chắn muốn xóa ${deletingIds.length} đơn vị tính đã chọn không?`
                        : "Bạn có chắc chắn muốn xóa đơn vị tính này không? Hành động này không thể hoàn tác."
                }
            />
        </div>
    );
}
