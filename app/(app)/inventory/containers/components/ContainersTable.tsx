"use client";

import { useState } from "react";
import Image from "next/image";
import { Container, ContainersTableProps } from "@/types/container";
import CustomTable from "@/components/ui/CustomTable";
import { getContainersColumns } from "./ContainersColumn";
import { Input, Space, ConfigProvider, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalAddContainers from "./ModalAddContainers";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { useRouter } from "next/navigation";
import { deleteContainer } from "../containersAction";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import FakeChildPallets from "./FakeChildPallets";
import { useToast } from "@/components/ui/Toast";

const parseMetadata = (metadata: any) => {
    if (!metadata) return {};
    if (typeof metadata === "object") return metadata;
    try {
        return JSON.parse(metadata);
    } catch (e) {
        return {};
    }
};

export default function ContainersTable({ raw, warehouseId }: ContainersTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Container | null>(null);

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

    const handleEditClick = (record: Container) => {
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
                const res = await deleteContainer(warehouseId, id);
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

    // Parse unique container types for filter dropdown
    const uniqueTypes = Array.from(
        new Set(raw.map((item) => item.container_type).filter(Boolean))
    );

    const selectOptions = [
        { label: "Tất cả loại", value: "all" },
        ...uniqueTypes.map((t) => ({ label: t, value: t })),
    ];

    // Filter containers based on search text and type
    const filteredData = raw.filter((item) => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
            (item.code || "").toLowerCase().includes(searchLower) ||
            (item.container_type || "").toLowerCase().includes(searchLower) ||
            (item.qr_code || "").toLowerCase().includes(searchLower);

        const meta = parseMetadata(item.metadata);
        const matchesMeta =
            (meta.dimensions || "").toLowerCase().includes(searchLower) ||
            (meta.material || "").toLowerCase().includes(searchLower) ||
            (meta.unit || "").toLowerCase().includes(searchLower);

        const matchesType = filterType === "all" || item.container_type === filterType;

        return (matchesSearch || matchesMeta) && matchesType;
    });

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <div className="flex flex-col h-full min-h-0 relative p-4">
            {/* Header toolbar */}
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">
                        Quản lý loại Pallet
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


                            <div className="flex items-center gap-[15px] ">
                                <Image
                                    src="/icon.svg/printer.svg"
                                    title="In pallet"
                                    alt="In"
                                    width={40}
                                    height={40}
                                    className="cursor-pointer hover:opacity-80 transition-opacity hidden lg:block"
                                />
                                <Image
                                    src="/icon.svg/create.svg"
                                    title="Thêm mới pallet"
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
                    columns={getContainersColumns(handleDeleteClick, handleEditClick)}
                    keyIndex="id"
                    expandable={{
                        //Đây là thuộc tính quan trọng nhất để tạo ra hàng mở rộng (mục con). 
                        //Nó quyết định nội dung gì sẽ được hiển thị khi bạn click mở rộng một hàng.
                        expandedRowRender: (record: Container) => (
                            <FakeChildPallets
                                parentId={record.id}
                                selectedRowKeys={selectedRowKeys}
                                setSelectedRowKeys={setSelectedRowKeys}
                            />
                        ),
                        // cho biết hàm này đang mở hay đóng 
                        expandIcon: ({ expanded, onExpand, record }) => (
                            <Image
                                src={expanded ? "/icon.svg/minus-square.svg" : "/icon.svg/add-square.svg"}
                                alt="Expand"
                                width={20}
                                height={20}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => onExpand(record, e)}
                            />
                        ),
                        //để gán thêm class CSS cho cái khung
                        expandedRowClassName: () => 'no-padding-expanded-row',
                    }}
                />
            </div>

            {/* Add / Edit Modal */}
            <ModalAddContainers
                open={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
                editingRecord={editingRecord}
                warehouseId={warehouseId}
                existingContainers={raw}
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
