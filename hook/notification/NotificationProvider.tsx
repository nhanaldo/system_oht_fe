"use client"
import { createContext, useContext, PropsWithChildren } from 'react';
import { useAppNotification } from './useNotification';

// Define the shape explicitly
//Bọc toàn bộ ứng dụng lại để bất kỳ component nào cũng có thể bật thông báo.
type NotificationContextType = ReturnType<typeof useAppNotification>;

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
    const notification = useAppNotification();

    return (
        <NotificationContext.Provider value={notification}>
            {notification.contextHolder}
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotify = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotify must be used within a NotificationProvider");
    }
    return context;
};
