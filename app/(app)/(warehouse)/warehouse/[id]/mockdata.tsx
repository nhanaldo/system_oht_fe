export interface ZoneType {
  id: string;
  code: string;
  name: string;
}

export const MOCK_ZONE_TYPES: ZoneType[] = [
  { id: "1", code: "CHARGING", name: "Khu vực sạc" },
  { id: "2", code: "PARKING", name: "Khu vực đỗ" },
  { id: "3", code: "PICKING", name: "Khu vực lấy hàng" },
  { id: "4", code: "DROPPING", name: "Khu vực bỏ hàng" },
  { id: "5", code: "MOVING", name: "Khu vực đường đi" },
  { id: "6", code: "BYPASS", name: "Khu vực đường tránh" },
  { id: "7", code: "MAINTENANCE", name: "Khu vực bảo trì" },
];


