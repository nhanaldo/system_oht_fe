import { Tooltip, Space } from "antd";
import { ColumnTableProps } from "@/types/common";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface GetColumnsProps extends ColumnTableProps {
    router: any;
    onView?: (record: any) => void;
}
export const getColumns = ({ onDelete, onEdit, onView, router }: GetColumnsProps) => [
    {
        title: "STT",
        dataIndex: "stt",
        width: 71,
        key: "stt",
        className: "text-center",
        render: (_: any, record: any, index: number) => <span>{index + 1}</span>,
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },

    {
        title: "Kho",
        dataIndex: "code",
        className: "text-center",
        key: "code",
        width: 363,
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },
    {
        title: "Loại kho",
        dataIndex: "name",
        className: "text-center",
        key: "name",
        width: 300,
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },
    {
        title: "Tầng",
        dataIndex: "number_floor",
        key: "number_floor",
        width: 154,
        className: "text-center",
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },
    {
        title: "Tổng vị trí",
        dataIndex: "positionCount",
        key: "positionCount",
        width: 232,
        className: "text-center",
        render: (_: any, record: any) =>
            <div className="flex justify-center items-center">
                {record.row * record.column}
            </div>,
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 219,
        className: "text-center",
        render: (text: string) => {
            const s = (text || "").toLowerCase();
            let bgClass;
            let textClass;
            let label;
            if (s === "new" || s === "created") {
                bgClass = "bg-[#D2E9ff]";
                textClass = "text-[#0661B7]";
                label = "Mới tạo";
            } else if (s === "inactive") {
                bgClass = "bg-[#E2E8F0]";
                textClass = "text-[#5F5D5D]";
                label = "Không sử dụng";
            } else if (s === "active") {
                bgClass = "bg-[#D2FFDB]";
                textClass = "text-[#009130]";
                label = "Đang sử dụng";
            } else if (text) {
                label = text;
            }

            return (
                <div className="flex justify-center items-center">
                    <div className={`w-fit h-[26px] pt-[4px] px-[10px] py-[2px] ${bgClass} ${textClass} rounded-[20px] text-[12px] font-medium`}>
                        {label}
                    </div>
                </div>
            );
        },
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },

    {
        title: "Hành động",
        key: "action",
        align: "center",
        width: 145,
        render: (_: any, record: any) => (
            <Space size={10}>
                <Tooltip title="Xem thông tin">
                    <Image
                        src="/icon.svg/look.svg"
                        alt="Xem thông tin"
                        width={18}
                        height={18}
                        style={{ width: '18px', height: '18px', flexShrink: 0 }}
                        onClick={() => router.push(`/warehouse/${record.id}/view?name=${record.name}&rows=${record.row}&columns=${record.column}&modules=${record.number_tower}&floors=${record.number_floor}`)}    
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </Tooltip>
                <Tooltip title="Chỉnh sửa">
                    <Image
                        src="/icon.svg/edit.svg"
                        alt="Chỉnh sửa"
                        width={18}
                        height={18}
                        style={{ width: '18px', height: '18px', flexShrink: 0 }}
                        onClick={() => onEdit?.(record)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </Tooltip>
                <Tooltip title="Cấu hình">
                    <Image
                        src="/icon.svg/pig.svg"
                        alt="Cấu hình"
                        width={18.93}
                        height={20}
                        style={{ width: '18.93px', height: '20px', flexShrink: 0 }}
                        onClick={() => router.push(`/warehouse/${record.id}?name=${record.name}&rows=${record.row}&columns=${record.column}&modules=${record.number_tower}&floors=${record.number_floor}`)}
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
                        onClick={() => onDelete?.(record)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </Tooltip>
            </Space>
        ),
    },
];
