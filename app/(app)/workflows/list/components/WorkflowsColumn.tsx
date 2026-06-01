import { Space, Tooltip, Switch, ConfigProvider } from "antd";
import Image from "next/image";
import { Workflow } from "@/types/workflow";
import type { ColumnsType } from "antd/es/table";

export const getWorkflowsColumns = (
    onDelete?: (id: string | string[]) => void,
    onEdit?: (workflow: Workflow) => void,
    onToggleStatus?: (id: string, isActive: boolean) => void,
    onSetup?: (id: string) => void,
): ColumnsType<Workflow> => [
        {
            title: 'STT',
            key: 'index',
            width: 100,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Quy trình',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text: string) => (
                <span style={{ fontWeight: 400, color: '#484848' }}>{text}</span>
            ),
        },
        {
            title: 'Loại quy trình',
            dataIndex: 'code',
            key: 'code',
            width: 250,
            render: (text: string) => text || '',
            align: 'center',
        },
        {
            title: 'Số bước',
            dataIndex: 'total_steps',
            key: 'total_steps',
            width: 150,
            render: (text: string) => text || '',
            align: 'left',
            onHeaderCell: () => ({
                style: {
                    textAlign: 'left',
                },
            }),

        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            width: 500,
            key: 'description',
            render: (text: string) => text || '',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            align: 'center',
            render: (isActive: boolean, record: Workflow) => (
                <ConfigProvider
                    theme={{
                        components: {
                            Switch: {
                                trackMinWidth: 40,
                            }
                        }
                    }}
                >
                    <Switch
                        checked={isActive}
                        style={{ backgroundColor: isActive ? '#1890FF' : undefined }}
                        onChange={(checked) => onToggleStatus && onToggleStatus(record.id, checked)}
                    />
                </ConfigProvider>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 160,
            render: (_: any, record: Workflow) => (
                <Space size="middle">
                    <Tooltip title="Thiết lập quy trình">
                        <Image
                            src="/icon.svg/Vector.svg"
                            alt="Thiết lập"
                            width={18}
                            height={18}
                            onClick={() => onSetup && onSetup(record.id)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={18}
                            height={18}
                            onClick={() => onEdit && onEdit(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={20}
                            height={20}
                            onClick={() => onDelete && onDelete(record.id)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
            align: 'center',
        },
    ];
