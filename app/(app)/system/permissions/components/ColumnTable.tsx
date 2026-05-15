import { Space, Tooltip } from "antd";
import Image from "next/image";
import DynamicIcon from "@/components/ui/DynamicIcon";
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
            align: "left" as const,
            onCell: () => ({
                style: { paddingLeft: 0, paddingRight: 0 }
            }),
            onHeaderCell: () => ({
                style: { paddingLeft: 0, paddingRight: 0 }
            }),
        },
        {
            title: "Tên chức năng",
            dataIndex: "name",
            className: "text-left",
            key: "name",
            width: 300,
            render: (text: string) => text || "",
            onHeaderCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Icon",
            dataIndex: "icon",
            key: "icon",
            width: 150,
            className: "text-center",
            onHeaderCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Đường dẫn",
            dataIndex: "path",
            key: "path",
            width: 300,
            className: "text-center ",
            render: (text: string) => text || "",
            onHeaderCell: () => ({
                style: {
                    textAlign: 'center',
                },
            }),
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
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
