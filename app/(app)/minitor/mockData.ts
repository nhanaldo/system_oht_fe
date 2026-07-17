export const mockGridNodes = [
    // // Lối đi / Path
    // ...Array.from({ length: 40 }).map((_, c) => ({ r: 1, c, imgName: 'moving.svg' })),
    // ...Array.from({ length: 40 }).map((_, c) => ({ r: 8, c, imgName: 'moving.svg' })),
    // ...Array.from({ length: 40 }).map((_, c) => ({ r: 14, c, imgName: 'moving.svg' })),
    // ...Array.from({ length: 14 }).map((_, r) => ({ r, c: 3, imgName: 'moving.svg' })),
    // ...Array.from({ length: 14 }).map((_, r) => ({ r, c: 15, imgName: 'moving.svg' })),
    // ...Array.from({ length: 14 }).map((_, r) => ({ r, c: 27, imgName: 'moving.svg' })),

    // // Khu vực lưu trữ (Storage Zones)
    // ...Array.from({ length: 9 }).flatMap((_, rIdx) =>
    //     Array.from({ length: 7 }).map((_, cIdx) => ({
    //         r: rIdx + 2,
    //         c: cIdx + 4,
    //         imgName: 'storage.svg'
    //     }))
    // ),
    // ...Array.from({ length: 9 }).flatMap((_, rIdx) =>
    //     Array.from({ length: 7 }).map((_, cIdx) => ({
    //         r: rIdx + 2,
    //         c: cIdx + 16,
    //         imgName: 'storage.svg'
    //     }))
    // ),
    // ...Array.from({ length: 9 }).flatMap((_, rIdx) =>
    //     Array.from({ length: 7 }).map((_, cIdx) => ({
    //         r: rIdx + 2,
    //         c: cIdx + 28,
    //         imgName: 'storage.svg'
    //     }))
    // ),

    // // Các điểm đặc biệt
    // { r: 1, c: 4, imgName: 'charge.svg' },
    // { r: 1, c: 6, imgName: 'charge.svg' },
    // { r: 2, c: 24, imgName: 'charge.svg' },

    // { r: 2, c: 1, imgName: 'lifter.svg' },
    // { r: 2, c: 14, imgName: 'lifter.svg' },
    // { r: 2, c: 26, imgName: 'lifter.svg' },
    // { r: 11, c: 14, imgName: 'lifter.svg' },
    // { r: 11, c: 26, imgName: 'lifter.svg' },
    // { r: 11, c: 38, imgName: 'lifter.svg' },

    // { r: 6, c: 12, imgName: 'st1.svg' },
    // { r: 6, c: 13, imgName: 'st2.svg' },
    // { r: 6, c: 24, imgName: 'st3.svg' },
    // { r: 6, c: 25, imgName: 'st4.svg' },

    // { r: 3, c: 10, imgName: 'node.svg' },
    // { r: 3, c: 11, imgName: 'node.svg' },
    // { r: 3, c: 22, imgName: 'node.svg' },
    // { r: 3, c: 23, imgName: 'node.svg' },
    // { r: 3, c: 34, imgName: 'node.svg' },
];

export const mockStorageAreas = [
    // {
    //     id: "zone_1",
    //     name: "Khu vực lưu trữ 1",
    //     center: { r: 6, c: 7.5 },
    //     isVertical: false
    // },
    // {
    //     id: "zone_2",
    //     name: "Khu vực lưu trữ 2",
    //     center: { r: 6, c: 19.5 },
    //     isVertical: false
    // },
    // {
    //     id: "zone_3",
    //     name: "Khu vực lưu trữ 3",
    //     center: { r: 6, c: 31.5 },
    //     isVertical: false
    // }
];

