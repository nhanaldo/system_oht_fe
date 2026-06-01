export type TabKey = 'module' | 'floor' | 'area' | 'position';

export type ImportDirection = 'top-down' | 'bottom-up' | 'left-right' | 'right-left';


// định nghĩa kiểu dữ liệu và vẽ map
// cờ hướng đi lên, xuống, trái, phải 
export interface DirectionFlags {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/**
 * Cấu hình của một Module kho (khối chính trong kho)
 */
export interface WarehouseModule {
  id: string;
  code: string;
  tower_type: 'FLOOR' | 'TOWER';
  name: string;
  is_active: boolean;
}

export interface DeviceConfig {
  id: string;
  category: string;
  name: string;
  capabilities: ('inbound' | 'outbound' | 'versatile')[];
}

export interface FloorDevice {
  id: string;
  purpose: 'INBOUND' | 'OUTBOUND' | 'MULTIPLE';
}

/**
 * Cấu hình của một Tầng thuộc Module
 */
export interface FloorConfig {
  id: string;
  moduleId: string;
  warehouseFloorId: string; // ID of the physical warehouse floor
  name: string;
  isNew?: boolean;
  isModified?: boolean;
  nodes: string[]; // "r,c" keys
  devices: FloorDevice[];   // device objects
}

/**
 * Cấu hình của một Khu vực (Zone) trên một tầng
 * Ví dụ: Khu vực lưu trữ, sạc pin, chờ, v.v.
 */
export interface AreaConfig {
  id: string;
  floorId: string;
  areaType: string;
  name: string;
  code: string;
  inbound_direction_x?: string;
  inbound_direction_y?: string;
  category_id?: string;
  product_id?: string;
  isNew?: boolean;
  isModified?: boolean;
  nodes: string[];
  importDirection: ImportDirection | '';
  zoneTypeId?: string;
}

/**
 * Cấu hình chi tiết của từng vị trí (từng ô vuông/node trên bản đồ)
 */
export interface PositionConfig {
  key: string; // Coordinate key or unique ID
  floorId: string;
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

export const IMPORT_DIRECTION_OPTIONS: { value: ImportDirection; label: string }[] = [
  { value: 'top-down', label: 'Trên xuống dưới' },
  { value: 'bottom-up', label: 'Dưới lên trên' },
  { value: 'left-right', label: 'Trái sang phải' },
  { value: 'right-left', label: 'Phải sang trái' },
];

export const MOCK_DEVICES: DeviceConfig[] = [
  { id: 'lifter-001', category: 'Lifter', name: 'Lifter - 001', capabilities: ['inbound', 'outbound', 'versatile'] },
  { id: 'lifter-002', category: 'Lifter', name: 'Lifter - 002', capabilities: ['inbound', 'outbound', 'versatile'] },
  { id: 'lifter-003', category: 'Lifter', name: 'Lifter - 003', capabilities: ['inbound', 'outbound', 'versatile'] },
  { id: 'shuttle-001', category: 'Shuttle', name: 'Shuttle - 001', capabilities: ['inbound', 'outbound', 'versatile'] },
];

/**
 * Kiểm tra xem một vị trí có được thiết lập bất kỳ hướng di chuyển nào không
 */
export const hasAnyDirection = (d: DirectionFlags | string[]): boolean => {
  if (Array.isArray(d)) {
    return d.some(val => val === '1');
  }
  return d.up || d.down || d.left || d.right;
};

// lấy tên file ảnh dựa trên hướng đi và loại khu vực
export const getSelectedTileName = (directions: DirectionFlags | string[], areaType?: string): string => {
  let name = ""
  if (areaType === "inbound") name = '-import.svg';
  else if (areaType === "outbound") name = '-export.svg';
  else if (areaType === "waiting") name = '-wait.svg';
  else if (areaType === "charging") name = '-charge.svg';
  else if (areaType === "storage") name = '-storage.svg';
  else if (areaType === "moving") name = '-moving.svg';
  else if (areaType === "lifter") name = '-lifter.svg';
  else name = '-moving.svg';

  let up, down, left, right;
  if (Array.isArray(directions)) {
    up = directions[0] === '1';
    right = directions[1] === '1';
    down = directions[2] === '1';
    left = directions[3] === '1';
  } else {
    ({ up, down, left, right } = directions);
  }

  const count = [up, down, left, right].filter(Boolean).length;

  if (count === 0) return name.startsWith('-') ? name.substring(1) : 'node.svg';
  if (count === 4) return `corner${name}`;
  if (up && down && left) return `t-left${name}`;
  if (up && down && right) return `t-right${name}`;
  if (up && left && right) return `t-up${name}`;
  if (down && left && right) return `t-down${name}`;
  if (up && down) return `straight-vertical${name}`;
  if (left && right) return `straight-horizontal${name}`;
  if (up && left) return `corner-lu${name}`;
  if (up && right) return `corner-ru${name}`;
  if (down && left) return `corner-ld${name}`;
  if (down && right) return `corner-rd${name}`;
  if (up) return `up${name}`;
  if (down) return `down${name}`;
  if (left) return `left${name}`;
  if (right) return `right${name}`;
  return 'node.svg';
};
