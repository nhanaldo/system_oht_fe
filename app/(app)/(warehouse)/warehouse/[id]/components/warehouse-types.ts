export type TabKey = 'area' | 'position' | 'route';

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

export const getSelectedTileName = (directions: DirectionFlags | string[], areaType?: string): string => {
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
