import React from 'react';
import { Modal, Button } from 'antd';
import ModalThemeProvider from '@/components/ui/ModalThemeProvider';

export interface ModalConfirmDeleteProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    content?: React.ReactNode;
    loading?: boolean;
}

export default function ModalConfirmDelete({
    open,
    onClose,
    onConfirm,
    title = "Thông báo",
    content = "Bạn có chắc chắn muốn xóa mục này không?",
    loading = false
}: ModalConfirmDeleteProps) {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            closable={false}
            centered
            width={417}
            wrapClassName="custom-confirm-modal"
            rootClassName="custom-confirm-modal"
            className="custom-confirm-modal"
            styles={{
                body: { padding: 0, }
            }}
        >
            <ModalThemeProvider>
                <div style={{
                    padding: '32px 32px 24px 32px',
                    minHeight: 157,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRadius: '8px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <img src="/icon.svg/message.svg" alt="message" style={{ width: 22, height: 22, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '16px', fontWeight: 400, marginLeft: "16px", lineHeight: '100%', color: '#001e33', display: 'block' }}>
                                {title}
                            </span>
                            <span style={{ fontSize: '14px', marginLeft: "16px", lineHeight: '20px', color: '#485259', display: 'block', marginTop: '4px' }}>
                                {content}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <Button
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                width: '55px',
                                height: '30px',
                                borderColor: '#a1a1a1',
                                color: '#a1a1a1',
                                borderRadius: '20px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            loading={loading}
                            onClick={onConfirm}
                            style={{
                                backgroundColor: '#076eb8',
                                borderColor: '#076eb8',
                                color: '#ffffff',
                                width: '88px',
                                height: '30px',
                                borderRadius: '20px',
                                marginLeft: '20px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </ModalThemeProvider>
        </Modal>
    );
}
