"use client";
import React from "react";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input, Space, Modal, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import ModalAddPermissions from "./ModalAddPermissions";
import { useRouter } from "next/navigation";
import { deletePermission, reorderMenu } from "../permissionsAction";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useToast } from "@/components/ui/Toast";

interface MenuTreeItem {
    id: string;
    name: string;
    code?: string;
    icon?: string;
    parent_id?: string | null;
    path?: string;
    level?: number;
    order_number?: number;
    children?: MenuTreeItem[];
}

interface PermissionsTableProps {
    raw: MenuTreeItem[];
    onRefresh?: () => void;
}

interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
}

const DraggableRow = ({ children, ...props }: DraggableRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr
            {...props}
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`${props.className} drag-row group`}
        >
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && (child.props as any).className?.includes('ant-table-selection-column')) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        children: (
                            <div className="relative flex items-center justify-center w-full h-full">
                                <div className="group-hover:hidden flex items-center justify-center">
                                    {(child as any).props.children}
                                </div>
                                <div
                                    ref={setActivatorNodeRef}
                                    {...listeners}
                                    className="hidden group-hover:flex items-center justify-center cursor-grab active:cursor-grabbing"
                                >
                                    <img src="/icon.svg/drop.svg" alt="drag" className="w-[12px] h-[12px]" />
                                </div>
                            </div>
                        ),
                    });
                }
                return child;
            })}
        </tr>
    );
};

