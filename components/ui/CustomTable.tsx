"use client";

import { Table, ConfigProvider } from "antd";
import type { TableProps } from "antd";

interface CustomTableProps<T> extends TableProps<T> {
    dataTable: T[];
    keyIndex?: string;
}

export default function CustomTable<T extends object>({
    dataTable,
    keyIndex = 'id',
    ...rest
}: CustomTableProps<T>) {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerBg: '#076EB8',
                        headerColor: '#FFFFFF',
                        headerBorderRadius: 8,
                    }
                }
            }}
        >
            <style>{`
                .ant-table-wrapper .ant-table-container {
                
                }
                .ant-table-wrapper .ant-table-container,
                .ant-table-wrapper .ant-table-content {
                    overflow: visible !important;
                }
                .ant-table-wrapper .ant-table-thead {
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 10 !important;
                }
                .ant-table-wrapper .ant-table-thead > tr > th { 
                    font-weight: 400 !important;
                    font-family: 'roboto' !important;
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 10 !important;
                    background-color: #076EB8 !important;
                    text-align: center !important;
                    padding: 8px 12px !important;
                    vertical-align: middle !important;
                }
                .ant-table-wrapper .ant-table-thead > tr > th::before {
                    display: none !important;
                }
                .ant-table-wrapper .ant-table-tbody > tr > td {
                    color: #484848 !important;
                    font-size: 14px !important;
                    font-family: 'roboto' !important;
                    font-weight: 400 !important;
                    line-height: 1.5 !important;   
                    padding: 4px 12px !important;
                    vertical-align: middle !important;
                }
                .ant-table-wrapper .ant-table-tbody > tr.ant-table-row-selected > td {
                    background: #ffffff !important;
                }
                .ant-table-wrapper .ant-table-tbody > tr.ant-table-row-selected:hover > td {
                    background: #f5f5f5 !important;
                }
                .ant-table-wrapper .ant-table-measure-row {
                    display: none !important;
                }
                /* Căn lề: dồn tổng số bản ghi sang trái, cụm phân trang sang phải */
                .ant-table-wrapper .ant-pagination {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-end !important;
                    position: sticky !important;
                    bottom: 0 !important;
                    z-index: 10 !important;
                    background-color: #ffffff !important;
                    margin: 0 !important;
                    padding: 12px 16px !important;
                    border-top: 1px solid #f0f0f0 !important;
                }
                .ant-table-wrapper .ant-pagination-total-text {
                    margin-right: auto !important;
                    font-size: 14px !important;
                    color: #404040 !important;
                    font-family: 'roboto' !important;
                }
                /* Tạo viền ô vuông xám cho nút Prev và Next giống các nút số */
                .ant-table-wrapper .ant-pagination-prev .ant-pagination-item-link,
                .ant-table-wrapper .ant-pagination-next .ant-pagination-item-link,
                .ant-table-wrapper .ant-pagination-item {
                    border: 1px solid #d9d9d9 !important;
                    font-size: 14px !important;
                    font-family: 'roboto' !important;
                    font-weight: 400 !important;
                    line-height: 100% !important;  
                    border-radius: 6px !important;
                    background-color: #ffffff !important;
                    min-width: 34px !important;
                    height: 34px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.3s !important;
                }
                /* Trạng thái Active */
                .ant-table-wrapper .ant-pagination-item-active {
                    border-color: #076EB8 !important;
                    background-color: #ffffff !important;
                }
                .ant-table-wrapper .ant-pagination-item-active a {
                    color: #076EB8 !important;
                    font-weight: 500 !important;
                }
                /* Trạng thái Hover */
                .ant-table-wrapper .ant-pagination-prev:not(.ant-pagination-disabled):hover .ant-pagination-item-link,
                .ant-table-wrapper .ant-pagination-next:not(.ant-pagination-disabled):hover .ant-pagination-item-link,
                .ant-table-wrapper .ant-pagination-item:not(.ant-pagination-item-active):hover {
                    border-color: #076EB8 !important;
                }
                .ant-table-wrapper .ant-pagination-item:not(.ant-pagination-item-active):hover a {
                    color: #076EB8 !important;
                }
                /* Khi bị disabled */
                .ant-table-wrapper .ant-pagination-disabled .ant-pagination-item-link {
                    color: rgba(0, 0, 0, 0.25) !important;
                    border-color: #d9d9d9 !important;
                    background-color: #ffffff !important;
                }
            `}</style>
            <Table
                dataSource={dataTable.map((item: any, index: number) => ({
                    ...item,
                    key: item[keyIndex] || item._id || index
                }))}
                pagination={{
                    pageSize: 20,
                    showSizeChanger: false,
                    showTotal: (total) => `Hiển thị 20 trong tổng số ${total} bản ghi`,
                    placement: 'bottomRight' as any
                }}
                locale={{ emptyText: "Không có dữ liệu" }}
                scroll={{ x: 'max-content' }}
                {...rest}
            />
        </ConfigProvider>
    );
}
