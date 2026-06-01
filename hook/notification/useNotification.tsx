"use client"
import { notification } from 'antd';
import {
    CheckCircleFilled,
    CloseCircleFilled,
    ExclamationCircleFilled,
} from '@ant-design/icons';
import { useNotificationStyles } from './notification.styles';//Giao diện thông báo
//Custom Hook chứa logic để hiển thị các loại thông báo khác nhau.

export function useAppNotification() {
    const { styles } = useNotificationStyles();
    const [api, contextHolder] = notification.useNotification(
        {
            top: 79,
        }
    );

    const open = (
        type: 'success' | 'error' | 'warning',
        message: string
    ) => {
        const icons = {
            success: <CheckCircleFilled className={styles.icon} style={{ color: '#52c41a' }} />,
            error: <CloseCircleFilled className={styles.icon} style={{ color: '#ff4d4f' }} />,
            warning: <ExclamationCircleFilled className={styles.icon} style={{ color: '#faad14' }} />,
        };

        api.open({
            description: (
                <div className={styles.content}>
                    {icons[type]}
                    <span style={{ flex: 1 }}>{message}</span>
                </div>
            ),
            duration: 3,
            className: `custom-notice ${styles.base} ${styles[type]} ${styles.wrapper}`,
            placement: 'topRight',
            closable: false
        });
    };

    return {
        contextHolder,
        success: (msg: string) => open('success', msg),
        error: (msg: string) => open('error', msg),
        warning: (msg: string) => open('warning', msg),
    };
}
