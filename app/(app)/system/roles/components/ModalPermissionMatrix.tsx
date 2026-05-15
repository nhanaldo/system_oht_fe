import React, { useEffect, useState } from 'react';
import { Modal, Table, Checkbox, Spin, Button, message } from 'antd';
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import type { ColumnsType } from 'antd/es/table';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { getRolePermissionMatrix, syncRolePermissions } from '../roleAction';


interface PermissionDetail {
    permissionId: string;
    is_selected: boolean;
}

interface PermissionMatrixNode {
    menu_id: string;
    menuName: string;
    level: number;
    permissions: Record<string, PermissionDetail>;
    children?: PermissionMatrixNode[];
}


interface ModalPermissionMatrixProps {
    open: boolean;
    roleId?: string;
    onClose: () => void;
}

const PERMISSION_COLUMNS = [
    { key: 'CREATE', label: 'Thêm' },
    { key: 'DELETE', label: 'Xóa' },
    { key: 'UPDATE', label: 'Sửa' },
    { key: 'READ', label: 'Xem', altKey: 'VIEW' },
    { key: 'IMPORT', label: 'Import' },
    { key: 'EXPORT', label: 'Export' },
];

export default function ModalPermissionMatrix({ open, roleId, onClose }: ModalPermissionMatrixProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PermissionMatrixNode[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    // Quản lý state cho các permission đã chọn: compositeKey (menuId_permissionId) -> boolean
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
    const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

    const toggleParent = (menuId: string) => {
        setCollapsedParents(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    const getVisibleData = (): any[] => {
        const flat: any[] = [];
        let parentIndex = 1;

        data.forEach(node => {
            const parentStt = `${parentIndex}`;
            const isCollapsed = !!collapsedParents[node.menu_id];

            flat.push({
                ...node,
                stt: parentStt,
                isCollapsed,
            });

            if (!isCollapsed && node.children && node.children.length > 0) {
                let childIndex = 1;
                node.children.forEach(child => {
                    flat.push({
                        ...child,
                        stt: `${parentStt}.${childIndex}`,
                    });
                    childIndex++;
                });
            }
            parentIndex++;
        });

        return flat;
    };

    useEffect(() => {
        if (open && roleId) {
            fetchPermissionMatrix(roleId);
        } else {
            setData([]);
            setSelectedPermissions({});
        }
    }, [open, roleId]);

    const fetchPermissionMatrix = async (id: string) => {
        setLoading(true);
        try {
            const res = await getRolePermissionMatrix(id);
            if (res.success) {
                const matrixData = (res.data as any)?.data || [];
                setData(matrixData);

                // Khởi tạo state ban đầu cho các checkbox
                const initialSelected: Record<string, boolean> = {};

                const traverse = (nodes: PermissionMatrixNode[]) => {
                    nodes.forEach(node => {
                        if (node.permissions) {
                            Object.values(node.permissions).forEach(perm => {
                                initialSelected[`${node.menu_id}_${perm.permissionId}`] = perm.is_selected;
                            });
                        }
                        if (node.children && node.children.length > 0) {
                            traverse(node.children);
                        }
                    });
                };

                traverse(matrixData);
                setSelectedPermissions(initialSelected);
            } else {
                messageApi.error(res.error || 'Lỗi khi tải dữ liệu phân quyền');
            }
        } catch (error) {
            messageApi.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (compositeKey: string, checked: boolean) => {
        setSelectedPermissions(prev => ({
            ...prev,
            [compositeKey]: checked
        }));
    };

    const handleSelectAllRow = (record: PermissionMatrixNode, checked: boolean) => {
        const newSelected = { ...selectedPermissions };

        const traverseAndSelect = (node: PermissionMatrixNode) => {
            if (node.permissions) {
                Object.values(node.permissions).forEach(perm => {
                    newSelected[`${node.menu_id}_${perm.permissionId}`] = checked;
                });
            }
            if (node.children) {
                node.children.forEach(traverseAndSelect);
            }
        };

        traverseAndSelect(record);
        setSelectedPermissions(newSelected);
    };

    // Kiểm tra xem tất cả các permission của row (và children) đã được chọn chưa
    const isAllRowSelected = (record: PermissionMatrixNode): boolean => {
        let allSelected = true;
        let hasPermissions = false;

        const traverse = (node: PermissionMatrixNode) => {
            if (node.permissions) {
                const perms = Object.values(node.permissions);
                if (perms.length > 0) {
                    hasPermissions = true;
                    perms.forEach(perm => {
                        if (!selectedPermissions[`${node.menu_id}_${perm.permissionId}`]) {
                            allSelected = false;
                        }
                    });
                }
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };

        traverse(record);
        return hasPermissions && allSelected;
    };

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 70,
            align: 'center',
            render: (text: string, record: any) => {
                if (record.level === 0) {
                    return (
                        <span
                            className="cursor-pointer select-none font-bold text-[#484848]"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleParent(record.menu_id);
                            }}
                        >
                            {text}
                        </span>
                    );
                }
                return <span>{text}</span>;
            }
        },
        {
            title: 'Chức năng',
            dataIndex: 'menuName',
            key: 'menuName',
            width: 770,
            render: (text: string, record: any) => {
                if (record.level === 0) {
                    const isCollapsed = !!collapsedParents[record.menu_id];
                    return (
                        <span
                            className="flex items-center gap-2 font-medium text-[#484848] pl-2 cursor-pointer select-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleParent(record.menu_id);
                            }}
                        >
                            {isCollapsed ? (
                                <RightOutlined className="text-[#484848] text-[10px]" />
                            ) : (
                                <DownOutlined className="text-[#484848] text-[10px]" />
                            )}
                            {text}
                        </span>
                    );
                }
                return <span className="pl-8 text-gray-600">{text}</span>;
            }
        },
        {
            title: 'Tất cả',
            key: 'all',
            width: 80,
            align: 'center',
            render: (_, record) => {
                let hasAnyPermission = false;
                const checkHasPermission = (node: PermissionMatrixNode) => {
                    if (node.permissions && Object.keys(node.permissions).length > 0) {
                        hasAnyPermission = true;
                    }
                    if (node.children) {
                        node.children.forEach(checkHasPermission);
                    }
                };
                checkHasPermission(record);

                if (!hasAnyPermission) return null;

                return (
                    <Checkbox
                        checked={isAllRowSelected(record)}
                        onChange={(e) => handleSelectAllRow(record, e.target.checked)}
                    />
                );
            }
        },
        ...PERMISSION_COLUMNS.map(col => ({
            title: col.label,
            key: col.key,
            width: 80,
            align: 'center' as const,
            render: (_: any, record: any) => {
                if (record.level === 0) return null;
                const perm = record.permissions?.[col.key] || (col.altKey ? record.permissions?.[col.altKey] : undefined);
                if (!perm) return null;

                if ((col.key === 'READ' || col.altKey === 'VIEW') && record.children && record.children.length > 0) {
                    return null;
                }

                const compositeKey = `${record.menu_id}_${perm.permissionId}`;
                return (
                    <Checkbox
                        checked={!!selectedPermissions[compositeKey]}
                        onChange={(e) => handleCheckboxChange(compositeKey, e.target.checked)}
                    />
                );
            }
        }))
    ];

    const handleSubmit = async () => {
        if (!roleId) return;
        setLoading(true);
        try {
            // Chỉ lấy danh sách ID của các quyền đang được tích (is_selected: true)
            const permissionIds: string[] = [];

            Object.keys(selectedPermissions).forEach(compositeKey => {
                if (selectedPermissions[compositeKey]) {
                    const parts = compositeKey.split('_');
                    const permissionId = parts.pop();
                    if (permissionId) {
                        // Thêm vào danh sách và loại bỏ trùng lặp nếu có
                        if (!permissionIds.includes(permissionId)) {
                            permissionIds.push(permissionId);
                        }
                    }
                }
            });

            const res = await syncRolePermissions(roleId, permissionIds);

            if (res.success) {
                messageApi.success('Đồng bộ quyền thành công');
                onClose();
            } else {
                messageApi.error(res.error || 'Đồng bộ quyền thất bại');
            }
        } catch (error) {
            messageApi.error('Có lỗi xảy ra khi đồng bộ quyền');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}

            <Modal
                title={<span style={{ fontSize: 18, fontWeight: 500, color: '#484848' }}>Phân quyền</span>}
                open={open}
                onCancel={onClose}
                width={1500}
                footer={null}
                centered
                className="rounded-[8px]"
                styles={{
                    header: {
                    },
                    mask: { backdropFilter: "blur(0px)" },
                    container: { padding: "20px 40px 30px 40px ", overflowY: 'hidden' }
                }}
            >
                <div className='w-full border-t border-[#c0c0c0] opacity-50 mt-[14px] mb-[20px]'></div>

                <ModalThemeProvider>
                    <Spin spinning={loading}>
                        <style>{`
                            .permission-table .ant-table-thead > tr > th {
                                background-color: #076EB8 !important;
                                color: white !important;
                                font-weight: 400 !important;
                                font-size: 16px !important;
                                padding: 8px 12px !important;
                                border-inline-end: none !important;
                                border-right: none !important;
                            }
                            .permission-table .ant-table-thead > tr > th.ant-table-cell-scrollbar {
                                background-color: #076EB8 !important;
                                box-shadow: none !important;
                            }
                               .permission-table .ant-table-measure-row {
                                display: none !important;
                            }
                            .permission-table .ant-table-thead > tr > th::before {
                                display: none !important;
                            }
                            .permission-table .ant-table-tbody > tr.parent-row {
                                background-color: #EAF6FF !important;
                                font-weight: 500 !important;
                                font-size: 14px !important; 
                            }
                            .permission-table .ant-table-tbody > tr.parent-row td {
                                background-color: #EAF6FF !important;
                                border-inline-end: none !important;
                                border-right: none !important;
                            }
                            .permission-table .ant-table-tbody > tr > td {
                                padding: 6px 12px !important;
                                vertical-align: middle !important;
                            }
                        `}</style>
                        <Table
                            columns={columns}
                            dataSource={getVisibleData()}
                            rowKey="menu_id"
                            pagination={false}
                            bordered
                            scroll={{ x: 1200, y: 'calc(100vh - 400px)' }}
                            size="small"
                            className="permission-table"
                            rowClassName={(record) => record.level === 0 ? 'parent-row' : ''}
                            childrenColumnName="non_existent_children"// bỏ dấu + dư thừa của ant
                        />

                        <div className="flex justify-center gap-[20px] mt-[24px]  items-center ">
                            <Button
                                onClick={onClose}
                                disabled={loading}
                                className="w-[80px] h-[30px]"
                                style={{ borderRadius: '20px', borderColor: '#a1a1a1', color: '#a1a1a1', backgroundColor: "white" }}
                            >
                                Quay lại
                            </Button>
                            <Button
                                type="primary"
                                loading={loading}
                                disabled={loading}
                                onClick={handleSubmit}
                                className="w-[80px] h-[30px]"
                                style={{
                                    backgroundColor: loading ? "#f5f5f5" : '#076eb8',
                                    borderColor: loading ? "#d9d9d9" : '#076eb8',
                                    color: loading ? "rgba(0, 0, 0, 0.25)" : "white",
                                    borderRadius: '20px'
                                }}
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </Spin>
                </ModalThemeProvider>
            </Modal>
        </>
    );
}