export const mockExecutionList = [
    // Completed (10 items)
    { id: 1, type: "Nhập kho", code: "CMD - 28240801", plt: "PLT-00101", desc: "Chuối tiêu chín vàng - A101 - COMPLETED", status: "completed" },
    { id: 2, type: "Nhập kho", code: "CMD - 28240802", plt: "PLT-00102", desc: "Chuối sấy dẻo đặc sản - A102 - COMPLETED", status: "completed" },
    { id: 3, type: "Nhập kho", code: "CMD - 28240803", plt: "PLT-00103", desc: "Chuối tiêu hồng VietGAP - A103 - COMPLETED", status: "completed" },
    { id: 4, type: "Xuất kho", code: "CMD - 28240804", plt: "PLT-00104", desc: "Chuối ngự Chu Lai xuất khẩu - A104 - COMPLETED", status: "completed" },


    // Active (10 items)
    { id: 11, type: "Nhập kho", code: "CMD - 28240811", plt: "PLT-00111", desc: "Chuối tiêu Mỹ hữu cơ - B111 - ACTIVE", status: "active" },
    { id: 12, type: "Xuất kho", code: "CMD - 28240812", plt: "PLT-00112", desc: "Chuối sáp luộc đóng hộp - B112 - ACTIVE", status: "active" },
    { id: 13, type: "Nhập kho", code: "CMD - 28240813", plt: "PLT-00113", desc: "Chuối ngự mật ong - B113 - ACTIVE", status: "active" },
    { id: 14, type: "Xuất kho", code: "CMD - 28240814", plt: "PLT-00114", desc: "Chuối tiêu hồng sấy dẻo - B114 - ACTIVE", status: "active" },


    // Waiting (10 items)
    { id: 21, type: "Nhập kho", code: "CMD - 28240821", plt: "PLT-00121", desc: "Chuối tiêu xanh đóng thùng - C121 - WAITING", status: "waiting" },
    { id: 22, type: "Xuất kho", code: "CMD - 28240822", plt: "PLT-00122", desc: "Chuối sáp tươi Chu Lai - C122 - WAITING", status: "waiting" },
    { id: 23, type: "Nhập kho", code: "CMD - 28240823", plt: "PLT-00123", desc: "Chuối xiêm xanh VietGAP - C123 - WAITING", status: "waiting" },
    { id: 24, type: "Xuất kho", code: "CMD - 28240824", plt: "PLT-00124", desc: "Chuối Laba sấy giòn - C124 - WAITING", status: "waiting" },


    // Failed (10 items)
    { id: 31, type: "Nhập kho", code: "CMD - 28240831", plt: "PLT-00131", desc: "Chuối sáp bị dập vỏ - D131 - FAILED", status: "failed" },
    { id: 32, type: "Xuất kho", code: "CMD - 28240832", plt: "PLT-00132", desc: "Chuối tiêu lỗi nhiệt độ kho - D132 - FAILED", status: "failed" },
    { id: 33, type: "Nhập kho", code: "CMD - 28240833", plt: "PLT-00133", desc: "Chuối Laba quá hạn lưu trữ - D133 - FAILED", status: "failed" },
    { id: 34, type: "Xuất kho", code: "CMD - 28240834", plt: "PLT-00134", desc: "Chuối ngự hỏng mã barcode - D134 - FAILED", status: "failed" },

];

export const mockSystemLogs = [
    // { time: "09:15:21", message: "Shuttle S2 bỏ Pallet vào vị trí 3-D2 thành công" },
    // { time: "09:16:03", message: "AMR - 01 đã đưa Pallet PLT- 00095 tới vị trí nhập kho" },
    // { time: "09:16:18", message: "Lifter L2 lấy Pallet thành công" },
    // { time: "09:16:29", message: "Lifter L2 di chuyển đến tầng 1 thành công" },
    // { time: "09:16:37", message: "Shuttle S1 di chuyển đến vị trí Lifter để lấy hàng" },
    // { time: "09:16:44", message: "Shuttle S1 lấy hàng thành công" },
    // { time: "09:17:00", message: "Hệ thống tự động lưu trạng thái" },
];


export const mockStats = {
    total: 30,
    inbound: [
        // { label: "Khu vực chuối TQ A456", count: 10 },
        // { label: "Khu vực chuối TQ CP", count: 10 },
        // { label: "Khu vực chuối TQ A789", count: 10 },
        // { label: "Khu vực chuối Nhật RLC", count: 10 },
        // { label: "Khu vực chuối Nhật 28LY", count: 10 },
    ],
    outbound: 30
};
