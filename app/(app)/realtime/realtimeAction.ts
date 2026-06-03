'use server';

/**
 * Ghi log trạng thái kết nối Socket.IO ra terminal của server Node.js
 */
export async function logSocketConnectionServer(status: 'success' | 'failure' | 'disconnect', idOrError: string) {
  if (status === 'success') {
    console.log(`\n\x1b[32m[Socket.IO Server Log] Kết nối Socket.IO thành công! ID: ${idOrError}\x1b[0m\n`);
  } else if (status === 'failure') {
    console.error(`\n\x1b[31m[Socket.IO Server Log] Kết nối Socket.IO thất bại! Lỗi: ${idOrError}\x1b[0m\n`);
  } else if (status === 'disconnect') {
    console.log(`\n\x1b[33m[Socket.IO Server Log] Đã ngắt kết nối Socket.IO! Lý do: ${idOrError}\x1b[0m\n`);
  }
}

/**
 * Ghi log sự kiện LOCATION_CHANGED ra terminal của server Node.js
 */
export async function logLocationChangedServer(data: any) {
  try {
    //console.log(`\x1b[36m[Socket.IO Server Log] Nhận sự kiện LOCATION_CHANGED thành công: \x1b[0m`, JSON.stringify(data));
  } catch (err) {
    //console.error(`\x1b[31m[Socket.IO Server Log] Nhận sự kiện LOCATION_CHANGED nhưng bị lỗi parse: \x1b[0m`, err);
  }
}

/**
 * Ghi log sự kiện DEVICE_MOVED ra terminal của server Node.js
 */
export async function logDeviceMovedServer(data: any) {
  try {
    //console.log(`\x1b[35m[Socket.IO Server Log] Nhận sự kiện DEVICE_MOVED thành công: \x1b[0m`, JSON.stringify(data));
  } catch (err) {
    //console.error(`\x1b[31m[Socket.IO Server Log] Nhận sự kiện DEVICE_MOVED nhưng bị lỗi parse: \x1b[0m`, err);
  }
}

