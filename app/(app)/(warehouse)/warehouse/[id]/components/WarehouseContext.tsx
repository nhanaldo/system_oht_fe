'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { hasAnyDirection, getSelectedTileName } from './warehouse-types';
import type {
  TabKey, WarehouseModule, FloorConfig, AreaConfig, PositionConfig, DirectionFlags
} from './warehouse-types';
import { TowerProps, getTower, getTowerFloor, getZone, getNode, getWarehouseFloor, getZoneType, getWarehouse, getWarehouseById, getCategory, getProduct, getDevices, getLocations } from '../../warehouseAcction';
import { getDeviceTypes } from '@/app/(app)/workflows/list/workflowsAction';
import { useRealtime } from '@/app/(app)/realtime/RealtimeProvider';
import { useWarehouseSocket } from './useWarehouseSocket';
// giúp map và sideBar chia sẽ dữ liệu với nhau 
//Quan trọng hơn, đây là nơi chứa dữ liệu sống chạy trong ứng dụng bằng React State (useState). 
// Nó là bộ não tính toán xem ô nào đang chọn, dữ liệu tầng nào đang được load.
// Nơi định nghĩa các hành động (Actions): Chứa các hàm nghiệp vụ thực tế như xử lý copy tầng, xoá ô, lưu nháp...
interface WarehouseConfigContextType {
  // Data
  modules: TowerProps[];
  floors: FloorConfig[];
  areas: AreaConfig[];
  categories: any[];
  selectedCategory: string;
  setSelectedCategories: (id: string) => void;
  products: any[];
  allProducts: any[];
  warehouseFloors: any[];
  currentWarehouseFloorId: string;
  setCurrentWarehouseFloorId: (id: string) => void;
  positionItems: PositionConfig[];
  images: Record<string, HTMLImageElement>;
  rows: number;
  columns: number;
  floorsCount: number;
  modulesCount: number;
  warehouseName: string;
  // UI
  activeTab: TabKey;
  selectedCells: Set<string>;
  scale: number;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  initialEditingKeys: Set<string>;
  setInitialEditingKeys: (keys: Set<string>) => void;
  // Actions
  updateModule: (id: string, data: Partial<TowerProps>) => void;
  addFloor: () => void;
  updateFloor: (id: string, data: Partial<FloorConfig>) => void;
  removeFloor: (id: string) => void;
  saveFloorNodes: (floorId: string, nodes: string[]) => void;
  addArea: (floorId: string) => void;
  updateArea: (id: string, data: Partial<AreaConfig>) => void;
  removeArea: (id: string) => void;
  saveAreaNodes: (areaId: string, nodes: string[]) => void;
  addPositionItem: (floorId: string) => void;
  updatePositionItem: (id: string, data: Partial<PositionConfig>) => void;
  removePositionItem: (id: string) => void;
  upsertNodes: (keys: string[], directions: DirectionFlags, qrCode?: string, areaType?: string, preserveDirections?: boolean, name?: string) => void;
  removeNodes: (keys: string[]) => void;
  discardUnsaved: () => void;
  copyFloorConfig: (fromGlobalFloor: string, toGlobalFloor: string) => void;
  clearModifiedFlags: () => void;

  // UI actions
  setActiveTab: (tab: TabKey) => void;
  setSelectedCells: (cells: Set<string>) => void;
  setScale: (s: number) => void;
  getAllFloorNodes: () => Set<string>;
  getAllAreaNodes: () => Set<string>;
  getTakenCells: (tab: TabKey, excludeId?: string) => Set<string>;
  getFloorNodes: (floorId: string) => Set<string>;
  nodes: Record<string, PositionConfig>;
  allDevices: any[];
  allDeviceTypes: any[];
  allLocations: any[];

  // Position Edit Preview State
  posDirections: DirectionFlags;
  setPosDirections: (d: DirectionFlags) => void;
  posName: string;
  setPosName: (n: string) => void;
  posQrCode: string;
  setPosQrCode: (q: string) => void;
  zoneTypes: any[];
  warehouses: any[];
  restoreSnapshot: (snapshot: any) => void;
  isLoading: boolean;
  refreshGlobal: () => void;
  refreshFloor: () => void;
  zonesToDelete: string[];
  towerFloorsToDelete: FloorConfig[];
  clearDeleteQueue: () => void;
  readOnly?: boolean;
}
//lấy ra toàn bộ dữ liệu (như danh sách floors, areas, các hàm addFloor, saveFloorNodes...).
const WarehouseConfigContext = createContext<WarehouseConfigContextType | null>(null);

//"lấy" toàn bộ dữ liệu từ cái kho chung (Context) ra để các component khác sử dụng.
export const useWarehouseConfig = () => {
  const ctx = useContext(WarehouseConfigContext);
  if (!ctx) throw new Error('useWarehouseConfig must be used within WarehouseConfigProvider');
  return ctx;
};