export default function PermissionsTable({ raw, onRefresh }: PermissionsTableProps) {
    const [searchText, setSearchText] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
    const [subModalInitialData, setSubModalInitialData] = useState<any>(null);
    const [editData, setEditData] = useState<any>(null);

    // States for ModalConfirmDelete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Format serial numbers (STT) and sort by order_number recursively
    const formattedTree = useMemo(() => {
        const attachSTT = (items: any[], parentSTT?: string): any[] => {
            if (!Array.isArray(items)) return [];
            const sorted = [...items].sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));
            return sorted.map((item, index) => {
                const currentSTT = parentSTT ? `${parentSTT}.${index + 1}` : `${index + 1}`;
                const updatedItem = {
                    ...item,
                    stt: currentSTT,
                    key: item.id
                };
                if (item.children && item.children.length > 0) {
                    updatedItem.children = attachSTT(item.children, currentSTT);
                } else {
                    delete updatedItem.children;
                }
                return updatedItem;
            });
        };
        return attachSTT(raw);
    }, [raw]);
    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };
    // Recursive search filter
    const filteredTree = useMemo(() => {
        if (!searchText.trim()) return formattedTree;
        const q = searchText.toLowerCase().trim();

        const filterNodes = (nodes: any[]): any[] => {
            return nodes
                .map(node => {
                    const matches = (
                        (node.name || "").toLowerCase().includes(q) ||
                        (node.code || "").toLowerCase().includes(q) ||
                        (node.path || "").toLowerCase().includes(q)
                    );
                    if (node.children && node.children.length > 0) {
                        const filteredChildren = filterNodes(node.children);
                        if (filteredChildren.length > 0) {
                            return { ...node, children: filteredChildren };
                        }
                    }
                    return matches ? node : null;
                })
                .filter(node => node !== null);
        };

        return filterNodes(formattedTree);
    }, [formattedTree, searchText]);

    const handleSwitchToSub = (formData: any) => {
        setIsAddModalOpen(false);
        setSubModalInitialData(formData);
        setIsAddSubModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditData(record);
        setIsAddModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        // Find the dragged item and the target item in the flat list
        const findNode = (nodes: any[], id: string): any => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const activeNode = findNode(raw, active.id as string);
        const overNode = findNode(raw, over.id as string);

        if (!activeNode || !overNode) return;

        // Ensure they have the same parent (or both are root)
        if (activeNode.parent_id !== overNode.parent_id) {
            showError("Chỉ có thể sắp xếp các menu cùng cấp");
            return;
        }

        // Get siblings
        const getSiblings = (nodes: any[], parentId: string | null): any[] => {
            if (!parentId || parentId === 'root') {
                return nodes;
            }
            const parent = findNode(raw, parentId);
            return parent?.children || [];
        };

        const siblings = getSiblings(raw, activeNode.parent_id);
        const sortedSiblings = [...siblings].sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));

        const oldIndex = sortedSiblings.findIndex(s => s.id === active.id);
        const newIndex = sortedSiblings.findIndex(s => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // The new order number is simply the new index + 1
        const newOrderNumber = newIndex + 1;

        try {
            const res = await reorderMenu({
                menu_id: active.id as string,
                new_order_number: newOrderNumber,
            });

            if (res.success) {
                showSuccess("Sắp xếp chức năng thành công");
                if (onRefresh) onRefresh();
            } else {
                showError(res.error || "Không thể sắp xếp chức năng");
            }
        } catch (err: any) {
            showError(err.message || "Lỗi khi sắp xếp");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await deletePermission(deleteId);
            if (res.success) {
                showSuccess("Xóa chức năng thành công");
                if (onRefresh) onRefresh();
            } else {
                showError(res.error || "Không thể xóa chức năng");
            }
        } catch (err: any) {
            showError(err.message || "Đã có lỗi khi thực thi lệnh xóa");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <ModalThemeProvider>
            <div className="w-full h-full flex flex-col">

                {/* Header section matching exact design */}
                <div className="flex justify-between items-start mb-2 shrink-0">
                    <div className="min-w-0 flex-1 mr-2">
                        <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">
                            Quản lý chức năng
                        </h2>
                        <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">
                            Đã chọn: {selectedRowKeys.length} mục
                        </p>
                    </div>

                    <Space size="middle">
                        <Input
                            placeholder="Nhập vào tìm kiếm"
                            prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                            className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px] lg:!w-[300px] !w-[200px]"
                            style={{ width: '300px', fontSize: '16px', height: '40px' }}
                            value={searchText}
                            onChange={onSearchChange}
                        />
                        <Image
                            src="/icon.svg/create.svg"
                            alt="Thêm"
                            width={40}
                            height={40}
                            onClick={() => setIsAddModalOpen(true)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Space>

                </div>

                <div className="w-full h-[1px] bg-gray-100 mb-3 shrink-0"></div>

                {/* Table Container */}
                <div className="flex-1  min-h-0 permissions-table">
                    <style>{`
                    
                    .permissions-table .parent-row > td {
                        background-color: #E6F7FFC4 !important;
                    }
                    .permissions-table .ant-table-selection-column {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                `}</style>
                    <DndContext
                        sensors={sensors}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={onDragEnd}
                    >
                        <SortableContext
                            items={useMemo(() => {
                                const ids: string[] = [];
                                const flatten = (nodes: any[]) => {
                                    nodes.forEach(n => {
                                        ids.push(n.id);
                                        if (n.children) flatten(n.children);
                                    });
                                };
                                flatten(filteredTree);
                                return ids;
                            }, [filteredTree])}
                            strategy={verticalListSortingStrategy}
                        >
                            <CustomTable
                                dataTable={filteredTree}
                                columns={getColumns(handleEdit, handleDelete)}
                                keyIndex="id"
                                rowSelection={{
                                    selectedRowKeys,
                                    onChange: (keys) => setSelectedRowKeys(keys),
                                    columnWidth: 15, // chiều rộng của checkbox tương ứng với colum
                                    hideSelectAll: true,// ẩn nút checkbox
                                }}
                                rowClassName={(record: any) => (!record.parent_id ? 'parent-row' : '')}
                                expandable={{
                                    expandIconColumnIndex: 3,// DOW bên chức năng 
                                }}
                                components={{
                                    body: {
                                        row: DraggableRow,
                                    },
                                }}
                            />
                        </SortableContext>
                    </DndContext>
                </div>


                <ModalAddPermissions
                    open={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditData(null);
                    }}
                    onSuccess={() => {
                        if (onRefresh) onRefresh();
                    }}
                    onSwitchToSub={handleSwitchToSub}
                    menuTree={raw}
                    initialData={editData}
                />



                <ModalConfirmDelete
                    open={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Thông báo"
                    content="Bạn có chắc chắn muốn xóa chức năng này không?"
                    loading={isDeleting}
                />
            </div>
        </ModalThemeProvider>
    );
}
