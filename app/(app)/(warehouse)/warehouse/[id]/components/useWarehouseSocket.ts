import { useEffect } from 'react';

export const useWarehouseSocket = ({
  socket,
  warehouseId,
  setAllLocations,
  setAllDevices
}: {
  socket: any;
  warehouseId: string;
  setAllLocations: React.Dispatch<React.SetStateAction<any[]>>;
  setAllDevices: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
  // File này hoàn toàn mù tịt về giao diện, nó không biết vẽ bản đồ là gì. Nó chỉ ôm cái socket và 
  // túc trực 24/24 nghe ngóng 2 tín hiệu: DEVICE_MOVED và LOCATION_CHANGED
  // đồng bộ hóa và cập nhật tức thời vị trí của thiết bị cũng như các ô 
  //khi có sự thay đổi từ hệ thống thực tế (backend gửi tín hiệu qua Socket.IO
  useEffect(() => {
    if (!socket || !warehouseId) return;
    // giải nén dự liệu nếu bị lệt đinhj dạng 
    //Khi có bất kỳ nghiệp vụ nào liên quan tới việc robot bốc/dỡ hàng, 
    // Backend sẽ bắn sự kiện LOCATION_CHANGED. Phía Frontend sẽ bắt đầu xử lý
    const handleLocationChanged = (data: any) => {
      // console.log("[WarehouseContext] Nhận LOCATION_CHANGED từ Socket.IO:", data);
      if (!data) return;
      // chuẩn hóa dữ liệu (normalizeLocation) như ép kiểu is_occupied thành kiểu boolean (để xác định ô trống hay chứa hàng)
      const normalizeLocation = (rawItem: any) => {
        if (!rawItem) return null;

        let actual = rawItem;
        if (rawItem.payload) {
          actual = typeof rawItem.payload === 'string' ? JSON.parse(rawItem.payload) : rawItem.payload;
        } else if (rawItem.after) {
          actual = typeof rawItem.after === 'string' ? JSON.parse(rawItem.after) : rawItem.after;
        } else if (rawItem.data) {
          actual = typeof rawItem.data === 'string' ? JSON.parse(rawItem.data) : rawItem.data;
        }

        const id = actual.id || actual.locationId || actual.location_id;
        const node_id = actual.node_id || actual.nodeId;
        const qrcode = actual.qrcode || actual.qrCode || actual.qr_code;
        const is_occupied = actual.is_occupied !== undefined ? actual.is_occupied : actual.isOccupied;

        return {
          ...actual,
          id,
          node_id,
          qrcode,
          // /// ép kiểu về true (có chứa hàng) hoặc false (ô đang trống)
          is_occupied: !!is_occupied
        };
      };

      //  Hàm hỗ trợ cập nhật danh sách ô kệ 
      const updateLocationItem = (next: any[], rawItem: any) => {
        const item = normalizeLocation(rawItem);
        if (!item) return;

        const idx = next.findIndex(l =>
          (item.id && l.id?.toString() === item.id?.toString()) ||
          (item.qrcode && l.qrcode?.trim().toUpperCase() === item.qrcode?.trim().toUpperCase()) ||
          (item.node_id && l.node_id?.toString() === item.node_id?.toString())
        );
        if (idx !== -1) {//// Cập nhật ô kệ đã tồn tại
          next[idx] = { ...next[idx], ...item };
        } else {
          next.push(item);// // Thêm mới ô kệ
        }
      };

      //  Hàm hỗ trợ cập nhật tọa độ thiết bị khi di chuyển
      const updateDeviceItem = (next: any[], rawItem: any) => {
        let actualItem = rawItem;
        if (rawItem.payload) {
          actualItem = typeof rawItem.payload === 'string' ? JSON.parse(rawItem.payload) : rawItem.payload;
        } else if (rawItem.after) {
          actualItem = typeof rawItem.after === 'string' ? JSON.parse(rawItem.after) : rawItem.after;
        } else if (rawItem.data) {
          actualItem = typeof rawItem.data === 'string' ? JSON.parse(rawItem.data) : rawItem.data;
        }

        const devId = actualItem.device_id || actualItem.deviceId || actualItem.id;
        const newQr = actualItem.qrcode || actualItem.qrCode || actualItem.qr_code;
        if (!devId) return;

        const idx = next.findIndex(d => d.id?.toString() === devId.toString());
        if (idx !== -1) {
          // If metadata is present, merge it. If newQr is present, update the nested qrCode
          const currentDevice = next[idx];
          let metaObj: any = {};
          if (currentDevice.metadata) {
            try {
              metaObj = typeof currentDevice.metadata === 'string' ? JSON.parse(currentDevice.metadata) : currentDevice.metadata;
              if (typeof metaObj === 'string') {
                metaObj = JSON.parse(metaObj);
              }
            } catch (e) { }
          }
          if (newQr) {
            metaObj.qrCode = newQr;
            metaObj.qrcode = newQr;
          }
          // Merge other data from the event into metadata or the device root
          next[idx] = {
            ...currentDevice,
            ...actualItem,
            metadata: typeof currentDevice.metadata === 'string' ? JSON.stringify(metaObj) : metaObj
          };
        }
      };

      // Áp dụng cập nhật vào React State
      setAllLocations(prev => {
        const next = [...prev];
        if (Array.isArray(data)) {
          data.forEach(item => updateLocationItem(next, item));
        } else {
          updateLocationItem(next, data);
        }
        return next;
      });

      // Cập nhật danh sách thiết bị đang chạy
      setAllDevices(prev => {
        const next = [...prev];
        if (Array.isArray(data)) {
          data.forEach(item => updateDeviceItem(next, item));
        } else {
          updateDeviceItem(next, data);
        }
        return next;
      });
    };

    const handleDeviceMoved = (data: any) => {
      // console.log("[WarehouseContext] Nhận DEVICE_MOVED từ Socket.IO:", data);  
      if (!data) return;

      const updateDeviceItemOnMove = (next: any[], item: any) => {
        const devId = item.id;
        const devCode = item.code;
        if (!devId && !devCode) return;

        const idx = next.findIndex(d =>
          (devId && d.id?.toString() === devId.toString()) ||
          (devCode && d.code?.toString() === devCode.toString())
        );

        if (idx !== -1) {
          const currentDevice = next[idx];
          let metaObj: any = {};
          if (currentDevice.metadata) {
            try {
              metaObj = typeof currentDevice.metadata === 'string' ? JSON.parse(currentDevice.metadata) : currentDevice.metadata;
              if (typeof metaObj === 'string') {
                metaObj = JSON.parse(metaObj);
              }
            } catch (e) { }
          }

          if (item.metadata) {
            metaObj = { ...metaObj, ...item.metadata };
          }

          const newQr = item.metadata?.qrcode || item.metadata?.qrCode || item.qrcode || item.qrCode;
          if (newQr) {
            metaObj.qrCode = newQr;
            metaObj.qrcode = newQr;
          }

          // Cập nhật batteryPercentage nếu backend gửi về
          if (item.batteryPercent !== undefined) {
            metaObj.batteryPercentage = Number(item.batteryPercent);
          } else if (item.batteryPercentage !== undefined) {
            metaObj.batteryPercentage = Number(item.batteryPercentage);
          }

          // Cập nhật packageStatus (0 = không có hàng, 1 = có hàng)
          if (item.packageStatus !== undefined) {
            metaObj.packageStatus = Number(item.packageStatus);
          }

          // Cập nhật nhiệm vụ hiện tại
          if (item.currentTask !== undefined) {
            metaObj.currentTask = item.currentTask;
          }

          next[idx] = {
            ...currentDevice,
            status: item.status || currentDevice.status,
            metadata: typeof currentDevice.metadata === 'string' ? JSON.stringify(metaObj) : metaObj
          };

        }
      };

      setAllDevices(prev => {
        const next = [...prev];
        if (Array.isArray(data)) {
          data.forEach(item => updateDeviceItemOnMove(next, item));
        } else {
          updateDeviceItemOnMove(next, data);
        }
        return next;
      });
    };

    //Đăng ký và Hủy bộ lắng nghe sự kiện (Socket Listener)
    // /Đăng ký các sự kiện từ Socket.IO của Backend đẩy về:
    socket.on('LOCATION_CHANGED', handleLocationChanged);
    socket.on('DEVICE_MOVED', handleDeviceMoved);
    return () => {
      socket.off('LOCATION_CHANGED', handleLocationChanged);
      socket.off('DEVICE_MOVED', handleDeviceMoved);
    };
  }, [socket, warehouseId, setAllLocations, setAllDevices]);
};