const genId = () => Math.random().toString(36).slice(2, 10);
//WarehouseCo nfigProvider: Chứa các biến state khổng lồ như: danh sách module, 
// danh sách tầng, khu vực, vị trí từng ô vuông (nodes), ô nào đang được chọn (selectedCells), mức độ zoom của bản đồ (scale)
export const WarehouseConfigProvider: React.FC<{
  children: React.ReactNode;
  warehouseId: string;
  initialRows?: number;
  initialColumns?: number;
  initialModules?: number;
  initialFloors?: number;
  readOnly?: boolean;
}> = ({ children, warehouseId, initialRows = 14, initialColumns = 38, initialModules = 1, initialFloors = 1, readOnly = false }) => {
  const { socket } = useRealtime();// lấy socket đã được thiết lập ( kết nối )
  const [rows, setRows] = useState(initialRows);
  const [columns, setColumns] = useState(initialColumns);
  const [floorsCount, setFloorsCount] = useState(initialFloors);
  const [modulesCount, setModulesCount] = useState(initialModules);
  const [warehouseName, setWarehouseName] = useState("");

  const [modules, setModules] = useState<TowerProps[]>([]);
  const [floors, setFloors] = useState<FloorConfig[]>([]);
  const [areas, setAreas] = useState<AreaConfig[]>([]);
  const [nodes, setNodes] = useState<Record<string, PositionConfig>>({});
  const [positionItems, setPositionItems] = useState<PositionConfig[]>([]);
  const [warehouseFloors, setWarehouseFloors] = useState<any[]>([]);
  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [allDeviceTypes, setAllDeviceTypes] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [currentWarehouseFloorId, setCurrentWarehouseFloorId] = useState<string>("");
  const [zoneTypes, setZoneTypes] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zonesToDelete, setZonesToDelete] = useState<string[]>([]);
  const [towerFloorsToDelete, setTowerFloorsToDelete] = useState<FloorConfig[]>([]);

  const clearDeleteQueue = useCallback(() => {
    setZonesToDelete([]);
    setTowerFloorsToDelete([]);
  }, []);

  const [globalRefreshCounter, setGlobalRefreshCounter] = useState(0);
  const [floorRefreshCounter, setFloorRefreshCounter] = useState(0);

  const refreshGlobal = useCallback(() => setGlobalRefreshCounter(prev => prev + 1), []);
  const refreshFloor = useCallback(() => setFloorRefreshCounter(prev => prev + 1), []);

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabKey>('module');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialEditingKeys, setInitialEditingKeys] = useState<Set<string>>(new Set());

  const [posDirections, setPosDirections] = useState<DirectionFlags>({ up: false, down: false, left: false, right: false });
  const [posName, setPosName] = useState("");
  const [posQrCode, setPosQrCode] = useState("");

  // Image caching logic moved from WarehouseMap for performance
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  React.useEffect(() => {
    const directions = ['up', 'down', 'left', 'right', 'straight-horizontal', 'straight-vertical', 'corner-lu', 'corner-ru', 'corner-ld', 'corner-rd', 't-up', 't-down', 't-left', 't-right', 'corner'];
    const suffixes = ['', '-import', '-export', '-wait', '-charge', '-storage', '-moving', '-lifter'];
    const svgNames = ['node.svg', 'st1-shuttle.svg', 'st2-shuttle.svg', 'st3-shuttle.svg', 'lifter.svg', 'goods.svg'];
    suffixes.forEach(s => { if (s) svgNames.push(s.substring(1) + '.svg'); });
    directions.forEach(d => {
      suffixes.forEach(s => {
        if (s) { // Exclude empty suffix '' because standalone direction files like 'up.svg' or 't-left.svg' do not exist in public/svgMap/
          svgNames.push(`${d}${s}.svg`);
        }
      });
    });

    svgNames.forEach(name => {
      const img = new Image();
      img.src = `/svgMap/${name}`;
      img.onload = () => {
        setImages(prev => ({ ...prev, [name]: img }));
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${name}`);
      };
    });
  }, []);

  const getElements = (res: any) => res?.elements || res?.data || res?.rows || (Array.isArray(res) ? res : []);

  React.useEffect(() => {
    if (!warehouseId) return;
    const fetchData = async () => {
      const data = await getCategory(warehouseId);
      const rawCategory = getElements(data);
      setCategories(rawCategory);
    }
    fetchData();
  }, []);

  React.useEffect(() => {
    if (!selectedCategory && !warehouseId) return;
    const fetchData = async () => {
      const data = await getProduct(warehouseId, selectedCategory);
      const rawProduct = getElements(data);
      setProducts(rawProduct);
      setAllProducts(prev => {
        const next = [...prev];
        rawProduct.forEach((p: any) => {
          if (!next.find(x => x.id === p.id)) next.push(p);
        });
        return next;
      });
    }
    fetchData();
  }, [selectedCategory]);

  // --- API Sync ---
  React.useEffect(() => {
    if (!warehouseId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [towerData, wFloorData, zoneTypeData, warehouseListData, allProductData, deviceData, deviceTypeData, locationData] = await Promise.all([
          getTower(warehouseId),
          getWarehouseFloor(warehouseId),
          getZoneType(),
          getWarehouse({ page: 1, limit: 100 }),
          getProduct(warehouseId, ''),
          getDevices(warehouseId, { page: 1, limit: 1000 }),
          getDeviceTypes(),
          getLocations(warehouseId, { page: 1, limit: 1000 }),
        ]);

        const rawTowers = getElements(towerData);
        let nextModules: TowerProps[] = [];
        if (rawTowers.length > 0) {
          nextModules = rawTowers.map((t: any) => ({
            id: (t.tower_id || t.id).toString(),
            code: t.tower_code || t.code || "",
            name: t.tower_name || t.name || "",
            is_active: t.is_active ?? true,
            tower_type: t.tower_type || "TOWER",
            warehouse_id: t.warehouse_id || warehouseId,
            tower_order: t.tower_order || 1,
          }));
          setModules(nextModules);
        }

        const rawWFloors = getElements(wFloorData);
        if (rawWFloors.length > 0) {
          setWarehouseFloors(rawWFloors);
          if (!currentWarehouseFloorId) {
            const firstFloor = rawWFloors[0];
            setCurrentWarehouseFloorId(firstFloor.id.toString());
          }
        }

        const rawZoneTypes = getElements(zoneTypeData);
        if (rawZoneTypes.length > 0) {
          setZoneTypes(rawZoneTypes);
        }

        const rawWarehouses = getElements(warehouseListData);
        if (rawWarehouses.length > 0) {
          setWarehouses(rawWarehouses);

          const wDetail = rawWarehouses.find((w: any) => w.id === warehouseId);
          if (wDetail) {
            setWarehouseName(wDetail.name || "");
            if (wDetail.row) setRows(wDetail.row);
            // lưu số dãy vào state
            if (wDetail.column) setColumns(wDetail.column);
            //lưu số cột vào state
            if (wDetail.number_floor) setFloorsCount(wDetail.number_floor);
            if (wDetail.number_tower) setModulesCount(wDetail.number_tower);
          }
        }

        const rawAllProducts = getElements(allProductData);
        if (rawAllProducts.length > 0) {
          setAllProducts(rawAllProducts);
        }

        const rawDevices = getElements(deviceData);
        if (rawDevices.length > 0) {
          setAllDevices(rawDevices);
        }

        if (deviceTypeData?.success) {
          const rawDeviceTypes = getElements(deviceTypeData.data);
          setAllDeviceTypes(rawDeviceTypes);
        }

        const rawLocations = getElements(locationData);
        if (rawLocations.length > 0) {
          setAllLocations(rawLocations);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [warehouseId, globalRefreshCounter]);

  // đồng bộ hóa và cập nhật tức thời vị trí của shuttle cũng như các ô 
  //khi có sự thay đổi từ hệ thống thực tế (backend gửi tín hiệu qua Socket.IO
  useWarehouseSocket({
    socket,
    warehouseId,
    setAllLocations,
    setAllDevices
  });

  // Initial floor selection logic
  React.useEffect(() => {
    if (warehouseFloors.length > 0 && !currentWarehouseFloorId) {
      setCurrentWarehouseFloorId(warehouseFloors[0].id.toString());
    }
  }, [warehouseFloors, currentWarehouseFloorId]);

  // --- Fetch data for specific floor ---
  React.useEffect(() => {
    if (!warehouseId || !currentWarehouseFloorId) return;

    const fetchFloorData = async () => {
      try {
        const [floorData, zoneData] = await Promise.all([
          getTowerFloor(warehouseId, '', currentWarehouseFloorId),
          getZone(warehouseId, currentWarehouseFloorId),
        ]);

        const rawZones = getElements(zoneData);
        const nextPositions: Record<string, PositionConfig> = {};
        const floorToCoords = new Map<string, string[]>();
        const zoneToCoords = new Map<string, string[]>();

        let nextAreas: AreaConfig[] = [];
        if (rawZones.length > 0) {
          nextAreas = rawZones.map((z: any) => {
            const nodesInZone = z.nodes || z.node || [];
            const positions = nodesInZone.map((n: any) => `${n.y - 1},${n.x - 1}`);

            let areaType = "";
            const zCode = z.zone_type_code || "";
            const zName = z.zone_type_name || "";

            if (zCode === 'INBOUND' || zName.includes("nhập")) areaType = "inbound";
            else if (zCode === 'OUTBOUND' || zName.includes("xuất")) areaType = "outbound";
            else if (zCode === 'CHARGING' || zName.includes("sạc")) areaType = "charging";
            else if (zCode === 'WAITING' || zName.includes("đỗ") || zName.includes("chờ")) areaType = "waiting";
            else if (zCode === 'MOVING' || zName.includes("đường đi") || zName.includes("moving")) areaType = "moving";
            else if (zCode === 'STORAGE' || zName.includes("chứa hàng") || zName.includes("lưu trữ") || zName.includes("storage")) areaType = "storage";
            else if (zCode === 'LIFTER' || zName.includes("lifter")) areaType = "lifter";

            // Process nodes within this zone to build positions
            nodesInZone.forEach((n: any) => {
              const fId = (n.tower_floor_id || '').toString();
              const zId = z.id.toString();
              const coord = `${n.y - 1},${n.x - 1}`;
              const fullKey = `wFloor_${currentWarehouseFloorId}:${coord}`;

              const mask = n.neighbor_mask || "0000";
              const directions: DirectionFlags = {
                up: mask[0] === '1',
                right: mask[1] === '1',
                down: mask[2] === '1',
                left: mask[3] === '1'
              };

              const posConfig: PositionConfig = {
                key: fullKey,
                floorId: fId,
                name: n.name || n.code || '',
                directions: directions,
                qrCode: n.qrcode || '',
                areaType: areaType,
                imgName: getSelectedTileName(directions, areaType),
                isNew: false,
                cellKeys: [coord],
                nodeId: n.id?.toString(),
                x: n.x,
                y: n.y,
                z: n.z,
              };

              nextPositions[fullKey] = posConfig;

              if (fId) {
                if (!floorToCoords.has(fId)) floorToCoords.set(fId, []);
                floorToCoords.get(fId)!.push(coord);
              }
              if (zId) {
                if (!zoneToCoords.has(zId)) zoneToCoords.set(zId, []);
                zoneToCoords.get(zId)!.push(coord);
              }
            });

            return {
              id: z.id.toString(),
              floorId: (z.tower_floor_id || '').toString(),
              areaType: areaType,
              name: z.name || '',
              code: z.code || '',
              productGroup: '',
              category_id: allProducts?.find((p: any) => p.id === z.product_id?.toString())?.category_id?.toString(),
              product_id: z.product_id?.toString(),
              nodes: positions,
              importDirection: '',
              isNew: false,
              zoneTypeId: z.zone_type_id?.toString(),
              inbound_direction_x: z.inbound_direction_x,
              inbound_direction_y: z.inbound_direction_y,
            };
          });
        }

        const rawFloors = getElements(floorData);
        let nextFloors: FloorConfig[] = [];
        if (rawFloors.length > 0) {
          nextFloors = rawFloors.map((f: any) => {
            const fId = f.id.toString();
            const nodes = f.node || f.nodes || [];
            const positions = nodes.map((n: any) => `${n.y - 1},${n.x - 1}`);

            // Process nodes from floorData to ensure we have nodeIds even without zones
            nodes.forEach((n: any) => {
              const coord = `${n.y - 1},${n.x - 1}`;
              const fullKey = `wFloor_${currentWarehouseFloorId}:${coord}`;
              if (!nextPositions[fullKey]) {
                const mask = n.neighbor_mask || "0000";
                const directions: DirectionFlags = {
                  up: mask[0] === '1',
                  right: mask[1] === '1',
                  down: mask[2] === '1',
                  left: mask[3] === '1'
                };
                nextPositions[fullKey] = {
                  key: fullKey,
                  floorId: fId,
                  name: n.name || n.code || '',
                  directions: directions,
                  qrCode: n.qrcode || '',
                  areaType: '',
                  imgName: getSelectedTileName(directions, ''),
                  isNew: false,
                  cellKeys: [coord],
                  nodeId: n.id?.toString(),
                  x: n.x,
                  y: n.y,
                  z: n.z,
                };
              } else {
                if (!nextPositions[fullKey].nodeId) {
                  nextPositions[fullKey].nodeId = n.id?.toString();
                }
              }
            });

            return {
              id: fId,
              moduleId: (f.tower_id || '').toString(),
              warehouseFloorId: currentWarehouseFloorId,
              name: f.name || `Tầng`,
              nodes: positions,
              devices: (f.devices || []).map((d: any) => ({
                id: (d.id || d.device_id)?.toString(),
                purpose: d.purpose || 'MULTIPLE'
              })),
              isNew: false
            };
          });
        }

        setNodes(prev => {
          const next = { ...prev };
          // Clear only the nodes belonging to the current warehouse floor ID to avoid duplication
          const prefix = `wFloor_${currentWarehouseFloorId}:`;
          Object.keys(next).forEach(k => { if (k.startsWith(prefix)) delete next[k]; });
          return { ...next, ...nextPositions };
        });
        setPositionItems(Object.values(nextPositions).filter(p => p.qrCode || p.name));

        setFloors(nextFloors.map(f => ({
          ...f,
          nodes: (f.nodes && f.nodes.length > 0) ? f.nodes : (floorToCoords.get(f.id) || [])
        })));
        setAreas(nextAreas.map(a => ({
          ...a,
          nodes: (a.nodes && a.nodes.length > 0) ? a.nodes : (zoneToCoords.get(a.id) || [])
        })));
      } catch (err) {
        console.error("[WarehouseContext] Error fetching floor data:", err);
      }
    };

    fetchFloorData();
  }, [warehouseId, currentWarehouseFloorId, floorRefreshCounter, globalRefreshCounter]);

  // --- Module ---
  /**
   * Cập nhật thông tin của Module
   * @param id ID của module cần cập nhật
   * @param data Dữ liệu mới cập nhật
   */
  const updateModule = useCallback((id: string, data: Partial<TowerProps>) => {
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        const hasChanged = Object.entries(data).some(([key, value]) => (m as any)[key] !== value);
        if (hasChanged) return { ...m, ...data, isModified: true };
      }
      return m;
    }));
  }, []);

  // --- Floor --- thêm tầng
  /** Thêm một tầng mới vào tầng vật lý hiện tại */
  const addFloor = useCallback(() => {
    if (!currentWarehouseFloorId) return;
    const newId = genId();
    setFloors(prev => [...prev, { id: newId, moduleId: '', warehouseFloorId: currentWarehouseFloorId, name: `Tầng module ${prev.length + 1}`, nodes: [], devices: [], isNew: true }]);
    setEditingId(newId);
    setSelectedCells(new Set());
    setInitialEditingKeys(new Set());
  }, [currentWarehouseFloorId]);

  /** Cập nhật thông tin chi tiết của tầng (tên, module, thiết bị) */
  const updateFloor = useCallback((id: string, data: Partial<FloorConfig>) => {
    setFloors(prev => prev.map(f => {
      if (f.id === id) {
        const hasChanged = Object.entries(data).some(([key, value]) => {
          if (Array.isArray(value) && Array.isArray((f as any)[key])) {
            return JSON.stringify(value) !== JSON.stringify((f as any)[key]);
          }
          return (f as any)[key] !== value;
        });
        if (hasChanged) return { ...f, ...data, isModified: true };
      }
      return f;
    }));
  }, []);

  /** Xóa một tầng và dọn dẹp các khu vực, vị trí thuộc tầng đó */
  const removeFloor = useCallback((id: string) => {
    setFloors(prev => {
      const floor = prev.find(f => f.id === id);
      if (floor) {
        if (!floor.isNew) {
          setTowerFloorsToDelete(d => [...d, floor]);
        }
        const prefix = `wFloor_${floor.warehouseFloorId}:`;
        setNodes(curr => {
          const next = { ...curr };
          Object.keys(next).forEach(k => {
            if (k.startsWith(prefix)) delete next[k];
          });
          return next;
        });
      }
      return prev.filter(f => f.id !== id);
    });
    setAreas(prev => prev.filter(a => a.floorId !== id));
    setPositionItems(prev => prev.filter(p => p.floorId !== id));
    if (editingId === id) {
      setEditingId(null);
      setSelectedCells(new Set());
    }
  }, [editingId]);

  /** Lưu tọa độ các ô vuông thuộc một tầng */
  const saveFloorNodes = useCallback((floorId: string, ns: string[]) => {
    setFloors(prev => prev.map(f => f.id === floorId ? { ...f, nodes: ns, isModified: true } : f));
  }, []);

  // --- Area --- thêm khu vực
  /** Thêm một khu vực (Zone) mới vào tầng hiện tại */
  const addArea = useCallback((floorId: string) => {
    const newId = genId();
    setAreas(prev => [...prev, {
      id: newId, floorId, areaType: '', name: '', code: '',
      category_id: '', product_id: '', nodes: [], importDirection: '', isNew: true
    }]);
    setEditingId(newId);
    setSelectedCells(new Set());
    setInitialEditingKeys(new Set());
  }, []);

  /** Cập nhật cấu hình của khu vực */
  const updateArea = useCallback((id: string, data: Partial<AreaConfig>) => {
    setAreas(prev => prev.map(a => {
      if (a.id === id) {
        const hasChanged = Object.entries(data).some(([key, value]) => {
          if (Array.isArray(value) && Array.isArray((a as any)[key])) {
            return JSON.stringify(value) !== JSON.stringify((a as any)[key]);
          }
          return (a as any)[key] !== value;
        });
        if (hasChanged) {
          return { ...a, ...data, isModified: true };
        }
      }
      return a;
    }));
  }, []);

  /** Xóa khu vực và reset lại loại khu vực (areaType) của các ô bị ảnh hưởng */
  const removeArea = useCallback((id: string) => {
    setAreas(prev => {
      const area = prev.find(a => a.id === id);
      if (area) {
        if (!area.isNew) {
          setZonesToDelete(d => [...d, id]);
        }
        setNodes(curr => {
          const next = { ...curr };
          const prefix = `wFloor_${currentWarehouseFloorId}:`;
          area.nodes.forEach(p => {
            const fullKey = `${prefix}${p}`;
            if (next[fullKey]) next[fullKey] = { ...next[fullKey], areaType: '' };
          });
          return next;
        });
      }
      return prev.filter(a => a.id !== id);
    });
    if (editingId === id) {
      setEditingId(null);
      setSelectedCells(new Set());
    }
  }, [editingId, currentWarehouseFloorId]);

  /** Lưu tọa độ các ô vuông thuộc một khu vực */
  const saveAreaNodes = useCallback((areaId: string, ns: string[]) => {
    setAreas(prev => prev.map(a => a.id === areaId ? { ...a, nodes: ns, isModified: true } : a));
  }, []);

  // --- Position Items (Sidebar) ---
  /** Thêm mới một vị trí trong sidebar */
  const addPositionItem = useCallback((floorId: string) => {
    const newId = genId();
    setPositionItems(prev => [...prev, {
      key: newId, floorId, name: '', directions: { up: false, down: false, left: false, right: false }, qrCode: '', cellKeys: [], isNew: true
    }]);
    setEditingId(newId);
    setSelectedCells(new Set());
    setInitialEditingKeys(new Set());
  }, []);
  const updatePositionItem = useCallback((id: string, data: Partial<PositionConfig>) => {
    setPositionItems(prev => prev.map(p => p.key === id ? { ...p, ...data } : p));
  }, []);
  const removePositionItem = useCallback((id: string) => {
    setPositionItems(prev => {
      const item = prev.find(p => p.key === id);
      if (item && item.cellKeys) {
        const floorPrefix = `wFloor_${currentWarehouseFloorId}:`;

        const keysToRemove = item.cellKeys.map(k => `${floorPrefix}${k}`);
        setNodes(curr => {
          const next = { ...curr };
          keysToRemove.forEach(k => delete next[k]);
          return next;
        });
      }
      return prev.filter(p => p.key !== id);
    });
  }, [currentWarehouseFloorId]);

  /** Xóa hoàn toàn cấu hình tại các ô đã chỉ định khỏi Map */
  const removeNodes = useCallback((keys: string[]) => {
    const floorPrefix = `wFloor_${currentWarehouseFloorId}:`;
    const fullKeys = keys.map(k => `${floorPrefix}${k}`);
    setNodes(prev => {
      const next = { ...prev };
      fullKeys.forEach(k => delete next[k]);
      return next;
    });
  }, [currentWarehouseFloorId]);

  /** Hủy bỏ những cấu hình mới tạo nhưng chưa được lưu */
  const discardUnsaved = useCallback(() => {
    setFloors(prev => prev.filter(f => !f.isNew));
    setAreas(prev => prev.filter(a => !a.isNew));
    setPositionItems(prev => {
      const unsaved = prev.filter(p => p.isNew);
      const keysToRemove: string[] = [];
      unsaved.forEach(p => {
        const prefix = `wFloor_${currentWarehouseFloorId}:`;
        p.cellKeys?.forEach(k => keysToRemove.push(`${prefix}${k}`));
      });
      if (keysToRemove.length > 0) {
        setNodes(curr => {
          const next = { ...curr };
          keysToRemove.forEach(k => delete next[k]);
          return next;
        });
      }
      return prev.filter(p => !p.isNew);
    });
    setEditingId(null);
    setSelectedCells(new Set());
  }, [currentWarehouseFloorId]);

  // --- Position (Individual Cells) ---
  /**
   * Tạo hoặc cập nhật thông tin cho hàng loạt ô vuông cùng lúc
   * @param keys Danh sách tọa độ (r,c)
   * @param directions Hướng di chuyển
   * @param qrCode Mã QR code 
   * @param areaType Loại khu vực
   */
  const upsertNodes = useCallback((keys: string[], directions: DirectionFlags, qrCode?: string, areaType?: string, preserveDirections?: boolean, name?: string) => {
    // Đảm bảo chỉ tạo/cập nhật map state cho tầng vật lý hiện tại
    const floorPrefix = `wFloor_${currentWarehouseFloorId}:`;

    setNodes(prev => {
      const next = { ...prev };
      keys.forEach(k => {
        const fullKey = `${floorPrefix}${k}`;
        const prevData = next[fullKey];

        const resolvedDirections = (preserveDirections && prevData && hasAnyDirection(prevData.directions)) ? prevData.directions : directions;
        const resolvedAreaType = areaType || prevData?.areaType || '';

        next[fullKey] = {
          key: fullKey,
          floorId: '',
          name: name !== undefined ? name : prevData?.name ?? '',
          directions: resolvedDirections,
          qrCode: qrCode !== undefined ? qrCode : prevData?.qrCode ?? '',
          areaType: resolvedAreaType,
          imgName: getSelectedTileName(resolvedDirections, resolvedAreaType),
          nodeId: prevData?.nodeId
        };
      });
      return next;
    });
  }, [currentWarehouseFloorId]);

  // --- Clone Logic --- nhân bản tầng
  /**
   * Nhân bản cấu hình từ một tầng vật lý sang một tầng vật lý khác
   * (Copy toàn bộ tầng logic, khu vực, vị trí và các node trên bản đồ)
   */
  const copyFloorConfig = useCallback((fromWFloorId: string, toWFloorId: string) => {

    // Lọc ra các cấu hình chỉ thuộc về tầng nguồn
    const fromFloorConfigs = floors.filter(f => f.warehouseFloorId === fromWFloorId);
    // Lọc ra các state map (nodes) chỉ thuộc về tầng nguồn bằng cách check prefix
    const fromCellConfigs = Object.values(nodes).filter(p => p.key.startsWith(`wFloor_${fromWFloorId}:`));

    const clonedFloors: FloorConfig[] = [];
    const clonedAreas: AreaConfig[] = [];
    const clonedPosItems: PositionConfig[] = [];

    // Duyệt qua các tầng logic của tầng nguồn (ví dụ: Tầng module 1, Tầng module 2...)
    fromFloorConfigs.forEach(f => {
      const newFId = genId(); // Tạo ID mới cho tầng copy
      clonedFloors.push({ ...f, id: newFId, warehouseFloorId: toWFloorId, isNew: false });

      // Copy các khu vực thuộc về tầng logic này
      const floorAreas = areas.filter(a => a.floorId === f.id);
      floorAreas.forEach(a => clonedAreas.push({ ...a, id: genId(), floorId: newFId, isNew: false }));

      // Copy các vị trí thiết lập (sidebar items) thuộc về tầng logic này
      const floorPosItems = positionItems.filter(p => p.floorId === f.id);
      floorPosItems.forEach(p => clonedPosItems.push({ ...p, key: genId(), floorId: newFId, isNew: false }));
    });

    // Chuyển đổi prefix cho tọa độ của map state
    const newCellConfigs: Record<string, PositionConfig> = {};
    fromCellConfigs.forEach(p => {
      const newKey = p.key.replace(`wFloor_${fromWFloorId}:`, `wFloor_${toWFloorId}:`);
      newCellConfigs[newKey] = { ...p, key: newKey, floorId: '' };
    });

    // console.log(`[Context] Clone hoàn tất. Tầng: ${clonedFloors.length}, Khu vực: ${clonedAreas.length}, Vị trí (sidebar): ${clonedPosItems.length}, Map cells: ${Object.keys(newCellConfigs).length}`);

    // Batch updates
    setFloors(prev => [...prev.filter(f => f.warehouseFloorId !== toWFloorId), ...clonedFloors]);
    setAreas(prev => {
      const targetFloorIds = floors.filter(f => f.warehouseFloorId === toWFloorId).map(f => f.id);
      return [...prev.filter(a => !targetFloorIds.includes(a.floorId)), ...clonedAreas];
    });
    setPositionItems(prev => {
      const targetFloorIds = floors.filter(f => f.warehouseFloorId === toWFloorId).map(f => f.id);
      return [...prev.filter(p => !targetFloorIds.includes(p.floorId)), ...clonedPosItems];
    });
    setNodes(prev => {
      const next = { ...prev };
      // Remove old cells of target floor
      const targetPrefix = `wFloor_${toWFloorId}:`;
      Object.keys(next).forEach(k => { if (k.startsWith(targetPrefix)) delete next[k]; });
      // Add new cloned cells
      return { ...next, ...newCellConfigs };
    });
  }, [areas, positionItems, nodes, floors]);

  const clearModifiedFlags = useCallback(() => {
    setModules(prev => prev.map(m => ({ ...m, isNew: false, isModified: false })));
    setFloors(prev => prev.map(f => ({ ...f, isNew: false, isModified: false })));
    setAreas(prev => prev.map(a => ({ ...a, isNew: false, isModified: false })));
  }, []);

  // --- Derived ---
  const getAllFloorNodes = useCallback(() => {
    const set = new Set<string>();
    floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId).forEach(f => f.nodes.forEach(p => set.add(p)));
    return set;
  }, [floors, currentWarehouseFloorId]);

  const getAllAreaNodes = useCallback(() => {
    const set = new Set<string>();
    const floorIds = floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId).map(f => f.id);
    areas.filter(a => floorIds.includes(a.floorId)).forEach(a => a.nodes.forEach(p => set.add(p)));
    return set;
  }, [areas, floors, currentWarehouseFloorId]);

  const getTakenCells = useCallback((tab: TabKey, excludeId?: string) => {
    const set = new Set<string>();
    if (tab === 'floor') {
      floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId && f.id !== excludeId).forEach(f => f.nodes.forEach(p => set.add(p)));
    } else if (tab === 'area') {
      const floorIds = floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId).map(f => f.id);
      areas.filter(a => floorIds.includes(a.floorId) && a.id !== excludeId).forEach(a => a.nodes.forEach(p => set.add(p)));
    } else if (tab === 'position') {
      const floorIds = floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId).map(f => f.id);
      positionItems.filter(p => floorIds.includes(p.floorId) && p.key !== excludeId).forEach(p => p.cellKeys?.forEach(k => set.add(k)));
    }
    return set;
  }, [floors, areas, positionItems, currentWarehouseFloorId]);

  const getFloorNodes = useCallback((floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    return new Set(floor?.nodes ?? []);
  }, [floors]);

  const restoreSnapshot = useCallback((snapshot: any) => {
    if (snapshot.modules) setModules(snapshot.modules);
    if (snapshot.floors) setFloors(snapshot.floors);
    if (snapshot.areas) setAreas(snapshot.areas);
    if (snapshot.nodes) setNodes(snapshot.nodes);
    if (snapshot.positionItems) setPositionItems(snapshot.positionItems);
  }, []);
  const setSelectedCategories = useCallback((id: string) => {
    setSelectedCategory(id);
    // console.log('selected category: ', id);

  }, []);
  const contextValue = React.useMemo(() => ({
    modules, floors, areas, nodes, positionItems,
    images, rows, columns,
    floorsCount, modulesCount, warehouseName,
    activeTab, selectedCells, scale, editingId,
    updateModule,
    addFloor, updateFloor, removeFloor, saveFloorNodes,
    addArea, updateArea, removeArea, saveAreaNodes,
    addPositionItem, updatePositionItem, removePositionItem, discardUnsaved,
    upsertNodes, removeNodes, copyFloorConfig, clearModifiedFlags,
    setActiveTab, setSelectedCells, setScale, setEditingId, setInitialEditingKeys,
    getAllFloorNodes, getAllAreaNodes, getTakenCells, getFloorNodes,
    initialEditingKeys,
    posDirections, setPosDirections,
    posName, setPosName,
    posQrCode, setPosQrCode,
    selectedCategory, products, categories, setSelectedCategories,
    warehouseFloors, currentWarehouseFloorId, setCurrentWarehouseFloorId,
    zoneTypes, warehouses, restoreSnapshot, isLoading, refreshGlobal, refreshFloor,
    allProducts, allDevices, allDeviceTypes, allLocations,
    zonesToDelete, towerFloorsToDelete, clearDeleteQueue, readOnly
  }), [
    modules, floors, areas, nodes, positionItems,
    images, rows, columns,
    floorsCount, modulesCount, warehouseName,
    activeTab, selectedCells, scale, editingId,
    updateModule,
    addFloor, updateFloor, removeFloor, saveFloorNodes,
    addArea, updateArea, removeArea, saveAreaNodes,
    addPositionItem, updatePositionItem, removePositionItem, discardUnsaved,
    upsertNodes, removeNodes, copyFloorConfig, clearModifiedFlags,
    setActiveTab, setSelectedCells, setScale, setEditingId, setInitialEditingKeys,
    getAllFloorNodes, getAllAreaNodes, getTakenCells, getFloorNodes,
    initialEditingKeys,
    posDirections, setPosDirections,
    posName, setPosName,
    posQrCode, setPosQrCode,
    selectedCategory, products, categories, setSelectedCategories,
    warehouseFloors, currentWarehouseFloorId, setCurrentWarehouseFloorId,
    zoneTypes, warehouses, restoreSnapshot, isLoading, refreshGlobal, refreshFloor,
    allProducts, allDevices, allDeviceTypes, allLocations,
    zonesToDelete, towerFloorsToDelete, clearDeleteQueue, readOnly
  ]);

  return (
    <WarehouseConfigContext.Provider value={contextValue}>
      {children}
    </WarehouseConfigContext.Provider>
  );
};
