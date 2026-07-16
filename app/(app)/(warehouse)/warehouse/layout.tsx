import React from 'react';
import { NotificationProvider } from '@/hook/notification/NotificationProvider';

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            {children}
        </NotificationProvider>
    );
}
