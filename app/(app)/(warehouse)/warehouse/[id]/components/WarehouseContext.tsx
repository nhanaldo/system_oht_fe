'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { hasAnyDirection, getSelectedTileName } from './warehouse-types';
import type {
  TabKey, AreaConfig, PositionConfig, DirectionFlags
} from './warehouse-types';
import { getZone, getZoneType, getWarehouse, getWarehouseById, getCategory, getProduct, getDevices, getLocations, getNodeEdges } from '../../warehouseAcction';
// import { getDeviceTypes } from '@/app/(app)/workflows/list/workflowsAction';
import { MOCK_ZONE_TYPES } from '../mockdata';
interface WarehouseConfigContextType {
  // Data
  areas: AreaConfig[];
  categories: any[];
  selectedCategory: string;
  setSelectedCategories: (id: string) => void;
  products: any[];
  allProducts: any[];

  positionItems: PositionConfig[];
  images: Record<string, HTMLImageElement>;
  rows: number;
  columns: number;
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
  addArea: () => void;
  updateArea: (id: string, data: Partial<AreaConfig>) => void;
  removeArea: (id: string) => void;
  saveAreaNodes: (areaId: string, nodes: string[]) => void;
  addPositionItem: () => void;
  updatePositionItem: (id: string, data: Partial<PositionConfig>) => void;
  removePositionItem: (id: string) => void;
  upsertNodes: (keys: string[], directions: DirectionFlags, qrCode?: string, areaType?: string, preserveDirections?: boolean, name?: string) => void;
  removeNodes: (keys: string[]) => void;
  discardUnsaved: () => void;
  clearModifiedFlags: () => void;

  // UI actions
  setActiveTab: (tab: TabKey) => void;
  setSelectedCells: (cells: Set<string>) => void;
  setScale: (s: number) => void;
  getAllAreaNodes: () => Set<string>;
  getTakenCells: (tab: TabKey, excludeId?: string) => Set<string>;
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
  routeType: string | null;
  setRouteType: (v: string | null) => void;
  curveAngle: string | null;
  setCurveAngle: (v: string | null) => void;
  routeControlPoint: { x: number, y: number } | null;
  setRouteControlPoint: (v: { x: number, y: number } | null) => void;
  curveDirection: string | null;
  setCurveDirection: (v: string | null) => void;
  routeDirection: 'left' | 'right' | 'left_right' | '';
  setRouteDirection: (v: 'left' | 'right' | 'left_right' | '') => void;
  routes: import('./warehouse-types').RouteConfig[];
  addRoute: (route: import('./warehouse-types').RouteConfig) => void;
  updateRoute: (routeId: string, updatedFields: Partial<import('./warehouse-types').RouteConfig>) => void;
  zoneTypes: any[];
  warehouses: any[];
  restoreSnapshot: (snapshot: any) => void;
  isLoading: boolean;
  refreshGlobal: () => void;
  refreshFloor: () => void;
  zonesToDelete: string[];
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
export const WarehouseConfigProvider: React.FC<{
  children: React.ReactNode;
  warehouseId: string;
  initialRows?: number;
  initialColumns?: number;
  initialModules?: number;
  initialFloors?: number;
  readOnly?: boolean;
}> = ({ children, warehouseId, initialRows = 14, initialColumns = 38, initialModules = 1, initialFloors = 1, readOnly = false }) => {
  const [rows, setRows] = useState(initialRows);
  const [columns, setColumns] = useState(initialColumns);
  const [warehouseName, setWarehouseName] = useState("");
  const [areas, setAreas] = useState<AreaConfig[]>([]);
  const [nodes, setNodes] = useState<Record<string, PositionConfig>>({});
  const [positionItems, setPositionItems] = useState<PositionConfig[]>([]);

  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [allDeviceTypes, setAllDeviceTypes] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);

