"use client";

import { useState } from "react";
import Image from "next/image";
import { Workflow } from "@/types/workflow";
import CustomTable from "@/components/ui/CustomTable";
import { getWorkflowsColumns } from "./WorkflowsColumn";
import { Input, Space, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalAddWorkflows from "./ModalAddWorkflows";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { useRouter } from "next/navigation";
import { deleteWorkflow, updateWorkflowStatus } from "../workflowsAction";
import WorkflowsStep from "./WorkflowsStep";
import { useToast } from "@/components/ui/Toast";

interface WorkflowsTableProps {
    raw: Workflow[];
    warehouseId: string;
}

export default function WorkflowsTable({ raw, warehouseId }: WorkflowsTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Workflow | null>(null);

    // View state: 'table' or 'setup'
    const [view, setView] = useState<'table' | 'setup'>('table');
    const [setupWorkflow, setSetupWorkflow] = useState<Workflow | null>(null);

    // State cho Modal xóa
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // State cho Modal chuyển đổi trạng thái
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [togglingData, setTogglingData] = useState<{ id: string, isActive: boolean } | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
    // mở modal chỉnh sửa
    const handleEditClick = (record: Workflow) => {
        setEditingRecord(record);
        setModalOpen(true);
    };

    const handleDeleteClick = (id: string | string[]) => {
        const ids = Array.isArray(id) ? id : [id];
        setDeletingIds(ids);
        setDeleteModalOpen(true);
    };

    // xử lý mở modal chuyển đổi trạng thái
    const handleToggleStatus = (id: string, isActive: boolean) => {
        setTogglingData({ id, isActive });
        setStatusModalOpen(true);
    };
    // nhận id, đổi vị trí và mở tab setup
    const handleSetup = (id: string) => {
        const wf = raw.find(w => w.id === id);
        if (wf) {
            setSetupWorkflow(wf);
            setView('setup');
        }
    };
    // quay lại bảng
    const handleBackToTable = () => {
        setView('table');
        setSetupWorkflow(null);
    };

    const handleConfirmDelete = async () => {
        if (deletingIds.length === 0) return;
        setIsDeleting(true);
        try {
            for (const id of deletingIds) {
                await deleteWorkflow(warehouseId, id);
            }

            showSuccess(deletingIds.length > 1 ? "Xóa các quy trình thành công" : "Xóa quy trình thành công");
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
    // xác nhận chuyển đổi trạng thái
    const handleConfirmToggleStatus = async () => {
        if (!togglingData) return;
        setIsUpdatingStatus(true);
        try {
            const res = await updateWorkflowStatus(warehouseId, togglingData.id, togglingData.isActive);
            if (res.success) {
                showSuccess(togglingData.isActive ? "Kích hoạt quy trình thành công" : "Ngưng quy trình thành công");
                setStatusModalOpen(false);
                router.refresh();
            } else {
                showError(res.error || "Không thể cập nhật trạng thái");
            }
        } catch (error) {
            showError("Đã xảy ra lỗi khi cập nhật");
        } finally {
            setIsUpdatingStatus(false);
            setTogglingData(null);
        }
    };
    // đóng modal thêm mới/ chỉnh sửa
    const handleModalClose = () => {
        setModalOpen(false);
        setEditingRecord(null);
    };

    const handleSuccess = () => {
        router.refresh();
    };

    const filteredData = raw.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
            (item.name || '').toLowerCase().includes(searchLower) ||
            (item.code || '').toLowerCase().includes(searchLower) ||
            (item.description || '').toLowerCase().includes(searchLower)
        );
    });

    const hasSelected = selectedRowKeys.length > 0;

    if (view === 'setup' && setupWorkflow) {
        return (
            <WorkflowsStep
                workflowId={setupWorkflow.id}
                warehouseId={warehouseId}
                workflowName={setupWorkflow.name}
                onBack={handleBackToTable}
            />
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 relative p-4">
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">Quản lý quy trình</h2>
                    <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">Đã chọn: {selectedRowKeys.length} mục</p>
                </div>
                <ConfigProvider
                    theme={{
                        components: {
                            Input: {
                                colorBorder: '#DADBDD',
                                hoverBorderColor: '#DADBDD',
                                activeBorderColor: '#DADBDD',
                                activeShadow: 'none',
                            }
                        }
                    }}
                >
                    <Space style={{ gap: "15px" }}>
                        <Input
                            placeholder="Nhập vào tìm kiếm"
                            prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                            className="rounded-[8px] placeholder:text-[#545454]"
                            style={{ width: '300px', height: '40px', fontFamily: 'Roboto', fontSize: '16px' }}
                            value={searchText}
                            onChange={onSearchChange}
                        />
                        <div className="flex items-center gap-[15px]">
                            <Image
                                src="/icon.svg/delete.svg"
                                alt="Xóa"
                                width={40}
                                height={40}
                                onClick={() => hasSelected && handleDeleteClick(selectedRowKeys.map(k => String(k)))}
                                className={`transition-opacity ${hasSelected ? 'cursor-pointer hover:opacity-80' : 'opacity-50 cursor-not-allowed'}`}
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
            </div>

            <div className="w-full h-[1px] bg-gray-200 mb-3 shrink-0"></div>

            <div className="flex-1 min-h-0">
                <CustomTable
                    dataTable={filteredData}
                    columns={getWorkflowsColumns(
                        handleDeleteClick,
                        handleEditClick,
                        handleToggleStatus,
                        handleSetup
                    )}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        columnWidth: 46,
                    }}
                />
            </div>

            <ModalAddWorkflows
                open={modalOpen}
                onClose={handleModalClose}
                onSuccess={handleSuccess}
                editingRecord={editingRecord}
                warehouseId={warehouseId}
                existingWorkflows={raw}
            />

            <ModalConfirmDelete
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Xác nhận xóa"
                content={deletingIds.length > 1
                    ? `Bạn có chắc chắn muốn xóa ${deletingIds.length} quy trình đã chọn không?`
                    : "Bạn có chắc chắn muốn xóa quy trình này không? Hành động này không thể hoàn tác."
                }
            />

            <ModalConfirmDelete
                open={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                onConfirm={handleConfirmToggleStatus}
                loading={isUpdatingStatus}
                title={togglingData?.isActive ? "Kích hoạt quy trình" : "Xác nhận ngưng hoạt động"}
                content={togglingData?.isActive
                    ? "Bạn có muốn kích hoạt quy trình này không?"
                    : "Bạn có muốn ngưng quy trình hoạt động này không?"
                }
            />
        </div>
    );
}
