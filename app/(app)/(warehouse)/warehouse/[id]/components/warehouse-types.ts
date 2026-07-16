export type TabKey = 'area' | 'position' | 'route';



// định nghĩa kiểu dữ liệu và vẽ map
// cờ hướng đi lên, xuống, trái, phải 
export interface DirectionFlags {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}



export interface AreaConfig {
  id: string;
  areaType: string;
  name: string;
  code: string;
  description?: string;
  inbound_direction_x?: string;
  inbound_direction_y?: string;
  category_id?: string;
  product_id?: string;
  isNew?: boolean;
  isModified?: boolean;
  nodes: string[];
  zoneTypeId?: string;
}

/**
 * Cấu hình chi tiết của từng vị trí (từng ô vuông/node trên bản đồ)
 */
export interface PositionConfig {
  key: string; // Coordinate key or unique ID
  name?: string;
  areaType?: string;
  directions: DirectionFlags;
  qrCode: string;
  isNew?: boolean;
  imgName?: string;
  cellKeys?: string[]; // coordinates for groups (within same floor)
  nodeId?: string;
  x?: string | number;
  y?: string | number;
  z?: string | number;
}




/**
 * Kiểm tra xem một vị trí có được thiết lập bất kỳ hướng di chuyển nào không
 */
export const hasAnyDirection = (d: DirectionFlags | string[]): boolean => {
  if (Array.isArray(d)) {
    return d.some(val => val === '1');
  }
  return d.up || d.down || d.left || d.right;
};

export const getSelectedTileName = (directions: DirectionFlags | string[], areaType?: string): string => {
  let up = false, down = false, left = false, right = false;
  if (Array.isArray(directions)) {
    up = directions[0] === '1';
    right = directions[1] === '1';
    down = directions[2] === '1';
    left = directions[3] === '1';
  } else {
    ({ up, down, left, right } = directions);
  }

  const count = [up, down, left, right].filter(Boolean).length;

  // Nếu có hướng di chuyển, luôn dùng các tệp ray tàu chạy chung (không phân biệt loại khu vực)
  if (count > 0) {
    if (up && down) return 'straight_line.svg';
    if (left && right) return 'straight_line.svg';
    if (up && left) return 'top_left.svg';
    if (up && right) return 'top_right.svg';
    if (down && left) return 'left_bottom.svg';
    if (down && right) return 'right_bottom.svg';
    return 'node.svg';
  }

  // Nếu không có hướng di chuyển (count === 0), hiển thị icon theo loại khu vực
  if (areaType === "inbound") return "inbound.svg";
  if (areaType === "outbound") return "outbound.svg";
  if (areaType === "waiting") return "waiting.svg";
  if (areaType === "charging") return "charging.svg";
  if (areaType === "maintenance") return "maintenance.svg";
  if (areaType === "bypass") return "bypass.svg";
  return "node.svg";
};

export interface RouteConfig {
  id: string;
  name: string;
  cells: string[];
  routeType: string | null;
  curveDirection: string | null;
  curveAngle?: string | number | null;
  controlPoint?: { x: number, y: number } | null;
  routeDirection: string;
  distance: string | number;
  speed: string | number;
}
