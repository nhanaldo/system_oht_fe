import { Space, Tooltip } from "antd";
import Image from "next/image";
import { UnitType } from "@/types/unit-type";
import type { ColumnsType } from "antd/es/table";

export const getUnitTypesColumns = (
    onDelete?: (id: string) => void,
    onEdit?: (unitType: UnitType) => void,
): ColumnsType<UnitType> => [
        {
            title: 'STT',
            key: 'index',
            width: 80,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            width: 500,
            render: (text: string) => (
                <span style={{ fontWeight: 400, color: '#484848' }}>{text || ''}</span>
            ),
            onHeaderCell: () => ({ style: { textAlign: 'center' } })
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            width: 400,
            key: 'description',
            render: (text: string, record: UnitType) => text || record.discripsion || '',
            onHeaderCell: () => ({ style: { textAlign: 'center' } })
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_: any, record: UnitType) => (
                <Space size="middle">
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
