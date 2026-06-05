import { useState, useEffect } from "react";
import { Space, Tooltip, Switch, ConfigProvider } from "antd";
import Image from "next/image";
import { Account } from "@/types/account";
import type { ColumnsType } from "antd/es/table";

function StatusSwitch({
    active,
    record,
    onToggleStatus,
    width = 40,
    height = 20
}: {
    active: boolean;
    record: Account;
    width?: number;
    height?: number;
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

    const handleChange = async () => {
        if (!onToggleStatus || loading) return;

        const startLoading = () => setLoading(true);
        const stopLoading = () => setLoading(false);

        const newVal = !checked;
        const success = await onToggleStatus(record, newVal, startLoading, stopLoading);
        if (success) {
            setChecked(newVal);
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Switch: {
                        trackMinWidth: width,
                        trackHeight: height,
                        handleSize: height - 4,
                    }
                }
            }}
        >
            <Switch
                checked={checked}
                loading={loading}
                onChange={handleChange}
                style={{ backgroundColor: checked ? '#1890FF' : undefined }}
            />
        </ConfigProvider>
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
            width: 80,
            className: 'stt-column',
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            width: 220,
            align: 'left',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (text: string) => text || '',
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
            width: 180,
            align: 'left',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (text: string) => text || '',
        },
        {
            title: 'Mã nhân viên',
            dataIndex: 'code',
            key: 'code',
            width: 152,
            align: 'center',
            render: (text: string) => text || '',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250,
            align: 'left',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (text: string) => text || '',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role_names',
            key: 'role_names',
            align: 'center',
            width: 134,
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
                                    padding: '5px 10px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    fontFamily: 'roboto',
                                    lineHeight: '100%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '26px'

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
            align: 'left',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            width: 247,
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
            width: 109,
            render: (active: boolean, record: Account) => (
                <StatusSwitch
                    active={active}
                    record={record}
                    onToggleStatus={onToggleStatus}
                    width={40}
                    height={20}
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 140,
            render: (_: any, record: Account) => (
                <Space >
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={18}
                            height={18}
                            style={{ width: '18px', height: '18px', flexShrink: 0 }}
                            onClick={() => onEdit && onEdit(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Cấu hình kho sử dụng">
                        <Image
                            src="/icon.svg/Vector.svg"
                            alt="Cấu hình kho sử dụng"
                            width={18.93}
                            height={20}
                            style={{ width: '18.93px', height: '20px', flexShrink: 0 }}
                            onClick={() => onConfigWarehouse && onConfigWarehouse(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Reset mật khẩu">
                        <Image
                            src="/icon.svg/resetbassword.svg"
                            alt="Reset mật khẩu"
                            width={18.93}
                            height={20}
                            style={{ width: '18.93px', height: '20px', flexShrink: 0 }}
                            onClick={() => onResetPassword && onResetPassword(record.id as string)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={17.14}
                            height={17.86}
                            style={{ width: '17.14px', height: '17.86px', flexShrink: 0 }}
                            onClick={() => onDelete && onDelete(record.id as string)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];
