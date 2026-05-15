"use client";

import React, { useState, useEffect } from "react";
import { Table, ConfigProvider } from "antd";
import type { TableProps } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { useOverlayScrollbars } from "overlayscrollbars-react";

export const useStyle = createStyles(({ css }: any) => ({
    customTable: css`
    /* Ẩn thanh cuộn mặc định của Ant Design */
    .ant-table-body::-webkit-scrollbar,
    .ant-table-content::-webkit-scrollbar,
    .ant-table-header::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    .ant-table-body,
    .ant-table-content {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
      overflow: auto !important;
    }

    /* Loại bỏ vết mờ (shadow) khi có cột cố định hoặc cuộn ngang */
    // .ant-table-ping-right:after,
    // .ant-table-ping-left:before,
    // .ant-table-cell-fix-right-first::after,
    // .ant-table-cell-fix-left-last::after {
    //   box-shadow: none !important;
    // }
  `,
}));

interface CustomTableProps<T> extends TableProps<T> {
    dataTable: T[];
    keyIndex?: string;
    heightTable?: number | string;
}

export default function CustomTable<T extends object>({
    dataTable,
    keyIndex = 'id',
    heightTable,
    ...rest
}: CustomTableProps<T>) {
    const { styles } = useStyle();
    const [mounted, setMounted] = useState(false);
    const tableRef = React.useRef<HTMLDivElement>(null); // scroll table 

    const [initialize, instance] = useOverlayScrollbars({
        options: {
            scrollbars: {
                autoHide: 'leave',// horver thì hiển thị scroll 
                autoHideDelay: 500,// khoảng thời gian chớ khi ẩn hoặc hiện 
            },
        },
        events: {
            scroll: (inst) => {
                const { viewport } = inst.elements();
                if (tableRef.current) {
                    const tableHeader = tableRef.current.querySelector('.ant-table-header');
                    if (tableHeader) {
                        tableHeader.scrollLeft = viewport.scrollLeft;// đồng bộ cuộn cả header 

                    }
                }
            }
        },
        defer: true,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && tableRef.current) {
            const tableBody = tableRef.current.querySelector('.ant-table-body');
            if (tableBody) {
                initialize({
                    target: tableBody as HTMLElement,
                    cancel: {
                        nativeScrollbarsOverlaid: true,
                    }
                });
            }
        }
    }, [mounted, initialize, dataTable]);

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
            <div ref={tableRef} className="w-full">
                <Table
                    className={`fixed-layout-table ${styles.customTable}`}
                    dataSource={dataTable.map((item: any, index: number) => ({
                        ...item,
                        key: item[keyIndex] || item._id || index
                    }))}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: false,
                        showTotal: (total) => `Hiển thị 20 trong tổng ${total}`,
                        placement: ['bottomRight'] as any,
                    }}
                    locale={{ emptyText: "Không có dữ liệu" }}
                    scroll={{ x: 'max-content', y: heightTable || 'calc(100vh - 355px)' }}
                    tableLayout="fixed"
                    sticky
                    {...rest}
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
                        expandIconColumnIndex: rest.expandable?.expandIconColumnIndex ?? (rest.rowSelection ? 1 : 0),
                        ...(rest.expandable || {})
                    }}
                />
            </div>
        </ConfigProvider>
    );
}
