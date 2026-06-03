import { Space, Tooltip } from "antd";
import Image from "next/image";
import { ZoneType } from "@/types/zone-type";
import type { ColumnsType } from "antd/es/table";

export const getColumns = (
    onEdit?: (record: ZoneType) => void,
    onDelete?: (id: string) => void
): ColumnsType<ZoneType> => [
        {
            title: 'STT',
            key: 'index',
            width: 80,
            className: 'stt-column',
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Mã loại khu vực',
            dataIndex: 'code',
            key: 'code',
            width: 550,
            align: 'center',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (text: string) => text || '',
        },
        {
            title: 'Tên loại khu vực',
            dataIndex: 'name',
            key: 'name',
            width: 550,
            align: 'center',
            onCell: () => ({ style: { paddingLeft: '10px' } }),
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (text: string) => text || '',
        },
        // {
        //     title: 'Mô tả',
        //     dataIndex: 'description',
        //     key: 'description',
        //     align: 'center',
        //     onCell: () => ({ style: { paddingLeft: '10px' } }),
        //     onHeaderCell: () => ({ style: { textAlign: 'center' } }),
        //     render: (text: string) => text || '',
        // },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 161,
            render: (_: any, record: ZoneType) => (
                <Space size={12} style={{}}>
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
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={17.14}
                            height={17.86}
                            style={{ width: '17.14px', height: '17.86px', flexShrink: 0 }}
                            onClick={() => onDelete && onDelete(record.id)}
                            className="cursor-pointer hover:opacity-80 transition-opacity "
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];
