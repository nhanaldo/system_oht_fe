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
        title: "Mã kho",
        dataIndex: "Code",
        className: "text-center",
        key: "Code",
        width: 363,
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },
    {
        title: "Tên kho",
        dataIndex: "Name",
        className: "text-center",
        key: "Name",
        width: 300,
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },

    {
        title: "Tổng vị trí",
        dataIndex: "TotalPositions",
        key: "TotalPositions",
        width: 232,
        className: "text-center",
        onHeaderCell: () => ({
            style: {
                textAlign: "center",
            },
        }),
    },
    {
        title: "Trạng thái",
        dataIndex: "Status",
        key: "Status",
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
            } else if (s === "maintenance") {
                bgClass = "bg-[#FFEFD2]";
                textClass = "text-[#B57600]";
                label = "Đang bảo trì";
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
        render: (_: any, record: any) => {
            const s = (record.Status || "").toLowerCase();
            const isActive = s === "active";
            const isMaintenance = s === "maintenance";

            return (
                <Space size={10}>
                    <Tooltip title="Xem thông tin">
                        <Image
                            src="/icon.svg/look.svg"
                            alt="Xem thông tin"
                            width={18}
                            height={18}
                            style={{ width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
                            onClick={() => {
                                router.push(`/warehouse/${record.ID}/view?name=${record.Name}&rows=${record.Row}&columns=${record.Column}&modules=${record.number_tower}&floors=${record.number_floor}`);
                            }}
                            className="hover:opacity-80 transition-opacity"
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
                            style={{ width: '18.93px', height: '20px', flexShrink: 0, opacity: isActive ? 0.3 : 1, cursor: isActive ? 'not-allowed' : 'pointer' }}
                            onClick={() => {
                                if (!isActive) router.push(`/warehouse/${record.ID}?name=${record.Name}&rows=${record.Row}&columns=${record.Column}`);
                            }}
                            className={isActive ? "" : "hover:opacity-80 transition-opacity"}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={17.14}
                            height={17.86}
                            style={{ width: '17.14px', height: '17.86px', flexShrink: 0, opacity: isActive || isMaintenance ? 0.3 : 1, cursor: isActive || isMaintenance ? 'not-allowed' : 'pointer' }}
                            onClick={() => {
                                if (!isActive && !isMaintenance) onDelete?.(record);
                            }}
                            className={isActive || isMaintenance ? "" : "hover:opacity-80 transition-opacity"}
                        />
                    </Tooltip>
                </Space>
            );
        },
    },
];
