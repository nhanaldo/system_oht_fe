'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { logSocketConnectionServer, logLocationChangedServer, logDeviceMovedServer, logNewTaskLogServer } from './realtimeAction';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  socket: null,
  isConnected: false,
});

export const useRealtime = () => useContext(RealtimeContext);

// khai báo nằm ngoài Component Lifecycle để tránh việc React StrictMode render lại 
// component nhiều lần dẫn đến khởi tạo nhiều kết nối WebSocket trùng nhau
let globalSocket: Socket | null = null;

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  // 1. Chạy logic kết nối Socket
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    // kết nối socket.io
    if (!globalSocket) {
      console.log(`[Socket] Khởi tạo kết nối tới server Socket.IO: ${socketUrl}`);
      globalSocket = io(socketUrl, {
        transports: ['websocket'],
        autoConnect: false, // Chuẩn bị sẵn dây cáp nối tới Server đi, nhưng khoan hãy bấm nút kết nối
      });
    }

    const socketInstance = globalSocket;
    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    // Event listeners
    const onConnect = () => {
      setIsConnected(true);
      console.log(`[Socket] Kết nối thành công tới server Socket.IO! (ID: ${socketInstance.id})`);
      logSocketConnectionServer('success', socketInstance.id || 'unknown');
    };

    const onConnectError = (error: any) => {
      setIsConnected(false);
      console.error('[Socket] Kết nối thất bại / Lỗi kết nối Socket.IO:', error);
      logSocketConnectionServer('failure', error?.message || String(error));
    };

    const onDisconnect = (reason: any) => {
      setIsConnected(false);
      console.log('[Socket] Đã ngắt kết nối Socket.IO. Lý do:', reason);
      logSocketConnectionServer('disconnect', String(reason));
    };

    const onLocationChanged = (data: any) => {
      try {
        // console.log('[Socket] Nhận sự kiện LOCATION_CHANGED thành công:', data);
        logLocationChangedServer(data);
      } catch (err) {
        console.error('[Socket] Lỗi xử lý sự kiện LOCATION_CHANGED thất bại:', err);
      }
    };

    const onDeviceMoved = (data: any) => {
      try {
        // console.log('[Socket] Nhận sự kiện DEVICE_MOVED thành công:', data);
        // logDeviceMovedServer(data);
      } catch (err) {
        console.error('[Socket] Lỗi xử lý sự kiện DEVICE_MOVED thất bại:', err);
      }
    };

    const onNewTaskLog = (data: any) => {
      try {
        // console.log('[Socket] Nhận sự kiện NEW_TASK_LOG (Hoạt động hệ thống):', data);
        // logNewTaskLogServer(data);
      } catch (err) {
        console.error('[Socket] Lỗi xử lý sự kiện NEW_TASK_LOG thất bại:', err);
      }
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('LOCATION_CHANGED', onLocationChanged);
    socketInstance.on('DEVICE_MOVED', onDeviceMoved);//chộp được sự kiện từ server
    socketInstance.on('NEW_TASK_LOG', onNewTaskLog);

    // gọi lệnh kết nối toàn cục
    // useWarehouseSocket cục bộ chỉ lắng nghe sau khi socket đã được kết nối 
    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return () => {
      console.log('[Socket] Gỡ bỏ listener Socket.IO...');
      socketInstance.off('connect', onConnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('LOCATION_CHANGED', onLocationChanged);
      socketInstance.off('DEVICE_MOVED', onDeviceMoved);// tắt nếu chuyển trang
      socketInstance.off('NEW_TASK_LOG', onNewTaskLog);
    };
  }, []);

  const contextValue = React.useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <RealtimeContext.Provider value={contextValue}>
      {/* 3. Đặt các component con (children) vào bên trong vùng phủ sóng */}
      {children}
    </RealtimeContext.Provider>
  );
};
