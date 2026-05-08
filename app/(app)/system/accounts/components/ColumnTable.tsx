import { useState, useEffect } from "react";
import { Space, Button, Tooltip, Switch } from "antd";
import Image from "next/image";
import { Account } from "@/types/account";
import type { ColumnsType } from "antd/es/table";

function StatusSwitch({
    active,
    record,
    onToggleStatus
}: {
    active: boolean;
    record: Account;
    onToggleStatus?: (
        record: Account,
        checked: boolean,
        startLoading: () => void,
        stopLoading: () => void
    ) => Promise<boolean>;
}) {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(active);

    useEffect(() => {
        setChecked(active);
    }, [active]);

    const handleChange = async (newVal: boolean) => {
        if (!onToggleStatus) return;

        const startLoading = () => setLoading(true);
        const stopLoading = () => setLoading(false);

        const success = await onToggleStatus(record, newVal, startLoading, stopLoading);
        if (success) {
            setChecked(newVal);
        }
    };

    return (
        <Switch
            checked={checked}
            loading={loading}
            onChange={handleChange}
        />
    );
}

export const getColumns = (
    onEdit?: (record: Account) => void,
    onConfigWarehouse?: (record: Account) => void,
    onDelete?: (id: string) => void,
    onToggleStatus?: (
        record: Account,
        checked: boolean,
        startLoading: () => void,
        stopLoading: () => void
    ) => Promise<boolean>,
    warehouseOptions?: { label: string, value: string }[],
    onResetPassword?: (id: string) => void
): ColumnsType<Account> => [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => text || '',
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
            render: (text: string) => text || '',
        },
        {
            title: 'Mã nhân viên',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => text || '',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text: string) => text || '',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role_names',
            key: 'role_names',
            align: 'center',
            render: (roles: string[] | string) => {
                if (!roles || (Array.isArray(roles) && roles.length === 0)) return '';
                const roleArray = Array.isArray(roles) ? roles : [roles];
                return (
                    <Space size={[0, 4]} wrap>
                        {roleArray.map((role, idx) => {
                            const isAdmin = role.toLowerCase().includes('admin');
                            return (
                                <span key={idx} style={{
                                    color: isAdmin ? '#1849D6' : '#148634',
                                    backgroundColor: isAdmin ? '#D2DDFF' : '#DBFFE5',
                                    padding: '2px 14px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    fontFamily: 'roboto',
                                    lineHeight: '100%',
                                    border: `1px solid ${isAdmin ? '#91caff' : '#b7eb8f'}`,
                                }}>
                                    {role}
                                </span>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: 'Kho',
            dataIndex: 'warehouse_ids',
            key: 'warehouse_ids',
            render: (warehouses: string[] | string, record: Account) => {
                if (record.warehouse_names && record.warehouse_names.length > 0) {
                    return record.warehouse_names.join(', ');
                }
                if (!warehouses || (Array.isArray(warehouses) && warehouses.length === 0)) return '';
                const whArray = Array.isArray(warehouses) ? warehouses : [warehouses];
                if (warehouseOptions && warehouseOptions.length > 0) {
                    const names = whArray.map(id => {
                        const found = warehouseOptions.find(opt => opt.value === id);
                        return found ? found.label : id;
                    });
                    return names.join(', ');
                }
                return whArray.join(', ');
            },
        },
        {
            title: 'Kích hoạt',
            dataIndex: 'is_active',
            key: 'is_active',
            align: 'center',
            render: (active: boolean, record: Account) => (
                <StatusSwitch
                    active={active}
                    record={record}
                    onToggleStatus={onToggleStatus}
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 140,
            align: 'center',
            render: (_: any, record: Account) => (
                <Space size={16}>
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={24}
                            height={24}
                            onClick={() => onEdit && onEdit(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Cấu hình kho sử dụng">
                        <Image
                            src="/icon.svg/Vector.svg"
                            alt="Cấu hình kho sử dụng"
                            width={20}
                            height={20}
                            onClick={() => onConfigWarehouse && onConfigWarehouse(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Reset mật khẩu">
                        <Image
                            src="/icon.svg/resetbassword.svg"
                            alt="Reset mật khẩu"
                            width={20}
                            height={20}
                            onClick={() => onResetPassword && onResetPassword(record.id as string)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={20}
                            height={20}
                            onClick={() => onDelete && onDelete(record.id as string)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];
