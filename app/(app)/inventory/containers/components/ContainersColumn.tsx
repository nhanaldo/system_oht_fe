import { Space, Tooltip } from "antd";
import Image from "next/image";
import { Container } from "@/types/container";
import type { ColumnsType } from "antd/es/table";

const parseMetadata = (metadata: any) => {
    if (!metadata) return {};
    if (typeof metadata === "object") return metadata;
    try {
        return JSON.parse(metadata);
    } catch (e) {
        return {};
    }
};

export const getContainersColumns = (
    onDelete?: (id: string) => void,
    onEdit?: (container: Container) => void,
): ColumnsType<Container> => [

        {
            title: 'STT',
            key: 'index',
            width: 80,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Mã loại pallet',
            dataIndex: 'code',
            key: 'code',
            width: 250,
            render: (text: string) => (
                <span style={{ fontWeight: 400, color: '#484848' }}>{text || ''}</span>
            ),
        },
        {
            title: 'Tên loại pallet',
            dataIndex: 'container_type',
            key: 'container_type',
            width: 170,
            render: (text: string) => text || '',
        },
        {
            title: 'Dài',
            key: 'index',
            width: 100,
            render: () => '',
            align: 'center',
        },
        {
            title: 'Rộng',
            key: 'index',
            width: 100,
            render: () => '',
            align: 'center',
        },
        {
            title: 'Cao',
            key: 'index',
            width: 100,
            render: () => '',
            align: 'center',
        },
        {
            title: 'Tải trọng (kg)',
            dataIndex: 'status',
            key: 'status',
            width: 250,
            render: (text: string) => text || '',
        },
        {
            title: 'Mô Tả',
            dataIndex: 'qr_code',
            key: 'qr_code',
            width: 200,
            render: (text: string) => text || '',
        },

        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_: any, record: Container) => (
                <Space size="middle" style={{ gap: '10px' }}>
                    <Tooltip title="Thêm pallet con">
                        <Image
                            src="/icon.svg/addmu.svg"
                            alt="Thêm pallet con"
                            width={25}
                            height={20}
                            onClick={() => onEdit && onEdit(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity max-w-[25px] max-h-[20px]"
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
