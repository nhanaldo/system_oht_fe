'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Input, Space, ConfigProvider, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import CustomTable from '@/components/ui/CustomTable';
import ModalConfirmDelete from '@/components/ui/ModalConfirmDelete';
import { useTableQuery } from '@/hook/useTableQuery';
import { getProducts, deleteProduct, updateProductStatus } from '../listAction';
import ModalAddProduct from './ModalAddProduct';
import { getProductColumns } from './ProductColumn';
import { ProductTableProps, ProductItem } from '@/types/product';
import ModalThemeProvider from '@/components/ui/ModalThemeProvider';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

export default function ProductTable({ warehouseId, categoryOptions, uomOptions, methodOptions, raw = [] }: ProductTableProps) {
    const { showSuccess, showError } = useToast();
    const router = useRouter();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [specificationFilter, setSpecificationFilter] = useState<string>('all'); // Quy cách

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ProductItem | null>(null);

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        content: string;
        onConfirm: () => Promise<void> | void;
        onCancel?: () => void;
        loading: boolean;
    }>({
        open: false,
        title: 'Thông báo',
        content: '',
        onConfirm: () => { },
        loading: false
    });

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleEdit = (record: ProductItem) => {
        setEditingRecord(record);
        setIsAddModalOpen(true);
    };

    const openConfirmModal = (
        title: string,
        content: string,
        onConfirm: () => Promise<void> | void,
        onCancel?: () => void
    ) => {
        setConfirmModal({
            open: true,
            title,
            content,
            onConfirm,
            onCancel,
            loading: false
        });
    };

    const closeConfirmModal = () => {
        if (confirmModal.onCancel) confirmModal.onCancel();
        setConfirmModal(prev => ({ ...prev, open: false }));
    };

    const handleConfirmAction = async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        await confirmModal.onConfirm();
        setConfirmModal(prev => ({ ...prev, loading: false }));
    };

    // Toggle single product status
    const handleToggleStatus = (
        record: ProductItem,
        checked: boolean,
        startLoading: () => void,
        stopLoading: () => void
    ): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            const statusText = checked ? 'kích hoạt' : 'khóa';
            openConfirmModal(
                'Thông báo',
                `Bạn có chắc chắn muốn ${statusText} sản phẩm "${record.name}" không?`,
                async () => {
                    startLoading();
                    try {
                        const res = await updateProductStatus(warehouseId, record.id, checked);
                        if (res.success) {
                            showSuccess('Cập nhật trạng thái thành công');
                            router.refresh();
                            resolve(true);
                        } else {
                            showError(res.error || 'Cập nhật thất bại');
                            resolve(false);
                        }
                    } catch (err) {
                        showError('Có lỗi xảy ra');
                        resolve(false);
                    } finally {
                        stopLoading();
                        setConfirmModal(prev => ({ ...prev, open: false }));
                    }
                },
                () => resolve(false)
            );
        });
    };

    // Delete single product
    const handleDelete = (id: string) => {
        const item = raw.find(p => p.id === id);
        const name = item?.name || 'sản phẩm này';

        openConfirmModal(
            'Thông báo',
            `Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`,
            async () => {
                try {
                    const res = await deleteProduct(warehouseId, id);
                    if (res.success) {
                        showSuccess('Xóa sản phẩm thành công');
                        setSelectedRowKeys(prev => prev.filter(key => key !== id));
                        router.refresh();
                    } else {
                        showError(res.error || 'Có lỗi xảy ra');
                    }
                } catch {
                    showError('Có lỗi xảy ra');
                } finally {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        );
    };

    // Batch delete selected products
    const handleBatchDelete = () => {
        if (selectedRowKeys.length === 0) return;

        openConfirmModal(
            'Thông báo',
            `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} sản phẩm đã chọn không?`,
            async () => {
                try {
                    let successCount = 0;
                    for (const key of selectedRowKeys) {
                        const res = await deleteProduct(warehouseId, String(key));
                        if (res.success) successCount++;
                    }
                    if (successCount > 0) {
                        showSuccess(`Đã xóa thành công ${successCount} sản phẩm`);
                        setSelectedRowKeys([]);
                        router.refresh();
                    } else {
                        showError('Không thể xóa các sản phẩm đã chọn');
                    }
                } catch {
                    showError('Có lỗi xảy ra');
                } finally {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        );
    };

    // Multi-criteria client filtering
    const filteredData = useMemo(() => {
        return raw.filter(item => {
            // 0. Search Filter
            if (searchText) {
                const lowerSearch = searchText.toLowerCase();
                const matchCode = item.code?.toLowerCase().includes(lowerSearch);
                const matchName = item.name?.toLowerCase().includes(lowerSearch);
                if (!matchCode && !matchName) return false;
            }

            // 1. Status Filter
            if (statusFilter === 'active' && !item.is_active) return false;
            if (statusFilter === 'inactive' && item.is_active) return false;

            // 2. Grade/Category Filter
            if (categoryFilter !== 'all' && item.category_id !== categoryFilter) return false;

            // 3. Quy cách (Specification) Filter
            if (specificationFilter !== 'all' && item.method_id !== specificationFilter) return false;

            return true;
        });
    }, [raw, searchText, statusFilter, categoryFilter, specificationFilter]);

    // Table Columns Configuration
    const columns = useMemo(
        () => getProductColumns(categoryOptions, uomOptions, methodOptions, handleEdit, handleDelete, handleToggleStatus),
        [categoryOptions, uomOptions, methodOptions, handleToggleStatus]
    );

    return (
        <div className="flex flex-col h-full min-h-0 relative p-4 font-inter">
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">
                        Sản phẩm
                    </h2>
                    <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">
                        Đã chọn: {selectedRowKeys.length} mục
                    </p>
                </div>
                <ModalThemeProvider>
                    <ConfigProvider
                        theme={{
                            components: {
                                Input: {
                                    colorBorder: '#DADBDD',
                                    hoverBorderColor: '#DADBDD',
                                    activeBorderColor: '#DADBDD',
                                    activeShadow: 'none',
                                },
                                Select: {
                                    colorBorder: '#DADBDD',
                                    hoverBorderColor: '#DADBDD',
                                    activeBorderColor: '#DADBDD',
                                }
                            }
                        }}
                    >
                        <Space style={{ gap: 15 }}>
                            <Input
                                placeholder="Nhập vào tìm kiếm"
                                prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                                className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px]"
                                style={{ width: '260px', fontSize: '16px', height: '40px' }}
                                value={searchText}
                                onChange={onSearchChange}
                            />
                            <Select
                                placeholder="Quy cách"
                                className="w-[120px] h-[40px] text-[16px] font-roboto"
                                style={{ height: '40px', width: '120px', color: '#54545499' }}
                                value={specificationFilter}
                                onChange={setSpecificationFilter}
                                options={[
                                    { label: 'Tất cả', value: 'all' },
                                    ...methodOptions.map(m => ({ label: m.code || m.label, value: m.value }))
                                ]}
                                suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ opacity: 0.6 }} />}
                            />
                            <Select
                                placeholder="Trạng thái"
                                className="w-[120px] h-[40px] text-[16px] font-roboto"
                                style={{ height: '40px', width: '120px', color: '#54545499' }}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { label: 'Tất cả', value: 'all' },
                                    { label: 'Hoạt động', value: 'active' },
                                    { label: 'Khóa', value: 'inactive' }
                                ]}
                                suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ opacity: 0.6 }} />}
                            />
                            <Select
                                placeholder="Phẩm cấp"
                                className="w-[160px] h-[40px] text-[16px] font-roboto"
                                style={{ height: '40px', width: '160px', color: '#54545499' }}
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={[
                                    { label: 'Tất cả phẩm cấp', value: 'all' },
                                    ...categoryOptions
                                ]}
                                suffixIcon={<img src="/icon.svg/dow.svg" alt="down" style={{ opacity: 0.6 }} />}
                                virtual={false}
                                styles={{ popup: { root: { maxHeight: 'none', overflow: 'hidden' } } }}
                                // Đổi từ dropdownRender sang popupRender chuẩn Antd v5
                                popupRender={(menu) => (
                                    <OverlayScrollbarsComponent
                                        options={{
                                            scrollbars: {
                                                autoHide: 'leave',
                                                autoHideDelay: 500,
                                            }
                                        }}
                                        style={{ maxHeight: '250px' }}
                                    >
                                        {menu}
                                    </OverlayScrollbarsComponent>
                                )}

                            />
                            <Image
                                src="/icon.svg/delete.svg"
                                alt="Xóa nhiều"
                                width={40}
                                height={40}
                                onClick={handleBatchDelete}
                                className={`cursor-pointer hover:opacity-80 transition-opacity ${selectedRowKeys.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                                    }`}
                            />
                            <Image
                                src="/icon.svg/create.svg"
                                alt="Thêm mới"
                                width={40}
                                height={40}
                                onClick={() => {
                                    setEditingRecord(null);
                                    setIsAddModalOpen(true);
                                }}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                        </Space>
                    </ConfigProvider>
                </ModalThemeProvider>
            </div>

            <div className="w-full h-[1px] bg-gray-200 mb-4 shrink-0"></div>

            <div className="flex-1 min-h-0">
                <CustomTable
                    dataTable={filteredData}
                    columns={columns}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 46,
                    }}
                />
            </div>

            <ModalAddProduct
                open={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingRecord(null);
                }}
                warehouseId={warehouseId}
                categoryOptions={categoryOptions}
                uomOptions={uomOptions}
                methodOptions={methodOptions}
                editingRecord={editingRecord}
                onSuccess={() => router.refresh()}
                existingProducts={raw}
            />

            <ModalConfirmDelete
                open={confirmModal.open}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                content={confirmModal.content}
                loading={confirmModal.loading}
            />
        </div>
    );
}
