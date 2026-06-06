"use client";

import React, { useState, useEffect } from "react";
import { Table, ConfigProvider } from "antd";
import type { TableProps } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { OverlayScrollbars } from "overlayscrollbars";

export const useStyle = createStyles(({ css }: any) => ({
    customTable: css`
    /* Đảm bảo table luôn rộng ít nhất 100% container để không bị nhỏ từ đầu */
    .ant-table table {
      min-width: 100% !important;
    }

    /* Đè cấu hình scrollbar-color mặc định của Ant Design */
    .ant-table,
    .ant-table-container,
    .ant-table-body,
    .ant-table-content {
      scrollbar-color: unset !important;
    }

    /* Tùy chỉnh các lớp của OverlayScrollbars bên trong bảng */
    .os-scrollbar {
      padding: 0 !important;
    }

    .os-scrollbar-vertical {
      right: 0 !important;
      width: 8px !important;
    }

    .os-scrollbar-horizontal {
      bottom: 0 !important;
      height: 8px !important;
    }

    .os-scrollbar-vertical .os-scrollbar-handle {
      width: 8px !important;
    }

    .os-scrollbar-horizontal .os-scrollbar-handle {
      height: 8px !important;
    }

    .os-scrollbar-handle {
      background-color: #d9d9d9 !important;
      border-radius: 4px !important;
    }
  `,
}));

interface CustomTableProps<T> extends TableProps<T> {
    dataTable?: T[];
    keyIndex?: string;
    heightTable?: number | string;
    children?: React.ReactNode;
}

export default function CustomTable<T extends object>({
    dataTable = [],
    keyIndex = 'id',
    heightTable,
    children,
    ...rest
}: CustomTableProps<T>) {
    const { styles } = useStyle();
    const [mounted, setMounted] = useState(false);
    const tableRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !tableRef.current) return;

        const antTableBody = tableRef.current.querySelector('.ant-table-body');
        const antTableContent = tableRef.current.querySelector('.ant-table-content');
        const scrollEl = antTableBody || antTableContent;

        if (scrollEl) {
            const osInstance = OverlayScrollbars(scrollEl as HTMLElement, {
                scrollbars: {
                    theme: 'os-theme-dark os-theme-hover',
                    visibility: 'auto',
                    autoHide: 'leave',
                    autoHideDelay: 500, // Đợi đúng 5 giây
                }
            });

            const viewport = osInstance.elements().viewport;
            const handleScroll = () => {
                const antTableHeader = tableRef.current?.querySelector('.ant-table-header');
                if (antTableHeader) {
                    antTableHeader.scrollLeft = viewport.scrollLeft;
                }
            };

            viewport.addEventListener('scroll', handleScroll);

            return () => {
                viewport.removeEventListener('scroll', handleScroll);
                if (osInstance && osInstance.destroy) {
                    osInstance.destroy();
                }
            };
        }
    }, [mounted, dataTable]);

    if (!mounted) return null;

    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        cellPaddingBlock: 0,
                        cellPaddingBlockMD: 0,
                        cellPaddingBlockSM: 0,
                        headerBg: '#076EB8',
                        headerColor: '#ffffff',
                        headerSplitColor: 'transparent',
                        headerSortActiveBg: '#0560a0',
                        headerSortHoverBg: '#0560a0',
                        fixedHeaderSortActiveBg: '#0560a0',
                    }
                }
            }}
        >
            <div ref={tableRef} className="w-full h-full">
                {children ? (
                    children
                ) : (
                    <Table
                        className={`fixed-layout-table ${styles.customTable}`}
                        dataSource={dataTable.map((item: any, index: number) => ({
                            ...item,
                            key: item[keyIndex] || item._id || index
                        }))}
                        locale={{ emptyText: "Không có dữ liệu" }}
                        scroll={{ x: 'max-content', y: heightTable || 'calc(100vh - 355px)' }}
                        tableLayout="fixed"
                        sticky
                        {...rest}
                        pagination={rest.pagination === false ? false : {
                            pageSize: 20,
                            className: 'h-[32px] !p-0 !mt-[10px] ',
                            showSizeChanger: false,
                            showTotal: (total) => `Hiển thị 20 trong tổng ${total}`,
                            placement: ['bottomEnd'] as const,
                            ...rest.pagination,
                        }}
                        expandable={{
                            expandIcon: ({ expanded, onExpand, record, expandable }) => {
                                if (!expandable) return <span style={{ height: 0, lineHeight: 0, verticalAlign: 'middle', visibility: 'hidden' }} />;
                                return expanded ? (
                                    <DownOutlined
                                        className="mr-2 cursor-pointer text-[#8C8C8C] text-[12px]"
                                        onClick={e => onExpand(record, e)}
                                    />
                                ) : (
                                    <RightOutlined
                                        className="mr-2 cursor-pointer text-[#8C8C8C] text-[12px]"
                                        onClick={e => onExpand(record, e)}
                                    />
                                );
                            },
                            ...(rest.expandable || {})
                        }}
                    />
                )}
            </div>
        </ConfigProvider>
    );
}
