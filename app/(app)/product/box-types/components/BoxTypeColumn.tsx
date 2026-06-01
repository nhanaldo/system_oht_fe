import { ColumnsType } from 'antd/es/table';
import { Space, Tooltip } from 'antd';
import Image from 'next/image';
import { BoxType } from '@/types/box-type';

export const getBoxTypesColumns = (
    onDelete?: (id: string) => void,
    onEdit?: (boxType: BoxType) => void,
): ColumnsType<BoxType> => [
        {
            title: 'STT',
            key: 'index',
            width: 80,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Loại thùng',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (text: string) => (
                <span style={{ fontWeight: 400, color: '#484848' }}>{text || ''}</span>
            ),
        },
        {
            title: 'Kích thước (mm)',
            dataIndex: 'dimensions',
            key: 'dimensions',
            width: 200,
            render: (text: string) => text || '',
        },
        {
            title: 'Trọng lượng vỏ thùng(kg)',
            dataIndex: 'tare_weight',
            key: 'tare_weight',
            width: 220,
            render: (val: any) => (val !== undefined && val !== null ? String(val) : ''),
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit_of_measure_name',
            key: 'unit_of_measure_name',
            width: 300,
            render: (text: string) => text || 'Thùng/Carton',
        },
        {
            title: 'Chất liệu',
            dataIndex: 'material',
            key: 'material',
            width: 220,
            render: (text: string) => text || '',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_: any, record: BoxType) => (
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
