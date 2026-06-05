'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import ModalThemeProvider from '@/components/ui/ModalThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { getProducts } from '../../product/list/listAction';
import { createInboundJob, createOutboundJob } from '../jobAction';
import FormItemController from "@/components/ui/CustomController";
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';

interface ModalCreateJobProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    jobType: 'IMPORT' | 'EXPORT';
    warehouseId: string;
}

interface FormValues {
    code: string;
    sku_code: string;
    container_code: string;
    quantity: number;
    gate: string;
}

export default function ModalCreateJob({
    open,
    onClose,
    onSuccess,
    jobType,
    warehouseId
}: ModalCreateJobProps) {
    const { control, handleSubmit, reset } = useForm<FormValues>({
        defaultValues: {
            code: '',
            sku_code: '',
            container_code: '',
            quantity: 10,
            gate: ''
        }
    });

    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);

    useEffect(() => {
        if (open && warehouseId) {
            reset({
                code: jobType === 'IMPORT' ? 'JOB-IMPORT-013' : 'JOB-EXPORT-B5-001',
                sku_code: '',
                container_code: jobType === 'IMPORT' ? "CONT-0013" : "",
                quantity: 10,
                gate: ''
            });
            setProductsLoading(true);
            getProducts(warehouseId, { limit: 2000, page: 1 })
                .then((res: any) => {
                    if (res?.success === false) {
                        console.error("Lỗi lấy danh sách sản phẩm:", res.error);
                        return;
                    }
                    const list = res?.elements || res?.data || res?.rows || (Array.isArray(res) ? res : []);
                    setProducts(list);
                })
                .catch(err => {
                    console.error("Lỗi lấy danh sách sản phẩm:", err);
                })
                .finally(() => {
                    setProductsLoading(false);
                });
        }
    }, [open, warehouseId, reset, jobType]);

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true);

            const expiryDate = dayjs().format('YYYY-MM-DD HH:mm:ss');

            const payload: any = {
                code: values.code,
                job_type: jobType,
                warehouse_id: warehouseId,
                input: {
                    sku_code: values.sku_code,
                },
                gate: values.gate
            };

            if (jobType === 'IMPORT') {
                payload.input.container_code = values.container_code;
                payload.input.quantity = values.quantity;
                payload.input.expiry_date = expiryDate;
            }

            const action = jobType === 'IMPORT' ? createInboundJob : createOutboundJob;
            const res = await action(warehouseId, payload);

            if (res?.success) {
                showSuccess("Tạo công việc thành công!");
                reset();
                onSuccess();
                onClose();
            } else {
                showError(res?.error || "Tạo công việc thất bại!");
            }
        } catch (error: any) {
            showError("Đã có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const commonLabelCol = {
        md: { flex: "200px" },
        xs: { span: 24 },
        style: {
            height: 40,
            fontSize: 14,
            fontWeight: 400,
            textAlign: "left" as const,
            display: "flex",
            alignItems: "center",
            color: "#404040",
        },
    };

    const commonWrapperCol = {
        md: { flex: "auto" },
        xs: { span: 24 },
        style: { paddingLeft: 0, maxWidth: "100%" },
    };

    return (
        <ModalThemeProvider>
            <Modal
                closable={true}
                title={
                    <span style={{ fontSize: 18, fontWeight: 500, color: "#484848" }}>
                        {jobType === 'IMPORT' ? 'Tạo lệnh Nhập kho' : 'Tạo lệnh Xuất kho'}
                    </span>
                }
                open={open}
                width={800}
                centered
                zIndex={1005}
                className="responsive-modal"
                styles={{
                    mask: {
                        backdropFilter: "blur(0px)",
                    },
                    container: {
                        padding: "19px 24px 30px 24px",
                    },
                }}
                footer={null}
                onCancel={onClose}
                destroyOnHidden
            >
                <div className="flex flex-col items-center w-full">
                    <div className="h-[1px] bg-[#C0C0C0] w-full mb-[20px] md:mb-[30px] mt-[9px]"></div>
                    <Form
                        onFinish={handleSubmit(onSubmit)}
                        className="flex flex-col items-center justify-center w-full max-w-full md:w-[720px]"
                    >
                        <FormItemController
                            name="code"
                            control={control}
                            label="Mã lệnh"
                            rules={{ required: 'Vui lòng nhập mã lệnh' }}
                            required
                            layout="horizontal"
                            style={{ width: "100%", marginBottom: 20 }}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Input {...field} className="w-full h-[40px] rounded-md p-2" />
                            )}
                        />

                        <FormItemController
                            name="sku_code"
                            control={control}
                            label="Mã sản phẩm "
                            rules={{ required: 'Vui lòng chọn sản phẩm' }}
                            required
                            layout="horizontal"
                            style={{ width: "100%", marginBottom: 20 }}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    placeholder="Chọn sản phẩm"
                                    className="w-full h-[40px]"
                                    showSearch
                                    loading={productsLoading}
                                    options={products.map(p => ({
                                        label: `${p.code} - ${p.name}`,
                                        value: p.code
                                    }))}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                />
                            )}
                        />
                        {jobType === "IMPORT" && (
                            <FormItemController
                                name="container_code"
                                control={control}
                                label="Mã Pallet"
                                rules={{ required: 'Vui lòng nhập mã Pallet' }}
                                required
                                layout="horizontal"
                                style={{ width: "100%", marginBottom: 20 }}
                                wrapperCol={commonWrapperCol}
                                labelCol={commonLabelCol}
                                render={(field) => (
                                    <Input {...field} placeholder="VD: CONT-0013" className="w-full h-[40px] rounded-md p-2" />
                                )}
                            />
                        )}
                        {jobType === "IMPORT" && (
                            <FormItemController
                                name="quantity"
                                control={control}
                                label="Số lượng"
                                rules={{ required: 'Vui lòng nhập số lượng', min: { value: 10, message: 'Số lượng tối thiểu là 10' } }}
                                required
                                layout="horizontal"
                                style={{ width: "100%", marginBottom: 20 }}
                                wrapperCol={commonWrapperCol}
                                labelCol={commonLabelCol}
                                render={(field) => (
                                    <InputNumber
                                        {...field}
                                        placeholder="Nhập số lượng"
                                        className="w-full h-[40px] rounded-md"
                                        style={{ width: '100%' }}
                                        min={10}
                                    />
                                )}
                            />
                        )}

                        <FormItemController
                            name="gate"
                            control={control}
                            label="Cổng"
                            rules={{ required: 'Vui lòng nhập/chọn cổng' }}
                            required
                            layout="horizontal"
                            style={{ width: "100%", marginBottom: 20 }}
                            wrapperCol={commonWrapperCol}
                            labelCol={commonLabelCol}
                            render={(field) => (
                                <Select
                                    {...field}
                                    placeholder="Chọn cổng"
                                    className="w-full h-[40px]"
                                    options={[
                                        { label: 'BOTTOM', value: 'BOTTOM' },
                                        { label: 'TOP', value: 'TOP' },

                                    ]}
                                    suffixIcon={<img src="/icon.svg/dow.svg" alt="down" />}
                                />
                            )}
                        />

                        <div className="flex flex-row items-center justify-center gap-[20px] mt-[30px] ">
                            <Button
                                onClick={onClose}
                                style={{
                                    backgroundColor: "white",
                                    color: "#A1A1A1",
                                    border: "1px solid #A1A1A1",
                                    padding: "5px 15px",
                                    height: 30,
                                    width: 80,
                                    borderRadius: 20,
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                htmlType="submit"

                                style={{
                                    backgroundColor: "#076EB8",
                                    color: "white",
                                    border: "1px solid #d9d9d9",
                                    padding: "5px 15px",
                                    height: 30,
                                    minWidth: 54,
                                    borderRadius: 20,
                                }}
                            >
                                Lưu
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal >
        </ModalThemeProvider >
    );
}