  const [zoneTypes, setZoneTypes] = useState<any[]>(MOCK_ZONE_TYPES);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zonesToDelete, setZonesToDelete] = useState<string[]>([]);

  const clearDeleteQueue = useCallback(() => {
    setZonesToDelete([]);
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

  const [activeTab, setActiveTab] = useState<TabKey>('area');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialEditingKeys, setInitialEditingKeys] = useState<Set<string>>(new Set());

  const [posDirections, setPosDirections] = useState<DirectionFlags>({ up: false, down: false, left: false, right: false });
  const [posName, setPosName] = useState("");
  const [posQrCode, setPosQrCode] = useState("");

  const [routeType, setRouteType] = useState<string | null>(null);
  const [curveAngle, setCurveAngle] = useState<string | null>(null);
  const [routeControlPoint, setRouteControlPoint] = useState<{ x: number, y: number } | null>(null);
  const [curveDirection, setCurveDirection] = useState<string | null>(null);
  const [routeDirection, setRouteDirection] = useState<'left' | 'right' | 'left_right' | ''>('');
  const [routes, setRoutes] = useState<import('./warehouse-types').RouteConfig[]>([]);

  const addRoute = useCallback((route: import('./warehouse-types').RouteConfig) => {
    setRoutes(prev => [...prev, route]);
  }, []);

  const updateRoute = useCallback((routeId: string, updatedFields: Partial<import('./warehouse-types').RouteConfig>) => {
    setRoutes(prev => prev.map(rt => rt.id === routeId ? { ...rt, ...updatedFields } : rt));
  }, []);

  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  React.useEffect(() => {
    const svgNames = [
      'node.svg',
      'left_bottom.svg',
      'right_bottom.svg',
      'straight_line.svg',
      'top_left.svg',
      'top_right.svg',
      'bypass.svg',
      'charging.svg',
      'inbound.svg',
      'maintenance.svg',
      'outbound.svg',
      'waiting.svg',
      'left.svg',
      'right.svg',
      'left_right.svg'
    ];

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
        const [zoneTypeData, warehouseListData, allProductData, deviceData, deviceTypeData] = await Promise.all([
          getZoneType(),
          getWarehouse({ page: 1, limit: 100 }),
          getProduct(warehouseId, ''),
          getDevices(warehouseId, { page: 1, limit: 1000 }),
          // getDeviceTypes(),
          getLocations(warehouseId, { page: 1, limit: 1000 }),
        ]);

        const rawZoneTypes = getElements(zoneTypeData);
        if (rawZoneTypes && rawZoneTypes.length > 0) {
          setZoneTypes(rawZoneTypes);
        } else {
          setZoneTypes(MOCK_ZONE_TYPES);
        }

        const rawWarehouses = getElements(warehouseListData);
        if (rawWarehouses.length > 0) {
          setWarehouses(rawWarehouses);

          const wDetail = rawWarehouses.find((w: any) => (w.id || w.ID)?.toString() === warehouseId);
          if (wDetail) {
            setWarehouseName(wDetail.name || wDetail.Name || "");
            const rVal = wDetail.row || wDetail.Row;
            const cVal = wDetail.column || wDetail.Column;
            if (rVal) setRows(Number(rVal));
            // lưu số dãy vào state
            if (cVal) setColumns(Number(cVal));
            //lưu số cột vào state
          }
        }

        const rawAllProducts = getElements(allProductData);
        if (rawAllProducts.length > 0) {
          setAllProducts(rawAllProducts);
        }


      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [warehouseId, globalRefreshCounter]);

 

  // --- Fetch data for specific floor ---
  React.useEffect(() => {
    if (!warehouseId) return;

    const fetchFloorData = async () => {
      try {
        const [zoneData, nodeEdgesData] = await Promise.all([
          getZone(warehouseId),
          getNodeEdges(warehouseId)
        ]);

        let rawZones = getElements(zoneData);
        if (!rawZones) {
          rawZones = [];
        }

        let rawEdges = getElements(nodeEdgesData);
        if (!rawEdges) rawEdges = [];
        const nextPositions: Record<string, PositionConfig> = {};
        const zoneToCoords = new Map<string, string[]>();

        let nextAreas: AreaConfig[] = [];
        if (rawZones.length > 0) {
          nextAreas = rawZones.map((z: any) => {
            const nodesInZone = z.nodes || z.node || [];

            const getCoord = (n: any) => {
              const xVal = n.X ?? n.x ?? 0;
              const yVal = n.Y ?? n.y ?? 0;
              // Remove -1 since backend stores 0-based coordinates from frontend
              return `${yVal},${xVal}`;
            };

            const positions = nodesInZone.map((n: any) => getCoord(n));

            let areaType = "";
            const zCode = z.zone_type_code || z.zone_type || "";
            const zName = z.zone_type_name || ""; 

            if (zCode === 'PICKING' || zName.includes("lấy hàng")) areaType = "inbound";
            else if (zCode === 'DROPPING' || zName.includes("bỏ hàng")) areaType = "outbound";
            else if (zCode === 'CHARGING' || zName.includes("sạc") || zCode === 'sạc') areaType = "charging";
            else if (zCode === 'PARKING' || zName.includes("đỗ")) areaType = "waiting";
            else if (zCode === 'MOVING' || zName.includes("đường đi")) areaType = "moving";
            else if (zCode === 'BYPASS' || zName.includes("đường tránh")) areaType = "bypass";
            else if (zCode === 'MAINTENANCE' || zName.includes("bảo trì")) areaType = "maintenance";


            // Process nodes within this zone to build positions
            nodesInZone.forEach((n: any) => {
              const zId = z.id?.toString() || z.ID?.toString() || "";
              const coord = getCoord(n);
              const fullKey = `node_${coord}`;

              const mask = n.neighbor_mask || "0000";
              const directions: DirectionFlags = {
                up: mask[0] === '1',
                right: mask[1] === '1',
                down: mask[2] === '1',
                left: mask[3] === '1'
              };

              const posConfig: PositionConfig = {
                key: fullKey,
                name: n.name || n.Name || n.code || n.Code || '',
                directions: directions,
                qrCode: n.qrcode || n.QRCode || '',
                areaType: areaType,
                imgName: getSelectedTileName(directions, areaType),
                isNew: false,
                cellKeys: [coord],
                nodeId: n.id?.toString() || n.ID?.toString(),
                x: n.X ?? n.x,
                y: n.Y ?? n.y,
                z: n.Z ?? n.z,
              };

              nextPositions[fullKey] = posConfig;

              if (zId) {
                if (!zoneToCoords.has(zId)) zoneToCoords.set(zId, []);
                zoneToCoords.get(zId)!.push(coord);
              }
            });

            return {
              id: z.id.toString(),
              areaType: areaType,
              name: z.name || '',
              code: z.code || '',
              description: z.description || '',
              productGroup: '',
              category_id: allProducts?.find((p: any) => p.id === z.product_id?.toString())?.category_id?.toString(),
              product_id: z.product_id?.toString(),
              nodes: positions,
              importDirection: '',
              isNew: false,
              zoneTypeId: z.zone_type || z.zone_type_id?.toString() || "",
              inbound_direction_x: z.inbound_direction_x,
              inbound_direction_y: z.inbound_direction_y,
            };
          });
        }

        setNodes(nextPositions);
        setPositionItems(Object.values(nextPositions).filter(p => p.qrCode || p.name));

        setAreas(nextAreas.map(a => ({
          ...a,
          nodes: (a.nodes && a.nodes.length > 0) ? a.nodes : (zoneToCoords.get(a.id) || [])
        })));

        const nextRoutes: import('./warehouse-types').RouteConfig[] = rawEdges.map((edge: any, index: number) => {
           const fromId = edge.from_node_id?.toString() || edge.FromNodeID?.toString();
           const toId = edge.to_node_id?.toString() || edge.ToNodeID?.toString();
           const fromPos = Object.values(nextPositions).find(p => p.nodeId === fromId);
           const toPos = Object.values(nextPositions).find(p => p.nodeId === toId);
           
           let rDir = 'right';
           const directionNum = edge.direction || edge.Direction;
           if (directionNum === 2) rDir = 'left';
           else if (directionNum === 3) rDir = 'left_right';

           const config = edge.config || edge.Config || {};

           return {
             id: (edge.ID || edge.id || Date.now() + index).toString(),
             name: `Tuyến đường ${index + 1}`,
             cells: [fromPos?.cellKeys?.[0], toPos?.cellKeys?.[0]].filter(Boolean) as string[],
             routeType: (edge.edge_type === 'CURVE' || edge.EdgeType === 'CURVE') ? 'Arc tròn' : 'Đường thẳng',
             curveDirection: config.curve_dir || null,
             curveAngle: config.curvature || null,
             controlPoint: (config.curve_x !== undefined && config.curve_y !== undefined) ? { x: config.curve_x, y: config.curve_y } : null,
             routeDirection: rDir,
             distance: edge.distance || edge.Distance || 0,
             speed: edge.max_speed || edge.MaxSpeed || 0
           };
        });
        setRoutes(nextRoutes);
      } catch (err) {
        console.error("[WarehouseContext] Error fetching floor data:", err);
      }
    };

    fetchFloorData();
  }, [warehouseId, floorRefreshCounter, globalRefreshCounter]);





  // --- Area --- thêm khu vực
  /** Thêm một khu vực (Zone) mới vào tầng hiện tại */
  const addArea = useCallback(() => {
    const newId = genId();
    setAreas(prev => [...prev, {
      id: newId, areaType: '', name: '', code: '', description: '',
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
          const prefix = `node_`;
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
  }, [editingId]);

  /** Lưu tọa độ các ô vuông thuộc một khu vực */
  const saveAreaNodes = useCallback((areaId: string, ns: string[]) => {
    setAreas(prev => prev.map(a => a.id === areaId ? { ...a, nodes: ns, isModified: true } : a));
  }, []);

  const addPositionItem = useCallback(() => {
    const newId = genId();
    setPositionItems(prev => [...prev, {
      key: newId, name: '', directions: { up: false, down: false, left: false, right: false }, qrCode: '', cellKeys: [], isNew: true
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
        const floorPrefix = `node_`;

        const keysToRemove = item.cellKeys.map(k => `${floorPrefix}${k}`);
        setNodes(curr => {
          const next = { ...curr };
          keysToRemove.forEach(k => delete next[k]);
          return next;
        });
      }
      return prev.filter(p => p.key !== id);
    });
  }, []);

  /** Xóa hoàn toàn cấu hình tại các ô đã chỉ định khỏi Map */
  const removeNodes = useCallback((keys: string[]) => {
    const floorPrefix = `node_`;
    const fullKeys = keys.map(k => `${floorPrefix}${k}`);
    setNodes(prev => {
      const next = { ...prev };
      fullKeys.forEach(k => delete next[k]);
      return next;
    });
  }, []);

  const discardUnsaved = useCallback(() => {
    setAreas(prev => prev.filter(a => !a.isNew));
    setPositionItems(prev => {
      const unsaved = prev.filter(p => p.isNew);
      const keysToRemove: string[] = [];
      unsaved.forEach(p => {
        const prefix = `node_`;
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
  }, []);

  // --- Position (Individual Cells) ---
  /**
   * Tạo hoặc cập nhật thông tin cho hàng loạt ô vuông cùng lúc
   * @param keys Danh sách tọa độ (r,c)
   * @param directions Hướng di chuyển
   * @param qrCode Mã QR code 
   * @param areaType Loại khu vực
   */
  const upsertNodes = useCallback((keys: string[], directions: DirectionFlags, qrCode?: string, areaType?: string, preserveDirections: boolean = false, name?: string) => {
    const floorPrefix = `node_`;

    setNodes(prev => {
      const next = { ...prev };
      keys.forEach(k => {
        const fullKey = `${floorPrefix}${k}`;
        const prevData = next[fullKey];

        const resolvedDirections = (preserveDirections && prevData && hasAnyDirection(prevData.directions)) ? prevData.directions : directions;
        const resolvedAreaType = areaType || prevData?.areaType || '';

        next[fullKey] = {
          key: fullKey,
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
  }, []);



  const clearModifiedFlags = useCallback(() => {
    setAreas(prev => prev.map(a => ({ ...a, isNew: false, isModified: false })));
  }, []);

  // --- Derived ---
  const getAllAreaNodes = useCallback(() => {
    const set = new Set<string>();
    areas.forEach(a => a.nodes.forEach(p => set.add(p)));
    return set;
  }, [areas]);

  const getTakenCells = useCallback((tab: TabKey, excludeId?: string) => {
    const set = new Set<string>();
    if (tab === 'area') {
      areas.filter(a => a.id !== excludeId).forEach(a => a.nodes.forEach(p => set.add(p)));
    } else if (tab === 'position' || tab === 'route') {
      positionItems.filter(p => p.key !== excludeId).forEach(p => p.cellKeys?.forEach(k => set.add(k)));
    }
    return set;
  }, [areas, positionItems]);



  const restoreSnapshot = useCallback((snapshot: any) => {
    if (snapshot.areas) setAreas(snapshot.areas);
    if (snapshot.nodes) setNodes(snapshot.nodes);
    if (snapshot.positionItems) setPositionItems(snapshot.positionItems);
  }, []);
  const setSelectedCategories = useCallback((id: string) => {
    setSelectedCategory(id);
    // console.log('selected category: ', id);

  }, []);
  const contextValue = React.useMemo(() => ({
    areas, nodes, positionItems,
    images, rows, columns,
    warehouseName,
    activeTab, selectedCells, scale, editingId,
    addArea, updateArea, removeArea, saveAreaNodes,
    addPositionItem, updatePositionItem, removePositionItem, discardUnsaved,
    upsertNodes, removeNodes, clearModifiedFlags,
    setActiveTab, setSelectedCells, setScale, setEditingId, setInitialEditingKeys,
    getAllAreaNodes, getTakenCells,
    initialEditingKeys,
    posDirections, setPosDirections,
    posName, setPosName,
    posQrCode, setPosQrCode,
    routeType, setRouteType, curveAngle, setCurveAngle, routeControlPoint, setRouteControlPoint, curveDirection, setCurveDirection,
    routeDirection, setRouteDirection, routes, addRoute, updateRoute,
    selectedCategory, products, categories, setSelectedCategories,
    zoneTypes, warehouses, restoreSnapshot, isLoading, refreshGlobal, refreshFloor,
    allProducts, allDevices, allDeviceTypes, allLocations,
    zonesToDelete, clearDeleteQueue, readOnly
  }), [
    areas, nodes, positionItems,
    images, rows, columns,
    warehouseName,
    activeTab, selectedCells, scale, editingId,
    addArea, updateArea, removeArea, saveAreaNodes,
    addPositionItem, updatePositionItem, removePositionItem, discardUnsaved,
    upsertNodes, removeNodes, clearModifiedFlags,
    setActiveTab, setSelectedCells, setScale, setEditingId, setInitialEditingKeys,
    getAllAreaNodes, getTakenCells,
    initialEditingKeys,
    posDirections, setPosDirections,
    posName, setPosName,
    posQrCode, setPosQrCode,
    routeType, setRouteType, curveAngle, setCurveAngle, routeControlPoint, setRouteControlPoint, curveDirection, setCurveDirection,
    routeDirection, setRouteDirection, routes, addRoute, updateRoute,
    selectedCategory, products, categories, setSelectedCategories,
    zoneTypes, warehouses, restoreSnapshot, isLoading, refreshGlobal, refreshFloor,
    allProducts, allDevices, allDeviceTypes, allLocations,
    zonesToDelete, clearDeleteQueue, readOnly
  ]);

  return (
    <WarehouseConfigContext.Provider value={contextValue}>
      {children}
    </WarehouseConfigContext.Provider>
  );
};
