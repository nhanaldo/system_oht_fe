"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Collapse, Segmented, Switch, Checkbox, ConfigProvider, Modal, Select, Slider } from "antd";
import { DownOutlined, PlusCircleFilled, EditFilled, DeleteFilled, ExclamationCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomInput from "@/components/ui/CustomInput";
import CustomSelect from "@/components/ui/CustomSelect";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import LoadingComponent from "@/components/ui/LoadingComponent";
import WarehouseMap from "./WarehouseMap";
import { WarehouseConfigProvider, useWarehouseConfig } from "./WarehouseContext";
import {
    type TabKey, type AreaConfig, type DirectionFlags,
} from "./warehouse-types";
import { getSelectedTileName } from "./warehouse-types";
import { useNotify } from "@/hook/notification/NotificationProvider";
import {
    type ZoneCreateProps, type ZoneUpdateProps, type NodeProps,
    updateZone,
    createZone,
    updateZoneById,
    NodeBulkProps,
    bulkDeleteZones,
    getNodeById,
    updateNodeDetails,
    createNodeEdge,
} from "../../warehouseAcction";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import { log } from "console";

/* ============================
   Tab Segment labels
   ============================ */
// Menu cấu hình & Sidebar
//Là thành phần bao bọc bên ngoài và là thanh Sidebar bên trái để người dùng tương tác, nhập liệu
// File này bọc toàn bộ ứng dụng bằng <WarehouseConfigProvider> ở cuối file.

const TAB_OPTIONS: { value: TabKey; label: string }[] = [
    { value: "area", label: "Khu vực" },
    { value: "position", label: "Vị trí" },
    { value: "route", label: "Tuyến đường" },
];

const ZONE_TYPE_MAP: Record<string, string> = {
    'CHARGING': 'charging',
    'MOVING': 'moving',
    'PARKING': 'waiting',
    'PICKING': 'inbound',
    'DROPPING': 'outbound',
    'BYPASS': 'bypass',
    'MAINTENANCE': 'maintenance'
};

/* ============================
   Collapse styling shared
   ============================ */
const collapseStyles = {
    header: {
        height: 40,
        display: "flex",
        alignItems: "center",
        background: "#ffffff",
        fontSize: "14px",
        fontWeight: 400,
        borderRadius: 0,
        borderWidth: 0,
        borderStyle: "none",
    },
    body: {
        padding: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderStyle: "none",
    },
};

/* ============================
   Main layout (inner, uses context)// nhận các sự kiện từ map
   ============================ */
function ProfileInner({ id }: { id: string }) {
    const notify = useNotify();
    const { success, error, warning } = notify;
    const [modal, contextHolder] = Modal.useModal();
    const ctx = useWarehouseConfig();
    const {
        areas, nodes: savedNodes,
        positionItems, addPositionItem, updatePositionItem, removePositionItem, discardUnsaved,
        activeTab, setActiveTab, selectedCells,
        addArea, updateArea, removeArea, saveAreaNodes,
        upsertNodes, removeNodes, setSelectedCells,
        editingId, setEditingId, initialEditingKeys, setInitialEditingKeys,
        clearModifiedFlags,
        posDirections, setPosDirections, posName, setPosName, posQrCode, setPosQrCode,
        routeType, setRouteType, curveAngle, setCurveAngle, routeControlPoint, setRouteControlPoint, curveDirection, setCurveDirection,
        routeDirection, setRouteDirection,
        routes, addRoute,
        zoneTypes, warehouses, restoreSnapshot,
        isLoading, refreshGlobal, refreshFloor,
        categories, products, setSelectedCategories, allDevices,
        zonesToDelete, clearDeleteQueue
    } = useWarehouseConfig();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const showMap = true;
    //Đoạn code kiểm tra trạng thái chọn trên Sidebar để ẩn/hiển thị form nhập code và đổi
    const isSingleSelect = selectedCells.size === 1;
    const isMultiSelect = selectedCells.size > 1;

    // Lọc dữ liệu khi chọn và tầng và hiển thị bên sidebar
    // Display all areas and position items since there are no floors anymore
    const filteredAreas = useMemo(() => areas, [areas]);
    const filteredPositionItems = useMemo(() => positionItems, [positionItems]);
    const positionFormRef = React.useRef<{ getPosData: () => any }>(null);



    // Device selection state
    const [deviceSearch, setDeviceSearch] = useState("");

    const groupedDevices = useMemo(() => {
        const groups: Record<string, any[]> = {};
        allDevices.forEach(d => {
            const cat = d.device_type_code || d.device_type_name || 'Khác';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(d);
        });
        return groups;
    }, [allDevices]);

    // Device capability selection per device: deviceId -> selected cap
    const [selectedDeviceCaps, setSelectedDeviceCaps] = useState<Record<string, string>>({});
    const toggleDeviceCap = (deviceId: string, cap: string) => {
        setSelectedDeviceCaps(prev => ({
            ...prev,
            [deviceId]: prev[deviceId] === cap ? '' : cap
        }));
    };

    // Route form state
    const [routeName, setRouteName] = useState("");
    const [routeDistance, setRouteDistance] = useState("");
    const [routeSpeed, setRouteSpeed] = useState("");



    const getRouteDirectionOptions = () => {
        const parts = routeName.split('-');
        let from = 'E4', to = 'F3';
        if (parts.length >= 2) {
            from = parts[0].trim() || 'E4';
            to = parts[1].trim() || 'F3';
        } else if (parts.length === 1 && parts[0].trim()) {
            from = parts[0].trim();
            to = '...';
        }
        return { from, to };
    };
    // chỉ có đường thẳng đúng  thì hiển thị trái phải 
    const isVerticalLine = useMemo(() => {
        if (selectedCells.size === 2) {
            const arr = Array.from(selectedCells);
            const [r1, c1] = arr[0].split(',').map(Number);
            const [r2, c2] = arr[1].split(',').map(Number);
            return c1 === c2; // Only vertical lines have trái/phải
        }
        return false;
    }, [selectedCells]);

    // Tính toán tọa độ control point mặc định nếu người dùng chưa kéo thả
    const defaultControlPoint = useMemo(() => {
        if (routeType !== 'Arc tròn' || selectedCells.size !== 2) return null;
        const CELL_SIZE = 30; // Fixed size map
        const arr = Array.from(selectedCells);
        const [r1, c1] = arr[0].split(',').map(Number);
        const [r2, c2] = arr[1].split(',').map(Number);
        const x1 = c1 * CELL_SIZE + CELL_SIZE / 2;
        const y1 = r1 * CELL_SIZE + CELL_SIZE / 2;
        const x2 = c2 * CELL_SIZE + CELL_SIZE / 2;
        const y2 = r2 * CELL_SIZE + CELL_SIZE / 2;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const L = Math.hypot(dx, dy);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        let Nx = 0, Ny = 0;
        const dirStr = curveDirection?.toLowerCase() || '';
        if (dirStr === 'trái' || dirStr === 'phải') {
            const wantLeft = dirStr === 'trái';
            if (wantLeft) {
                if (dy > 0) { Nx = -dy; Ny = dx; } else { Nx = dy; Ny = -dx; }
            } else {
                if (dy > 0) { Nx = dy; Ny = -dx; } else { Nx = -dy; Ny = dx; }
            }
        } else {
            const wantUp = dirStr === 'trên';
            if (wantUp) {
                if (-dx < 0) { Nx = dy; Ny = -dx; } else { Nx = -dy; Ny = dx; }
            } else {
                if (-dx > 0) { Nx = dy; Ny = -dx; } else { Nx = -dy; Ny = dx; }
            }
        }
        if (L > 0) { Nx /= L; Ny /= L; }
        const angleDegree = (curveAngle !== null && curveAngle !== undefined && curveAngle !== '') ? Number(curveAngle) : 45;
        const scaleDist = angleDegree / 90;
        const cx_bezier = midX + Nx * L * scaleDist;
        const cy_bezier = midY + Ny * L * scaleDist;
        const cx = 0.25 * x1 + 0.5 * cx_bezier + 0.25 * x2;
        const cy = 0.25 * y1 + 0.5 * cy_bezier + 0.25 * y2;

        return { x: cx, y: cy };
    }, [selectedCells, curveDirection, curveAngle, routeType]);

    const getColName = (index: number) => {
        let name = '';
        let i = index;
        while (i >= 0) {
            name = String.fromCharCode(65 + (i % 26)) + name;
            i = Math.floor(i / 26) - 1;
        }
        return name;
    };

    useEffect(() => {
        if (activeTab === 'route') {
            const selectedPositions: string[] = [];
            const prefix = 'node_';

            selectedCells.forEach(cell => {
                const node = savedNodes[`${prefix}${cell}`];
                if (node && node.name) {
                    const nameParts = node.name.split('-');
                    if (nameParts.length > 1) {
                        selectedPositions.push(nameParts.slice(1).join('-'));
                    } else {
                        selectedPositions.push(node.name);
                    }
                } else {
                    const [r, c] = cell.split(',').map(Number);
                    selectedPositions.push(`${getColName(c)}${r + 1}`);
                }
            });

            if (selectedPositions.length >= 2) {
                setRouteName(`${selectedPositions[0]} - ${selectedPositions[1]}`);
            } else if (selectedPositions.length === 1) {
                setRouteName(selectedPositions[0]);
            } else {
                setRouteName("");
            }
        }
    }, [selectedCells, savedNodes, activeTab]);

    const handleEdit = (id: string, initialNodes: string[]) => {
        // Commit current session before switching
        if (editingId && editingId !== id) {
            if (activeTab === 'area' && selectedCells.size === 0) {
                notify.error("Khu vực chưa có vị trí nào. Vui lòng chọn vị trí trên bản đồ!");
                return;
            }
            if (activeTab === 'area') saveAreaNodes(editingId, Array.from(selectedCells));
        }

        setEditingId(id);
        setSelectedCells(new Set(initialNodes));
        setInitialEditingKeys(new Set(initialNodes));
        if (activeTab === 'area') setAreaKeys([id]);
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const snapshot = {

            areas: [...areas],
            nodes: { ...savedNodes },
            positionItems: [...positionItems]
        };

        try {
            // 2. Compute final data locally for API
            const currentSelectedArr = Array.from(selectedCells);

            // This local array is the "Source of Truth" for the current API call
            const finalAreas = areas.map(a => {
                if (a.id === editingId && activeTab === 'area') {
                    // Force the current editing session data into the object
                    return { ...a, nodes: currentSelectedArr, isModified: true };
                }
                return a;
            });

            // 3. Sync back to context state for UI consistency
            if (editingId) {
                if (activeTab === "area") {
                    const removedKeys = Array.from(initialEditingKeys).filter(k => !selectedCells.has(k));
                    if (removedKeys.length > 0) removeNodes(removedKeys);
                    saveAreaNodes(editingId, currentSelectedArr);
                    const area = finalAreas.find(a => a.id === editingId);
                    if (area && currentSelectedArr.length > 0) {
                        upsertNodes(currentSelectedArr, { up: false, down: false, left: false, right: false }, undefined, area.areaType, true);
                    }
                }
            }

            // 3. Persist changes to API based on active tab
            if (activeTab === "area") {
                const invalidArea = finalAreas.find(a => (a.isNew || a.isModified) && (!a.nodes || a.nodes.length === 0));
                if (invalidArea) {
                    notify.error(`Khu vực "${invalidArea.name || 'chưa đặt tên'}" chưa có vị trí nào. Vui lòng chọn vị trí trên bản đồ!`);
                    setIsSaving(false);
                    return;
                }

                const newAreas = finalAreas.filter(a => a.isNew);
                const modifiedAreas = finalAreas.filter(a => !a.isNew && a.isModified);

                if (newAreas.length > 0) {
                    const payloads = newAreas.map(area => {
                        const nodesPayload = area.nodes.map(k => {
                            const [r, c] = k.split(',').map(Number);
                            const nodeName = `1-${getColName(c)}${r + 1}`;
                            return {
                                name: nodeName,
                                x: c,
                                y: r
                            };
                        });

                        const zoneTypeCode = zoneTypes.find(z => z.id === area.zoneTypeId)?.code || area.zoneTypeId || "";

                        return {
                            code: area.code || "",
                            description: area.description || "",
                            name: area.name || "",
                            nodes: nodesPayload,
                            zone_type: zoneTypeCode
                        };
                    });

                    const res = await createZone(id, payloads);
                    if (res?.error) {
                        notify.error(`Lỗi khi tạo khu vực: ${res.error}`);
                    }
                }

                if (modifiedAreas.length > 0) {
                    for (const area of modifiedAreas) {
                        const nodesPayload = area.nodes.map(k => {
                            const [r, c] = k.split(',').map(Number);
                            const nodeName = `1-${getColName(c)}${r + 1}`;
                            const node = savedNodes[`node_${k}`];

                            const payload: any = {
                                name: nodeName,
                                x: c,
                                y: r
                            };

                            if (node && node.nodeId) {
                                payload.id = node.nodeId;
                            }
                            return payload;
                        });

                        const zoneTypeCode = zoneTypes.find(z => z.id === area.zoneTypeId)?.code || area.zoneTypeId || "";

                        const payload = {
                            id: area.id,
                            code: area.code || "",
                            description: area.description || "",
                            name: area.name || "",
                            nodes: nodesPayload,
                            zone_type: zoneTypeCode
                        };

                        const res = await updateZoneById(id, area.id, payload);
                        if (res?.error) {
                            notify.error(`Lỗi khi cập nhật khu vực ${area.name}: ${res.error}`);
                        }
                    }
                }

                if (zonesToDelete.length > 0) {
                    const res = await bulkDeleteZones(id, zonesToDelete);
                    if (res?.error) {
                        notify.error(`Lỗi khi xóa khu vực: ${res.error}`);
                    }
                }

                if (newAreas.length > 0 || modifiedAreas.length > 0 || zonesToDelete.length > 0) {
                    clearModifiedFlags();
                    clearDeleteQueue();
                    notify.success("Lưu cấu hình khu vực thành công");
                    refreshFloor(); // Giữ lại state giả lập ở client
                } else {
                    notify.warning("Không có thay đổi khu vực để lưu");
                }
            } else if (activeTab === "position") {
                if (selectedCells.size > 0) {
                    const selectedArr = Array.from(selectedCells);



                    const floorPrefix = `node_`;

                    const changedNodes = selectedArr.filter(k => {
                        const node = savedNodes[`${floorPrefix}${k}`];
                        if (!node) return true;

                        const directionsArr: string[] = [];
                        directionsArr.push(posDirections.up ? '1' : '0');
                        directionsArr.push(posDirections.right ? '1' : '0');
                        directionsArr.push(posDirections.down ? '1' : '0');
                        directionsArr.push(posDirections.left ? '1' : '0');

                        const existingDirs: string[] = [];
                        existingDirs.push(node.directions.up ? '1' : '0');
                        existingDirs.push(node.directions.right ? '1' : '0');
                        existingDirs.push(node.directions.down ? '1' : '0');
                        existingDirs.push(node.directions.left ? '1' : '0');

                        const qrChanged = isSingleSelect ? (posQrCode !== (node.qrCode || "")) : false;
                        const directionsChanged = directionsArr.some((d, i) => d !== existingDirs[i]);
                        const nameChanged = posName !== (node.name || "");

                        let formChanged = false;
                        if (isSingleSelect) {
                            const posDataObj = positionFormRef.current ? positionFormRef.current.getPosData() : {};
                            const sortedKey = [...selectedArr].sort().join('|');
                            const pd = posDataObj[sortedKey];
                            if (pd && pd.originalData) {
                                if (pd.posCode !== (pd.originalData.Code || "")) formChanged = true;
                                if (pd.isJunction !== (pd.originalData.IsMergeJunction || false)) formChanged = true;
                                if (pd.isActive !== (pd.originalData.IsActive || false)) formChanged = true;
                            }
                        }

                        return qrChanged || directionsChanged || nameChanged || formChanged;
                    });

                    if (changedNodes.length === 0) {
                        notify.warning("Không có thay đổi vị trí");
                    } else {
                        const firstCell = changedNodes[0];
                        const area = filteredAreas.find(a => a.nodes.includes(firstCell));
                        upsertNodes(changedNodes, posDirections, isSingleSelect ? posQrCode : "", area?.areaType, false, posName);

                        for (const k of changedNodes) {
                            const node = savedNodes[`${floorPrefix}${k}`];
                            if (!node?.nodeId) continue;

                            const area = filteredAreas.find(a => a.nodes.includes(k));
                            const zone_id = area ? area.id : "";

                            const [rStr, cStr] = k.split(',');
                            const x = parseInt(cStr);
                            const y = parseInt(rStr);

                            let currentMergeJunction = false;
                            let currentCode = "";
                            let currentActive = false;

                            const posDataObj = positionFormRef.current ? positionFormRef.current.getPosData() : {};
                            const sortedKey = [...selectedArr].sort().join('|');
                            const pd = posDataObj[sortedKey];

                            if (isSingleSelect && pd && pd.originalData) {
                                currentMergeJunction = pd.isJunction;
                                currentCode = pd.posCode;
                                currentActive = pd.isActive;
                            } else {
                                try {
                                    const nodeDetailRes = await getNodeById(id, node.nodeId) as { error?: string, IsMergeJunction?: boolean, Code?: string, IsActive?: boolean };
                                    if (nodeDetailRes && !nodeDetailRes.error) {
                                        currentMergeJunction = nodeDetailRes.IsMergeJunction || false;
                                        currentCode = nodeDetailRes.Code || "";
                                        currentActive = nodeDetailRes.IsActive || false;
                                    }
                                } catch (e) { }
                            }

                            const payload = {
                                code: currentCode,
                                is_merge_junction: currentMergeJunction,
                                is_active: currentActive,
                                name: posName || node?.name || "",
                                qr_code: isSingleSelect ? posQrCode : (node?.qrCode || ""),
                                x: x,
                                y: y,
                                zone_id: zone_id
                            };

                            const res = await updateNodeDetails(id, node.nodeId, payload) as { error?: string };
                            if (res?.error) throw new Error(res.error);
                        }
                        notify.success("Lưu dữ liệu vị trí thành công");
                        refreshFloor();
                    }
                }
            } else if (activeTab === "route") {
                if (selectedCells.size !== 2) {
                    notify.error("Vui lòng chọn 2 điểm trên bản đồ để tạo tuyến đường!");
                    setIsSaving(false);
                    return;
                }
                if (!routeType) {
                    notify.error("Vui lòng chọn loại đường!");
                    setIsSaving(false);
                    return;
                }
                if (routeType !== 'Đường thẳng' && !curveDirection) {
                    notify.error("Vui lòng chọn hướng cong!");
                    setIsSaving(false);
                    return;
                }
                if (!routeDirection) {
                    notify.error("Vui lòng chọn hướng đi!");
                    setIsSaving(false);
                    return;
                }

                const cellArray = Array.from(selectedCells);
                const fromNode = savedNodes[`node_${cellArray[0]}`];
                const toNode = savedNodes[`node_${cellArray[1]}`];

                if (!fromNode?.nodeId || !toNode?.nodeId) {
                    notify.error("Không thể xác định ID của 2 điểm. Vui lòng kiểm tra lại cấu hình kho!");
                    setIsSaving(false);
                    return;
                }

                let directionNum = 1;
                if (routeDirection === 'left') directionNum = 2;
                else if (routeDirection === 'left_right') directionNum = 3;

                let edgeTypeStr = "STRAIGHT";
                if (routeType === 'Arc tròn') edgeTypeStr = "CURVE";

                let configObj: any = [0];

                if (edgeTypeStr === "CURVE") {
                    const angle = parseFloat(curveAngle || "45") || 45;
                    const cpX = routeControlPoint?.x ?? defaultControlPoint?.x ?? 0;
                    const cpY = routeControlPoint?.y ?? defaultControlPoint?.y ?? 0;
                    
                    configObj = {
                        curve_dir: curveDirection || "",
                        curvature: angle,
                        curve_x: cpX,
                        curve_y: cpY
                    };
                }

                const dist = parseFloat(routeDistance) || 0;
                const spd = parseFloat(routeSpeed) || 0;

                const payload: any = {
                    config: configObj,
                    direction: directionNum,
                    distance: dist,
                    edge_type: edgeTypeStr,
                    from_node_id: fromNode.nodeId,
                    max_speed: spd,
                    to_node_id: toNode.nodeId,
                };
                
                console.log(payload)

                const resEdge = await createNodeEdge(id, payload);
                if (resEdge?.error) {
                    notify.error(`Lỗi khi tạo tuyến đường: ${resEdge.error}`);
                    setIsSaving(false);
                    return;
                }

                const newRoute: import('./warehouse-types').RouteConfig = {
                    id: Date.now().toString(),
                    name: routeName || `Tuyến đường ${routes.length + 1}`,
                    cells: Array.from(selectedCells),
                    routeType,
                    curveDirection,
                    curveAngle: routeType !== 'Đường thẳng' ? (curveAngle || "45") : null,
                    controlPoint: routeType !== 'Đường thẳng' ? routeControlPoint : null,
                    routeDirection,
                    distance: routeDistance,
                    speed: routeSpeed
                };
                addRoute(newRoute);
                notify.success("Lưu tuyến đường thành công!");

                // Clear selection
                setSelectedCells(new Set());
                setRouteType(null);
                setCurveDirection(null);
                setCurveAngle("45");
                setRouteControlPoint(null);
                setRouteDirection('');
                setRouteName('');
                setRouteDistance('');
                setRouteSpeed('');
                setIsSaving(false);
                return;
            }

            setEditingId(null);
            setSelectedCells(new Set());
            setInitialEditingKeys(new Set());
            setPosQrCode("");
            setPosName("");
            setPosDirections({ up: false, down: false, left: false, right: false });
        } catch (error: any) {
            console.error("Save error:", error);
            restoreSnapshot(snapshot);
            notify.error(`Lưu thất bại: ${error.message || "Vui lòng kiểm tra lại"}`);
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Nút "Hủy": Hủy bỏ toàn bộ các item mới tạo (chưa lưu) và xóa các thay đổi nháp
     */
    const handleCancel = () => {
        discardUnsaved();
        clearDeleteQueue();
        setEditingId(null);
        setSelectedCells(new Set());
        setInitialEditingKeys(new Set());
    };

    /**
     * Xử lý khi người dùng chuyển Tab (từ Module sang Tầng, Tầng sang Khu vực...)
     * Sẽ hiện cảnh báo nếu đang có thay đổi chưa được lưu
     */
    const handleTabChange = (val: TabKey) => {
        const hasUnsaved = areas.some(a => a.isNew) || positionItems.some(p => p.isNew);
        if (hasUnsaved) {
            modal.confirm({
                title: 'Xác nhận chuyển tab',
                content: 'Bạn có các thay đổi chưa lưu. Nếu chuyển tab, các mục mới chưa lưu sẽ bị xóa. Bạn có chắc chắn?',
                onOk: () => {
                    discardUnsaved();
                    setActiveTab(val);
                    setInitialEditingKeys(new Set());
                }
            });
        } else {
            setActiveTab(val);
            setEditingId(null);
            setSelectedCells(new Set());
            setInitialEditingKeys(new Set());
        }
    };

    /* ---- Active collapse keys per tab ---- */
    const [areaKeys, setAreaKeys] = useState<string[]>([]);

    useEffect(() => {
        if (filteredAreas.length > 0) {
            const lastId = filteredAreas[filteredAreas.length - 1].id;
            if (!areaKeys.includes(lastId)) setAreaKeys(prev => [...prev, lastId]);
        }
    }, [filteredAreas.length]);

    useEffect(() => {
        if ((activeTab === "position" || activeTab === "route") && selectedCells.size > 0) {
            const selectedArr = Array.from(selectedCells);
            const firstCell = selectedArr[0];
            const prefix = `node_`;
            const firstNode = savedNodes[`${prefix}${firstCell}`];

            if (firstNode) {
                if (isSingleSelect) setPosQrCode(firstNode.qrCode || "");
                setPosDirections(firstNode.directions);
                setPosName(firstNode.name || "");
            }
        }
    }, [selectedCells, activeTab, savedNodes, isSingleSelect]);

    // Sync selection back to the item being edited in real-time
    useEffect(() => {
        if (editingId) {
            const currentKeys = Array.from(selectedCells);
            if (activeTab === 'area') {
                const ar = areas.find(a => a.id === editingId);
                if (ar) {
                    const isChanged = ar.nodes.length !== currentKeys.length || ar.nodes.some((k, i) => k !== currentKeys[i]);
                    if (isChanged) {
                        updateArea(editingId, { nodes: currentKeys });
                    }
                }
            }
        }
    }, [selectedCells, editingId, activeTab, areas, updateArea, removeNodes]);
    // chọn hướng đi ảnh thay đổi 
    const positionPreviewImg = useMemo(() => {
        // if (activeTab !== 'position') return 'node.svg';
        let areaType = "";
        if (selectedCells.size > 0) {
            const firstCell = Array.from(selectedCells)[0];
            const area = filteredAreas.find(a => a.nodes.includes(firstCell));
            areaType = area?.areaType || "";
        }
        return getSelectedTileName(posDirections, areaType);
    }, [posDirections, selectedCells, filteredAreas, activeTab]);

    // Auto-open and scroll to the collapse item when editingId changes
    useEffect(() => {
        if (editingId) {
            // Ensure the collapse is open
            if (activeTab === 'area') {
                setAreaKeys(prev => prev.includes(editingId) ? prev : [...prev, editingId]);

                const area = areas.find(a => a.id === editingId);
                if (area?.category_id) {
                    setSelectedCategories(area.category_id);
                }
            }

            // Scroll to the item
            // Use a small delay to ensure the DOM is updated/expanded
            const timer = setTimeout(() => {
                const element = document.getElementById(`collapse-item-${editingId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [editingId, activeTab, areas, setSelectedCategories]);

    /* ---- Options for select dropdowns ---- */
    const floorOptions: any[] = [];

    return (
        <ModalThemeProvider>
            <div className="flex flex-col bg-white rounded-[20px] min-h-full font-inter relative overflow-y-auto lg:overflow-hidden no-scrollbar">
                {contextHolder}
                {isLoading && (
                    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/70 backdrop-blur-[2px] ">
                        <LoadingComponent />
                    </div>
                )}
                <div className="flex flex-row justify-between items-center py-[17px] px-[15px] pb-0 mb-[17px]">
                    <div className="flex items-center gap-[10px]">
                        <img
                            src="/icon.svg/back.svg"
                            alt="Back"
                            className="w-[15px] h-[15px] cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => router.push('/warehouse')}
                        />
                        <p className="text-[16px] font-medium text-[#373838] truncate">Thiết lập cấu hình kho: {warehouses.find(w => w.ID === id)?.Name || ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <ConfigProvider
                                theme={{
                                    components: {
                                        Select: {
                                            colorText: "#076eb8",
                                        }
                                    }
                                }}
                            >
                            </ConfigProvider>
                        </div>

                    </div>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 min-h-0 border-t-[0.5px] border-[#D9D9D9] ">
                    <div className={`flex flex-col  border-b lg:border-b-0 lg:border-r border-[#D9D9D9] pt-[10px] pr-[15px] pl-[15px] w-full lg:w-[390px] shrink-0 gap-[15px] relative h-auto lg:h-full pb-[60px] lg:pb-[60px] overflow-hidden`}>
                        <CustomSelect
                            value={id}
                            options={warehouses.map(w => ({ value: w.ID, label: w.Name }))}
                            onChange={(val: string) => router.push(`/warehouse/${val}`)}
                            placeholder="Chọn kho"
                            style={{ width: "100%", height: 30, border: "0.5px solid #076eb8", borderRadius: "8px", color: "#076eb8" }}
                            suffixIcon={
                                <svg width="14.45" height="7.16" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.6675 8.5975C7.9675 8.5975 7.2675 8.3275 6.7375 7.7975L0.2175 1.2775C-0.0725 0.987499 -0.0725 0.5075 0.2175 0.2175C0.5075 -0.0725 0.9875 -0.0725 1.2775 0.2175L7.7975 6.7375C8.2775 7.2175 9.0575 7.2175 9.5375 6.7375L16.0575 0.2175C16.3475 -0.0725 16.8275 -0.0725 17.1175 0.2175C17.4075 0.5075 17.4075 0.987499 17.1175 1.2775L10.5975 7.7975C10.0675 8.3275 9.3675 8.5975 8.6675 8.5975Z" fill="#076eb8" />
                                </svg>
                            }
                        />
                        {/* chuyển tab ở cấu hình  */}
                        <ConfigProvider
                            theme={{
                                components: {
                                    Segmented: {
                                        trackBg: "#fff",
                                        itemColor: "#076EB8",
                                        itemHoverBg: "#E8F2FA",
                                        itemHoverColor: "#076EB8",
                                        itemActiveBg: "#D0E3F3",
                                        itemSelectedBg: "#076EB8",
                                        itemSelectedColor: "white",
                                        colorPrimaryBorder: "#076EB8",
                                        controlHeight: 35,
                                    }
                                }
                            }}
                        >
                            <Segmented
                                size="middle" shape="round" value={activeTab}
                                onChange={(val) => handleTabChange(val as TabKey)}
                                options={TAB_OPTIONS} block
                                style={{ border: "0.5px solid #076eb8", padding: 0, fontSize: 14 }}
                                className="!h-[35px]"
                            />
                        </ConfigProvider>

                        <div className="flex-1 mr-[-15px] flex flex-col gap-[15px] overflow-hidden">


                            {activeTab === "area" && (
                                <OverlayScrollbarsComponent
                                    defer
                                    options={{
                                        scrollbars: {
                                            visibility: 'auto',
                                            autoHide: 'leave',
                                            autoHideDelay: 3000,
                                        },
                                    }}
                                    className="w-full max-h-[580px] lg:max-h-[calc(100vh-280px)]"
                                >
                                    <div className="flex flex-col gap-3 pr-[15px] pl-[1px] pb-4">
                                        <Collapse
                                            activeKey={areaKeys}
                                            onChange={(k) => setAreaKeys(k as string[])}
                                            expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? -180 : 0} style={{ color: "#076EB8", fontSize: 12 }} />}
                                            expandIconPlacement="end" collapsible="header"
                                            style={{ background: "transparent", border: "none" }}
                                            styles={collapseStyles}
                                            items={filteredAreas.map((area, idx) => {
                                                const isExpanded = areaKeys.includes(area.id);
                                                return {
                                                    key: area.id,
                                                    label: (
                                                        <div
                                                            className="w-full "
                                                            onClick={() => {
                                                                if (editingId !== area.id) handleEdit(area.id, area.nodes);
                                                            }}
                                                        >
                                                            <span className="font-normal text-[#076EB8] text-[14px]">{area.name || `Khu vực ${idx + 1}`}</span>
                                                        </div>
                                                    ),
                                                    style: { marginBottom: 12, border: "0.5px solid #076eb8", borderRadius: "8px", overflow: "hidden", background: "#fff", boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.05)", },
                                                    children: (
                                                        <div>
                                                            <div className="h-[0.5px] bg-[#076eb8] mx-4 " />
                                                            <div id={`collapse-item-${area.id}`} className={`flex flex-col gap-3 pt-3 pb-2 px-2.5 ${area.id === editingId && 'bg-[#F8FCFF]'}`}>
                                                                <FormRow label="Loại khu vực" required>
                                                                    <CustomSelect
                                                                        className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                                        placeholder="Chọn loại khu vực"
                                                                        options={zoneTypes.map(zt => ({ value: zt.code, label: zt.name }))}
                                                                        value={area.zoneTypeId || undefined}
                                                                        onChange={(v) => {
                                                                            const selected = zoneTypes.find(zt => zt.code === v);
                                                                            const mappedType = selected ? ZONE_TYPE_MAP[selected.code] : '';
                                                                            updateArea(area.id, { zoneTypeId: v, areaType: mappedType });
                                                                        }}
                                                                    />
                                                                </FormRow>
                                                                <FormRow label="Tên khu vực" required>
                                                                    <CustomInput className='!h-[35px] !text-[#484848] !rounded-[8px]' placeholder="Nhập tên khu vực" value={area.name} onChange={(e) => updateArea(area.id, { name: e.target.value })} />
                                                                </FormRow>
                                                                <FormRow label="Mã khu vực" required>
                                                                    <CustomInput className='!h-[35px] !text-[#484848] !rounded-[8px]' placeholder="Nhập mã khu vực" value={area.code} onChange={(e) => updateArea(area.id, { code: e.target.value })} />
                                                                </FormRow>
                                                                {area.areaType === 'storage' && (<>
                                                                    <FormRow label="Nhóm sản phẩm" required>
                                                                        <CustomSelect
                                                                            className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                                            placeholder="Chọn nhóm sản phẩm"
                                                                            options={categories?.map(c => ({ value: c.id, label: c.name }))}
                                                                            value={area.category_id || undefined}
                                                                            onChange={(v) => {
                                                                                updateArea(area.id, { category_id: v, product_id: '' });
                                                                                setSelectedCategories(v);
                                                                            }}
                                                                        />
                                                                    </FormRow>
                                                                    <FormRow label="Sản phẩm" required>
                                                                        <CustomSelect
                                                                            className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                                            placeholder="Chọn sản phẩm"
                                                                            disabled={!area.category_id}
                                                                            options={products?.map(p => ({ value: p.id, label: p.name }))}
                                                                            value={area.product_id || undefined}
                                                                            onChange={(v) => updateArea(area.id, { product_id: v })}
                                                                        />
                                                                    </FormRow>

                                                                </>
                                                                )

                                                                }
                                                                <FormRow label="Vị trí" required>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[12px] text-[#484848] truncate">Đã chọn: {editingId === area.id ? selectedCells.size : area.nodes.length} vị trí</span>
                                                                        <SelectedCellsTags
                                                                            cells={editingId === area.id ? Array.from(selectedCells) : area.nodes}
                                                                            canRemove={editingId === area.id}
                                                                            onRemove={(cell) => { const n = new Set(selectedCells); n.delete(cell); setSelectedCells(n); }}
                                                                        />
                                                                    </div>
                                                                </FormRow>
                                                                <FormRow label="Mô tả">
                                                                    <CustomInput
                                                                        className='!h-[35px] !text-[#484848] !rounded-[8px]'
                                                                        placeholder="Nhập mô tả"
                                                                        value={area.description || ""}
                                                                        onChange={(e) => updateArea(area.id, { description: e.target.value })}
                                                                    />
                                                                </FormRow>


                                                                <ActionIcons onEdit={() => handleEdit(area.id, area.nodes)} onDelete={() => removeArea(area.id)} />
                                                            </div>
                                                        </div>
                                                    ),
                                                };
                                            })}
                                        />
                                        <AddButton onClick={() => {
                                            if (editingId && activeTab === 'area' && selectedCells.size === 0) {
                                                notify.error("Khu vực chưa có vị trí nào. Vui lòng chọn vị trí trên bản đồ!");
                                                return;
                                            }
                                            if (editingId) saveAreaNodes(editingId, Array.from(selectedCells));
                                            addArea();
                                        }} />
                                    </div>
                                </OverlayScrollbarsComponent>
                            )}
                            {activeTab === "position" && (() => {
                                // Position form displayed for the currently selected cell
                                return (
                                    <PositionForm ref={positionFormRef} warehouseId={id} />
                                );
                            })()}

                            {activeTab === "route" && (
                                <OverlayScrollbarsComponent
                                    defer
                                    options={{ scrollbars: { visibility: 'hidden' } }}
                                    className="w-full max-h-[580px] lg:max-h-[calc(100vh-280px)]"
                                >
                                    <div className="pr-[15px]">
                                        <div className="flex flex-col gap-4 bg-white p-4 rounded-lg" style={{ border: "0.5px solid #076eb8", boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.05)" }}>
                                            <div className="flex justify-between items-center pb-2 border-b border-[#D9D9D9]">
                                                <span className="text-[#076eb8] text-[14px] font-medium">Tuyến đường 1</span>
                                                <DownOutlined style={{ color: '#076eb8', fontSize: 12 }} />
                                            </div>

                                            <FormRow label="Tuyến đường" required>
                                                <CustomInput
                                                    placeholder="Chọn 2 vị trí "
                                                    value={routeName}
                                                    onChange={(e) => setRouteName(e.target.value)}
                                                    className="!h-[35px] !text-[#484848] !rounded-[8px]"
                                                />
                                            </FormRow>

                                            <FormRow label="Hướng đi" required>
                                                <Select
                                                    className="!text-[#484848] !h-[35px] !rounded-[8px] w-full"
                                                    placeholder="Chọn hướng đi"
                                                    value={routeDirection || undefined}
                                                    onChange={(val) => setRouteDirection(val)}
                                                    optionLabelProp="label"
                                                >
                                                    <Select.Option
                                                        value="right"
                                                        label={
                                                            <div className="flex items-center gap-1">
                                                                Cùng chiều ({getRouteDirectionOptions().from}
                                                                <img src="/svgMap/right.svg" alt="right" className="w-3 h-3 object-contain" />
                                                                {getRouteDirectionOptions().to})
                                                            </div>
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Cùng chiều ({getRouteDirectionOptions().from}
                                                            <img src="/svgMap/right.svg" alt="right" className="w-3 h-3 object-contain" />
                                                            {getRouteDirectionOptions().to})
                                                        </div>
                                                    </Select.Option>
                                                    <Select.Option
                                                        value="left"
                                                        label={
                                                            <div className="flex items-center gap-1">
                                                                Ngược chiều ({getRouteDirectionOptions().from}
                                                                <img src="/svgMap/left.svg" alt="left" className="w-3 h-3 object-contain" />
                                                                {getRouteDirectionOptions().to})
                                                            </div>
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Ngược chiều ({getRouteDirectionOptions().from}
                                                            <img src="/svgMap/left.svg" alt="left" className="w-3 h-3 object-contain" />
                                                            {getRouteDirectionOptions().to})
                                                        </div>
                                                    </Select.Option>
                                                    <Select.Option
                                                        value="left_right"
                                                        label={
                                                            <div className="flex items-center gap-1">
                                                                Hai chiều ({getRouteDirectionOptions().from}
                                                                <img src="/svgMap/left_right.svg" alt="left_right" className="w-3 h-3 object-contain" />
                                                                {getRouteDirectionOptions().to})
                                                            </div>
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Hai chiều ({getRouteDirectionOptions().from}
                                                            <img src="/svgMap/left_right.svg" alt="left_right" className="w-3 h-3 object-contain" />
                                                            {getRouteDirectionOptions().to})
                                                        </div>
                                                    </Select.Option>
                                                </Select>
                                            </FormRow>

                                            <FormRow label="Loại đường" required>
                                                <CustomSelect
                                                    className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                    value={routeType || undefined}
                                                    placeholder="Chọn loại đường"
                                                    onChange={(val) => {
                                                        setRouteType(val);
                                                        if (val === 'Đường thẳng') {
                                                            setCurveDirection(null);
                                                            setCurveAngle("45");
                                                            setRouteControlPoint(null);
                                                        }
                                                    }}
                                                    options={[
                                                        { value: 'Arc tròn', label: 'Arc tròn' },
                                                        { value: 'Đường thẳng', label: 'Đường thẳng' }
                                                    ]}
                                                />
                                            </FormRow>


                                            {routeType === 'Arc tròn' && (
                                                <>
                                                    <FormRow label="Hướng cong" required>
                                                        <CustomSelect
                                                            className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                            value={curveDirection || undefined}
                                                            placeholder="Chọn hướng cong"
                                                            onChange={(val) => {
                                                                setCurveDirection(val);
                                                                setRouteControlPoint(null);
                                                            }}
                                                            options={
                                                                isVerticalLine
                                                                    ? [
                                                                        { value: 'trái', label: 'Trái' },
                                                                        { value: 'phải', label: 'Phải' }
                                                                    ]
                                                                    : [
                                                                        { value: 'trên', label: 'Trên' },
                                                                        { value: 'dưới', label: 'Dưới' }
                                                                    ]
                                                            }
                                                        />
                                                    </FormRow>

                                                    <FormRow label="Độ cong (độ)" required>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <Slider
                                                                    className="flex-1"
                                                                    min={0}
                                                                    max={180}
                                                                    value={curveAngle !== null && curveAngle !== '' ? Number(curveAngle) : 45}
                                                                    onChange={(val) => {
                                                                        setCurveAngle(val.toString());
                                                                        setRouteControlPoint(null);
                                                                    }}
                                                                />
                                                                <span className="w-10 text-sm text-gray-600">{curveAngle !== null && curveAngle !== '' ? curveAngle : "45"}°</span>
                                                            </div>
                                                            {(routeControlPoint || defaultControlPoint) && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[12px] text-[#f59e0b] font-medium">X:</span>
                                                                        <CustomInput
                                                                            type="number"
                                                                            value={Math.round((routeControlPoint || defaultControlPoint!).x)}
                                                                            onChange={(e) => setRouteControlPoint({ ...(routeControlPoint || defaultControlPoint!), x: Number(e.target.value) })}
                                                                            className="!h-[28px] !text-[#484848] !rounded-[4px] w-[60px] text-center"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[12px] text-[#f59e0b] font-medium">Y:</span>
                                                                        <CustomInput
                                                                            type="number"
                                                                            value={Math.round((routeControlPoint || defaultControlPoint!).y)}
                                                                            onChange={(e) => setRouteControlPoint({ ...(routeControlPoint || defaultControlPoint!), y: Number(e.target.value) })}
                                                                            className="!h-[28px] !text-[#484848] !rounded-[4px] w-[60px] text-center"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormRow>
                                                </>
                                            )}

                                            <FormRow label="Khoảng cách (mm)">
                                                <CustomInput
                                                    placeholder="Nhập khoảng cách thực tế"
                                                    value={routeDistance}
                                                    onChange={(e) => setRouteDistance(e.target.value)}
                                                    className="!h-[35px] !text-[#484848] !rounded-[8px]"
                                                />
                                            </FormRow>

                                            <FormRow label="Tốc độ (m/s)">
                                                <CustomInput
                                                    placeholder="Nhập tốc độ tối đa cho..."
                                                    value={routeSpeed}
                                                    onChange={(e) => setRouteSpeed(e.target.value)}
                                                    className="!h-[35px] !text-[#484848] !rounded-[8px]"
                                                    type="number"
                                                />
                                            </FormRow>
                                        </div>
                                    </div>
                                </OverlayScrollbarsComponent>
                            )}
                        </div>

                        <div className="relative lg:absolute bottom-0 lg:bottom-[15px] left-0 lg:left-[15px] right-0 lg:right-[15px] flex flex-row items-center justify-center gap-2 md:gap-[20px] bg-white pt-4 lg:pt-2 pb-4 lg:pb-0 z-10">
                            <Button
                                onClick={handleCancel}
                                className="focus:!outline-none focus:!shadow-none focus-visible:!outline-none focus-visible:!shadow-none !h-[28px] !w-[65px] md:!h-[30px] md:!w-[80px]"
                                style={{ backgroundColor: "white", color: "#A1A1A1", border: "1px solid #A1A1A1", borderRadius: 20, padding: 0 }}
                            >Hủy</Button>
                            <Button
                                onClick={handleSave}
                                loading={isSaving}
                                className="focus:!outline-none focus:!shadow-none focus-visible:!outline-none focus-visible:!shadow-none !h-[28px] !w-[65px] md:!h-[30px] md:!w-[80px]"
                                style={{ backgroundColor: "#076EB8", color: "white", border: "none", borderRadius: 20, padding: 0 }}
                            >Lưu</Button>
                        </div>
                    </div>

                    {showMap && (
                        <div className="flex flex-col w-full h-[550px] lg:h-full lg:flex-1 min-w-0 max-h-[calc(100vh-180px)] lg:max-h-none mt-6 lg:mt-0 p-4 lg:p-0">
                            <WarehouseMap />
                        </div>
                    )}
                </div>

                <style jsx global>{`
            `}</style>
            </div>
        </ModalThemeProvider>
    );
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-row items-center gap-2 ">
            <p className="text-[#000000] text-[14px] font-normal min-w-[120px] pt-[2px]">{label}{required && <span className="text-red-500"> *</span>}</p>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}

function ActionIcons({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
    return (
        <div className="flex items-center justify-center gap-2 pt-1">
            {onEdit && (
                <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:outline-none">
                    <img src="/svgMap/updatezone.svg" alt="edit" className="w-full h-full object-contain" />
                </button>
            )}
            <button onClick={onDelete} className="w-7 h-7 rounded-full border-[#C60808] border-[1px] bg-white flex items-center justify-center text-[#C60808] hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:outline-none">
                <DeleteOutlined style={{ fontSize: 12 }} />
            </button>
        </div>
    );
}
// code của vị trí tự sinh 
export const getCellLabel = (cell: string) => {
    const [r, c] = cell.split(',').map(Number);// 1. Tách toạ độ dạng chuỗi "hàng,cột" (ví dụ "0,3") thành 2 số: r (row) và c (column)
    let colName = '';
    // 2. Tự động chuyển đổi số thứ tự cột (0, 1, 2...) thành chữ cái (A, B, C... Z, AA, AB...)
    let ci = c;
    while (ci >= 0) {
        colName = String.fromCharCode(65 + (ci % 26)) + colName;
        ci = Math.floor(ci / 26) - 1;
    }
    return `${colName}${r + 1}`;
};

function SelectedCellsTags({ cells, canRemove, onRemove }: { cells: string[]; canRemove: boolean; onRemove: (cell: string) => void }) {
    if (cells.length === 0) return <div className="border-[0.5px] border-[#d9d9d9] bg-white rounded-lg p-2  h-[35px]min-h-[35px] text-[#545454] text-[14px] truncate ">Chọn vị trí trên bản đồ</div>;

    return (
        <OverlayScrollbarsComponent
            defer
            options={{
                scrollbars: {
                    autoHide: 'leave',
                    autoHideDelay: 500,
                },
            }}
            style={{ maxHeight: '120px' }}
            className="border border-[#D6E4F0] rounded-lg p-2 bg-white"
        >
            <div className="flex flex-wrap gap-1.5">
                {cells.map(cell => (
                    <span key={cell} className="flex items-center gap-1 bg-[#F4FAFF] border border-[#D6E4F0] px-2 py-0.5 rounded text-[11px] text-[#333]">
                        {getCellLabel(cell)}
                        {canRemove && <span className="text-red-500 cursor-pointer ml-0.5 font-bold text-[13px] leading-none" onClick={() => onRemove(cell)}>×</span>}
                    </span>
                ))}
            </div>
        </OverlayScrollbarsComponent>
    );
}
const PositionForm = React.forwardRef<{ getPosData: () => any }, { warehouseId: string }>(({ warehouseId }, ref) => {
    const { selectedCells, areas, nodes: savedNodes } = useWarehouseConfig();
    const { success, error } = useNotify();
    const [posData, setPosData] = useState<Record<string, { posCode: string; posName: string; isJunction: boolean; isActive: boolean; originalData?: any }>>({});
    const [isSaving, setIsSaving] = useState(false);

    React.useImperativeHandle(ref, () => ({
        getPosData: () => posData
    }));

    const cellKey = Array.from(selectedCells).sort().join('|');
    const data = posData[cellKey] || { posCode: '', posName: '', isJunction: false, isActive: false, originalData: null };
    const update = (fields: Partial<typeof data>) =>
        setPosData(prev => ({ ...prev, [cellKey]: { ...data, ...fields } }));

    const handleSave = async () => {
        if (selectedCells.size !== 1) return;
        const cell = Array.from(selectedCells)[0];
        const nodeInfo = savedNodes[`node_${cell}`];
        if (!nodeInfo?.nodeId || !data.originalData) return;

        setIsSaving(true);
        const payload = {
            code: data.posCode,
            is_merge_junction: data.isJunction,
            is_active: data.isActive,
            name: data.originalData.Name || "",
            qr_code: data.originalData.QrCode || "",
            x: data.originalData.X || 0,
            y: data.originalData.Y || 0,
            zone_id: matchingArea?.id || data.originalData.ZoneId || ""
        };
        // console.log(payload)

        const res = await updateNodeDetails(warehouseId, nodeInfo.nodeId, payload);
        setIsSaving(false);

        if (res && !res.error) {
            success("Cập nhật vị trí thành công");
        } else {
            error(res?.error || "Lỗi khi cập nhật vị trí");
        }
    };

    useEffect(() => {
        if (selectedCells.size === 1) {
            const cell = Array.from(selectedCells)[0];
            const nodeInfo = savedNodes[`node_${cell}`];
            if (nodeInfo?.nodeId && !posData[cellKey]) {
                getNodeById(warehouseId, nodeInfo.nodeId).then((res: any) => {
                    if (res && !res.error) {
                        setPosData(prev => ({
                            ...prev,
                            [cellKey]: {
                                posCode: res.Code || '',
                                posName: res.Name || '',
                                isJunction: res.IsMergeJunction || false,
                                isActive: res.IsActive || false,
                                originalData: res,
                            }
                        }));
                    }
                });
            }
        }
    }, [selectedCells, warehouseId, savedNodes, cellKey, posData]);

    const matchingArea = areas.find(area =>
        Array.from(selectedCells).some(cell => area.nodes.includes(cell))
    );

    const collapseItems = [
        {
            key: '1',
            label: (
                <div className="w-full">
                    <span className="font-normal text-[#076EB8] text-[14px]">
                        {selectedCells.size === 1 ? getCellLabel(Array.from(selectedCells)[0]) : `Vị trí`}
                    </span>
                </div>
            ),
            style: {
                marginBottom: 12,
                border: '0.5px solid #076eb8',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.05)',
            },
            children: (
                <div>
                    <div className="h-[0.5px] bg-[#076eb8] mx-4" />
                    <div className="flex flex-col gap-3 pt-3 pb-2 px-2.5">
                        <FormRow label="Vị trí" required>
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] text-[#484848] truncate">
                                    Đã chọn: {selectedCells.size} vị trí
                                </span>
                                {selectedCells.size > 0 ? (
                                    <SelectedCellsTags
                                        cells={Array.from(selectedCells)}
                                        canRemove={false}
                                        onRemove={() => { }}
                                    />
                                ) : (
                                    <div className="flex items-center px-3 py-1.5 border border-[#d9d9d9] rounded-[8px] bg-[#f5f5f5] cursor-not-allowed text-[14px] text-[#bfbfbf] min-h-[35px]">
                                        Chọn vị trí trên bản đồ
                                    </div>
                                )}
                            </div>
                        </FormRow>
                        {/* <FormRow label="Tên vị trí (Name)" required>
                            <CustomInput
                                placeholder="Nhập tên vị trí"
                                value={data.posName}
                                onChange={(e) => update({ posName: e.target.value })}
                                className="!h-[35px] !text-[#484848] !rounded-[8px]"
                                disabled={!(matchingArea && selectedCells.size > 0)}
                            />
                        </FormRow> */}
                        <FormRow label="Mã vị trí" required>
                            <CustomInput
                                placeholder="Nhập mã vị trí"
                                value={data.posCode}
                                onChange={(e) => update({ posCode: e.target.value })}
                                className="!h-[35px] !text-[#484848] !rounded-[8px]"
                                disabled={!(selectedCells.size > 0)}
                            />
                        </FormRow>
                        <FormRow label="Giao lộ" required>
                            <Switch checked={data.isJunction} onChange={(v) => update({ isJunction: v })} disabled={!(selectedCells.size > 0)} />
                        </FormRow>
                        <FormRow label="Hoạt động" required>
                            <Switch checked={data.isActive} onChange={(v) => update({ isActive: v })} disabled={!(selectedCells.size > 0)} />
                        </FormRow>

                    </div>
                </div>
            ),
        }
    ];

    return (
        <OverlayScrollbarsComponent
            defer
            options={{ scrollbars: { visibility: 'hidden' } }}
            className="w-full max-h-[580px] lg:max-h-[calc(100vh-280px)]"
        >
            <div className="flex flex-col gap-3 pr-[15px] pl-[1px] pb-4">
                <Collapse
                    defaultActiveKey={['1']}
                    expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? -180 : 0} style={{ color: '#076EB8', fontSize: 12 }} />}
                    expandIconPlacement="end"
                    collapsible="header"
                    style={{ background: 'transparent', border: 'none' }}
                    styles={collapseStyles}
                    items={collapseItems}
                />
            </div>
        </OverlayScrollbarsComponent>
    );
});

function AddButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex justify-center pt-2">
            <button onClick={onClick} >
                <img src="/svgMap/updatezone2.svg" alt="add" width={27} height={27} />
            </button>
        </div>
    );
}

/* ============================
   Wrapper with Provider
   ============================ */
export default function ProfileContent({ id }: { id: string }) {
    return (
        <WarehouseConfigProvider warehouseId={id}>
            <ProfileInner id={id} />
        </WarehouseConfigProvider>
    );
}
