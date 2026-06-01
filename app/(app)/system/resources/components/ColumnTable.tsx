import { Space, Tooltip } from "antd";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";

export const getColumns = (
    onEdit?: (record: any) => void,
    onDelete?: (id: string) => void
): ColumnsType<any> => [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 100,
            align: "center" as const,
        },
        {
            title: "Resource",
            dataIndex: "name",
            key: "name",
            width: 500,
            className: "text-left",
            onHeaderCell: () => ({
                style: { textAlign: 'left' },
            }),
            render: (text: string) => text || "",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: 550,
            className: "text-left",
            onHeaderCell: () => ({
                style: { textAlign: 'left' },
            }),
            render: (text: string) => text || "",
        },
        {
            title: "Hành động",
            key: "action",
            width: 160,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Space size={16}>
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={20}
                            height={20}
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
        },
    ];
