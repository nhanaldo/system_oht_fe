"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Collapse, Segmented, Switch, Checkbox, ConfigProvider, Modal, Select } from "antd";
import { DownOutlined, PlusCircleFilled, EditFilled, DeleteFilled, ExclamationCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomInput from "@/components/ui/CustomInput";
import CustomSelect from "@/components/ui/CustomSelect";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import LoadingComponent from "@/components/ui/LoadingComponent";
import WarehouseMap from "./WarehouseMap";
import { WarehouseConfigProvider, useWarehouseConfig } from "./WarehouseContext";
import {
    MOCK_DEVICES, IMPORT_DIRECTION_OPTIONS,
    type TabKey, type WarehouseModule, type FloorConfig, type AreaConfig, type DirectionFlags,
} from "./warehouse-types";
import { getSelectedTileName } from "./warehouse-types";
import { useNotify } from "@/hook/notification/NotificationProvider";
import {
    updateTower, createTower, TowerProps,
    createTowerFloor, updateTowerFloor, updateNodeBulk, updateNode,
    type ZoneCreateProps, type ZoneUpdateProps, type NodeProps,
    updateZone,
    createZone,
    NodeBulkProps,
    bulkDeleteZones,
    deleteTowerFloor
} from "../../warehouseAcction";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";

/* ============================
   Tab Segment labels
   ============================ */
// Menu cấu hình & Sidebar
//Là thành phần bao bọc bên ngoài và là thanh Sidebar bên trái để người dùng tương tác, nhập liệu
// File này bọc toàn bộ ứng dụng bằng <WarehouseConfigProvider> ở cuối file.

const TAB_OPTIONS: { value: TabKey; label: string }[] = [
    { value: "module", label: "Module kho" },
    { value: "floor", label: "Tầng" },
    { value: "area", label: "Khu vực" },
    { value: "position", label: "Vị trí" },
];

const ZONE_TYPE_MAP: Record<string, string> = {
    'STORAGE': 'storage',
    'WAITING': 'waiting',
    'CHARGING': 'charging',
    'INBOUND': 'inbound',
    'OUTBOUND': 'outbound',
    'MOVING': 'moving',
    'LIFTER': 'lifter'
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
    const [modal, contextHolder] = Modal.useModal();
    const ctx = useWarehouseConfig();
    const {
        modules, floors, areas, nodes: savedNodes,
        positionItems, addPositionItem, updatePositionItem, removePositionItem, discardUnsaved,
        activeTab, setActiveTab, selectedCells,
        updateModule,
        addFloor, updateFloor, removeFloor, saveFloorNodes,
        addArea, updateArea, removeArea, saveAreaNodes,
        upsertNodes, removeNodes, setSelectedCells,
        editingId, setEditingId, initialEditingKeys, setInitialEditingKeys,
        copyFloorConfig, currentWarehouseFloorId, clearModifiedFlags, setCurrentWarehouseFloorId,
        posDirections, setPosDirections, posName, setPosName, posQrCode, setPosQrCode,
        zoneTypes, warehouses, warehouseFloors, restoreSnapshot,
        floorsCount, modulesCount, warehouseName, isLoading, refreshGlobal, refreshFloor,
        categories, products, setSelectedCategories, allDevices,
        zonesToDelete, towerFloorsToDelete, clearDeleteQueue
    } = useWarehouseConfig();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const showMap = activeTab !== "module";
    //Đoạn code kiểm tra trạng thái chọn trên Sidebar để ẩn/hiển thị form nhập code và đổi
    const isSingleSelect = selectedCells.size === 1;
    const isMultiSelect = selectedCells.size > 1;

    // Lọc dữ liệu khi chọn và tầng và hiển thị bên sidebar
    const filteredFloors = useMemo(() => floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId), [floors, currentWarehouseFloorId]);
    const floorIds = useMemo(() => filteredFloors.map(f => f.id), [filteredFloors]);
    const filteredAreas = useMemo(() => areas.filter(a => floorIds.includes(a.floorId) || a.floorId === '' || a.id === editingId), [areas, floorIds, editingId]);
    const filteredPositionItems = useMemo(() => positionItems.filter(p => floorIds.includes(p.floorId)), [positionItems, floorIds]);

    // Copy Modal state
    const [copyModalVisible, setCopyModalVisible] = useState(false);
    const [fromWFloorId, setFromWFloorId] = useState<string>("");

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
    const getCapStyle = (deviceId: string, cap: string) => {
        const active = selectedDeviceCaps[deviceId] === cap;
        if (!active) return { border: '1px solid #D6E4F0', background: '#fff', color: '#545454' };
        switch (cap) {
            case 'inbound': return { border: '1px solid #27AE60', background: '#E8F8EF', color: '#27AE60' };
            case 'outbound': return { border: '1px solid #E67E22', background: '#FEF4E8', color: '#E67E22' };
            default: return { border: '1px solid #076EB8', background: '#E8F2FA', color: '#076EB8' };
        }
    };

    /**
     * Chuyển đổi trạng thái chỉnh sửa sang một item khác (Tầng/Khu vực)
     * Đồng thời tự động lưu lại nháp những thay đổi của item đang sửa hiện tại
     */
    const handleEdit = (id: string, initialNodes: string[]) => {
        // Commit current session before switching
        if (editingId && editingId !== id) {
            if (activeTab === 'floor') saveFloorNodes(editingId, Array.from(selectedCells));
            else if (activeTab === 'area') saveAreaNodes(editingId, Array.from(selectedCells));
        }

        setEditingId(id);
        setSelectedCells(new Set(initialNodes));
        setInitialEditingKeys(new Set(initialNodes));
        if (activeTab === 'area') setAreaKeys([id]);
    };

    /**
     * Nút "Lưu": Gửi toàn bộ dữ liệu cấu hình đã thay đổi lên Server
     * Hàm này sẽ kiểm tra Tab hiện tại (Module/Tầng/Khu vực/Vị trí) để gọi API tương ứng
     */
    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const snapshot = {
            modules: [...modules],
            floors: [...floors],
            areas: [...areas],
            nodes: { ...savedNodes },
            positionItems: [...positionItems]
        };

        try {
            // 1. Bulk save for module tab
            if (activeTab === 'module') {
                const newTowers = modules.filter(m => m.isNew);
                const modifiedTowers = modules.filter(m => !m.isNew && m.isModified);

                if (newTowers.length === 0 && modifiedTowers.length === 0) {
                    notify.warning("Không có thay đổi để lưu");
                    setIsSaving(false);
                    return;
                }

                // if (newTowers.length > 0) {
                //     const towers = newTowers.map((mod) => ({
                //         name: mod.name,
                //         code: mod.code,
                //         warehouse_id: id,
                //         tower_type: mod.tower_type,
                //         tower_order: mod.tower_order,
                //         is_active: mod.is_active,
                //     }));
                //     const res: any = await createTower(id, towers as any);
                //     if (res?.error) throw new Error(res.error);
                // }

                if (modifiedTowers.length > 0) {
                    const towers: TowerProps[] = modifiedTowers.map((mod) => ({
                        name: mod.name,
                        code: mod.code,
                        warehouse_id: id,
                        tower_type: mod.tower_type,
                        tower_order: mod.tower_order,
                        id: mod.id,
                        is_active: mod.is_active,
                    }));
                    const res: any = await updateTower(id, towers);
                    if (res?.error) throw new Error(res.error);
                }

                clearModifiedFlags();
                notify.success("Lưu cấu hình module thành công");
                refreshGlobal();
                return;
            }

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

            const finalFloors = floors.map(f => {
                if (f.id === editingId && activeTab === 'floor') {
                    return { ...f, nodes: currentSelectedArr, isModified: true };
                }
                return f;
            });

            // 3. Sync back to context state for UI consistency
            if (editingId) {
                if (activeTab === "floor") {
                    saveFloorNodes(editingId, currentSelectedArr);
                } else if (activeTab === "area") {
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
            if (activeTab === "floor") {
                if (towerFloorsToDelete.length > 0) {
                    for (const floor of towerFloorsToDelete) {
                        const res: any = await deleteTowerFloor(id, floor.id);
                        if (res?.error) throw new Error(res.error);
                    }
                }

                const currentFloor = warehouseFloors.find(wf => wf.id.toString() === currentWarehouseFloorId);
                const currentFloorNum = currentFloor?.floor_number || 1;
                const getNodesData = (nodes: string[]) => nodes.map(k => {
                    const [r, c] = k.split(',').map(Number);
                    let colName = '';
                    let ci = c;
                    while (ci >= 0) {
                        colName = String.fromCharCode(65 + (ci % 26)) + colName;
                        ci = Math.floor(ci / 26) - 1;
                    }
                    const nodeLabel = `${currentFloorNum}-${colName}${r + 1}`;
                    return {
                        code: nodeLabel,
                        name: nodeLabel,
                        x: (c + 1).toString(),
                        y: (r + 1).toString(),
                        z: currentFloorNum.toString()
                    };
                });

                const newFloors = finalFloors.filter(f => f.isNew);
                const modifiedFloors = finalFloors.filter(f => !f.isNew && f.isModified);

                // Validate: Đảm bảo tất cả các tầng mới hoặc bị sửa đều đã được gán Module
                const invalidFloors = [...newFloors, ...modifiedFloors].filter(f => !f.moduleId);
                if (invalidFloors.length > 0) {
                    notify.error("Vui lòng chọn 'Module kho' cho tất cả các Tầng trước khi lưu.");
                    setIsSaving(false);
                    return;
                }

                if (newFloors.length > 0) {
                    const res: any = await createTowerFloor(id, {
                        warehouse_floor_id: currentWarehouseFloorId,
                        tower_floors: newFloors.map(f => ({
                            name: f.name,
                            tower_id: f.moduleId,
                            nodes: getNodesData(f.nodes),
                            devices: f.devices
                        }))
                    });
                    if (res?.error) throw new Error(res.error);
                }

                if (modifiedFloors.length > 0) {
                    const res: any = await updateTowerFloor(id, {
                        warehouse_floor_id: currentWarehouseFloorId,
                        tower_floors: modifiedFloors.map(f => ({
                            id: f.id,
                            name: f.name,
                            tower_id: f.moduleId,
                            nodes: getNodesData(f.nodes),
                            devices: f.devices
                        }))
                    });
                    if (res?.error) throw new Error(res.error);
                }

                if (newFloors.length > 0 || modifiedFloors.length > 0 || towerFloorsToDelete.length > 0) {
                    clearModifiedFlags();
                    clearDeleteQueue();
                    notify.success("Lưu cấu hình tầng thành công");
                    refreshFloor();
                } else {
                    notify.warning("Không có thay đổi tầng để lưu");
                }
            } else if (activeTab === "area") {
                const floorPrefix = `wFloor_${currentWarehouseFloorId}:`;
                const getZoneData = (area: AreaConfig, nodes: string[]) => {
                    const nodeIds = nodes.map(k => {
                        const fullKey = `${floorPrefix}${k}`;
                        const node = savedNodes[fullKey];
                        return node?.nodeId;
                    }).filter(Boolean) as string[];

                    return {
                        name: area.name,
                        code: area.code,
                        zone_type_id: area.zoneTypeId || '',
                        tower_floor_id: area.floorId,
                        node_ids: nodeIds,
                        ...(area.inbound_direction_x ? { inbound_direction_x: area.inbound_direction_x } : {}),
                        ...(area.inbound_direction_y ? { inbound_direction_y: area.inbound_direction_y } : {}),
                        ...(area.id && !area.isNew ? { id: area.id } : {}),
                        ...(area.product_id ? { product_id: area.product_id } : {}),
                    };
                };

                const newAreas = finalAreas.filter(a => a.isNew);
                const modifiedAreas = finalAreas.filter(a => !a.isNew && a.isModified);

                const invalidAreas = [...newAreas, ...modifiedAreas].filter(a => !a.floorId);
                if (invalidAreas.length > 0) {
                    notify.error("Vui lòng chọn vị trí trên bản đồ để tự động gán Tầng cho Khu vực.");
                    setIsSaving(false);
                    return;
                }
                // bắt lỗi crasch sau 10s
                const newZones = newAreas.map(a => getZoneData(a, a.nodes));
                const modifiedZones = modifiedAreas.map(a => getZoneData(a, a.nodes));

                // Validate: Ensure that every zone has at least one valid node ID in the database
                const zoneWithNoNodes = [...newZones, ...modifiedZones].find(z => z.node_ids.length === 0);
                if (zoneWithNoNodes) {
                    notify.error(`Khu vực "${zoneWithNoNodes.name || 'Chưa đặt tên'}" chưa chứa vị trí (Node) nào được lưu trên Tầng. Vui lòng cấu hình và Lưu tại tab "Tầng" cho các ô này trước!`);
                    setIsSaving(false);
                    return;
                }

                if (modifiedAreas.length > 0) {
                    const res: any = await updateZone(id, modifiedZones as ZoneUpdateProps[]);
                    if (res?.error) throw new Error(res.error);
                }
                if (newAreas.length > 0) {
                    const res: any = await createZone(id, newZones as any);
                    if (res?.error) throw new Error(res.error);
                }
                if (zonesToDelete.length > 0) {
                    const res: any = await bulkDeleteZones(id, zonesToDelete);
                    if (res?.error) throw new Error(res.error);
                }

                if (newAreas.length > 0 || modifiedAreas.length > 0 || zonesToDelete.length > 0) {
                    clearModifiedFlags();
                    clearDeleteQueue();
                    notify.success("Lưu cấu hình khu vực thành công");
                    refreshFloor();
                } else {
                    notify.warning("Không có thay đổi khu vực để lưu");
                }
            } else if (activeTab === "position") {
                if (selectedCells.size > 0) {
                    const selectedArr = Array.from(selectedCells);

                    // Check if all selected cells belong to a zone
                    const cellsWithoutZone = selectedArr.filter(cell => !filteredAreas.some(a => a.nodes.includes(cell)));
                    if (cellsWithoutZone.length > 0) {
                        notify.error("Vị trí được chọn chưa thuộc khu vực (Zone) nào. Vui lòng thiết lập khu vực trước!");
                        setIsSaving(false);
                        return;
                    }

                    const floorPrefix = `wFloor_${currentWarehouseFloorId}:`;

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

                        return qrChanged || directionsChanged || nameChanged;
                    });

                    if (changedNodes.length === 0) {
                        notify.warning("Không có thay đổi vị trí");
                    } else {
                        const firstCell = changedNodes[0];
                        const area = filteredAreas.find(a => a.nodes.includes(firstCell));
                        upsertNodes(changedNodes, posDirections, isSingleSelect ? posQrCode : "", area?.areaType, false, posName);

                        const directionsArr: string[] = [];
                        directionsArr.push(posDirections.up ? '1' : '0');
                        directionsArr.push(posDirections.right ? '1' : '0');
                        directionsArr.push(posDirections.down ? '1' : '0');
                        directionsArr.push(posDirections.left ? '1' : '0');

                        if (changedNodes.length === 1) {
                            const node = savedNodes[`${floorPrefix}${firstCell}`];
                            const singleNodeData: NodeProps = {
                                code: node?.name || "",
                                name: posName || node?.name || "",
                                qrcode: isSingleSelect ? posQrCode : node?.qrCode,
                                directions: directionsArr as any
                            };
                            const res: any = await updateNode(id, node?.nodeId || "", singleNodeData);
                            if (res?.error) throw new Error(res.error);
                        } else {
                            const nodeItems = changedNodes.map(k => {
                                const node = savedNodes[`${floorPrefix}${k}`];
                                return {
                                    node_id: node?.nodeId || '',
                                    qrcode: isSingleSelect ? posQrCode : node?.qrCode
                                };
                            }).filter(item => item.node_id);

                            const nodeBulkData: NodeBulkProps = {
                                items: nodeItems as any,
                                directions: directionsArr as any
                            };
                            const res: any = await updateNodeBulk(id, nodeBulkData);
                            if (res?.error) throw new Error(res.error);
                        }
                        notify.success("Lưu dữ liệu vị trí thành công");
                        refreshFloor();
                    }
                }
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
        const hasUnsaved = floors.some(f => f.isNew) || areas.some(a => a.isNew) || positionItems.some(p => p.isNew);
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
    const [moduleKeys, setModuleKeys] = useState<string[]>([modules[0]?.id ?? ""]);
    const [floorKeys, setFloorKeys] = useState<string[]>([]);
    const [areaKeys, setAreaKeys] = useState<string[]>([]);
    const [positionKeys, setPositionKeys] = useState<string[]>([]);

    useEffect(() => {
        if (filteredFloors.length > 0) {
            const lastId = filteredFloors[filteredFloors.length - 1].id;
            if (!floorKeys.includes(lastId)) setFloorKeys(prev => [...prev, lastId]);
        }
    }, [filteredFloors.length]);

    useEffect(() => {
        if (filteredAreas.length > 0) {
            const lastId = filteredAreas[filteredAreas.length - 1].id;
            if (!areaKeys.includes(lastId)) setAreaKeys(prev => [...prev, lastId]);
        }
    }, [filteredAreas.length]);

    useEffect(() => {
        if (filteredPositionItems.length > 0) {
            const lastId = filteredPositionItems[filteredPositionItems.length - 1].key;
            if (!positionKeys.includes(lastId)) setPositionKeys(prev => [...prev, lastId]);
        }
    }, [filteredPositionItems.length]);

    useEffect(() => {
        if (activeTab === "position" && selectedCells.size > 0) {
            const selectedArr = Array.from(selectedCells);
            const firstCell = selectedArr[0];
            const prefix = `wFloor_${currentWarehouseFloorId}:`;
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
            if (activeTab === 'floor') {
                const fl = floors.find(f => f.id === editingId);
                const isChanged = fl && (fl.nodes.length !== currentKeys.length || fl.nodes.some((k, i) => k !== currentKeys[i]));
                if (isChanged) updateFloor(editingId, { nodes: currentKeys });
            } else if (activeTab === 'area') {
                const ar = areas.find(a => a.id === editingId);
                if (ar) {
                    let newFloorId = ar.floorId;
                    if (currentKeys.length > 0) {
                        const firstCell = currentKeys[0];
                        const matchedFloor = floors.find(f => f.nodes.includes(firstCell));
                        if (matchedFloor && matchedFloor.id !== newFloorId) {
                            newFloorId = matchedFloor.id;
                        }
                    } else {
                        newFloorId = '';
                    }

                    const isChanged = ar.nodes.length !== currentKeys.length || ar.nodes.some((k, i) => k !== currentKeys[i]) || newFloorId !== ar.floorId;
                    if (isChanged) {
                        updateArea(editingId, { nodes: currentKeys, floorId: newFloorId });
                    }
                }
            }
        }
    }, [selectedCells, editingId, activeTab, floors, areas, updateFloor, updateArea, removeNodes]);
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
            if (activeTab === 'floor') {
                setFloorKeys(prev => prev.includes(editingId) ? prev : [...prev, editingId]);
            } else if (activeTab === 'area') {
                setAreaKeys(prev => prev.includes(editingId) ? prev : [...prev, editingId]);

                const area = areas.find(a => a.id === editingId);
                if (area?.category_id) {
                    setSelectedCategories(area.category_id);
                }
            } else if (activeTab === 'position') {
                setPositionKeys(prev => prev.includes(editingId) ? prev : [...prev, editingId]);
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
    const moduleOptions = modules.filter(m => m.name).map(m => ({ value: m.id, label: m.name || m.id }));
    const floorOptions = filteredFloors.filter(f => f.name).map(f => ({ value: f.id, label: f.name }));

    /* ---- Device categories ---- */
    const deviceCategories = useMemo(() => {
        const cats = new Map<string, typeof MOCK_DEVICES>();
        MOCK_DEVICES.forEach(d => {
            if (!cats.has(d.category)) cats.set(d.category, []);
            cats.get(d.category)!.push(d);
        });
        return cats;
    }, []);

    return (
        <ModalThemeProvider>
            <div className="flex flex-col bg-white rounded-[20px] min-h-full font-inter relative overflow-y-auto lg:overflow-hidden no-scrollbar">
                {contextHolder}
                {isLoading && (
                    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/70 backdrop-blur-[2px] ">
                        <LoadingComponent />
                    </div>
                )}
                <div className="flex flex-row justify-between items-center py-[20px] px-[15px] pb-0 mb-[20px]">
                    <p className="text-[14px] font-medium text-[#141416] truncate">Thiết lập cấu hình kho</p>
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
                                {/* <CustomSelect
                                    value={currentWarehouseFloorId}
                                    onChange={(val: string) => {
                                        setCurrentWarehouseFloorId(val);
                                        setEditingId(null);
                                        setSelectedCells(new Set());
                                    }}
                                    options={warehouseFloors.map(wf => ({
                                        value: wf.id.toString(),// chuyển /floor/gi thành tầng 
                                        label: wf.name ? wf.name.replace(/floor/gi, "Tầng") : `Tầng ${wf.floor_number || ''}`
                                    }))}
                                    style={{ width: 210, height: 35, border: "0.5px solid #076eb8", color: "#076eb8", borderRadius: "8px" }}
                                    suffixIcon={
                                        <svg width="14.45" height="7.16" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.6675 8.5975C7.9675 8.5975 7.2675 8.3275 6.7375 7.7975L0.2175 1.2775C-0.0725 0.987499 -0.0725 0.5075 0.2175 0.2175C0.5075 -0.0725 0.9875 -0.0725 1.2775 0.2175L7.7975 6.7375C8.2775 7.2175 9.0575 7.2175 9.5375 6.7375L16.0575 0.2175C16.3475 -0.0725 16.8275 -0.0725 17.1175 0.2175C17.4075 0.5075 17.4075 0.987499 17.1175 1.2775L10.5975 7.7975C10.0675 8.3275 9.3675 8.5975 8.6675 8.5975Z" fill="#076eb8" />
                                        </svg>
                                    }
                                /> */}
                            </ConfigProvider>
                        </div>
                        {/* <Button
                            onClick={() => setCopyModalVisible(true)}
                            style={{ width: 92, height: 35, borderRadius: 8, border: "0.5px solid #076eb8", backgroundColor: "#076EB8" }}
                            type="primary"
                        >Hành động</Button> */}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 min-h-0 border-t-[0.5px] border-[#D9D9D9] ">
                    <div className={`flex flex-col  border-b lg:border-b-0 lg:border-r border-[#D9D9D9] pt-[10px] pr-[15px] pl-[15px] w-full lg:w-[500px] shrink-0 gap-[15px] relative h-auto lg:h-full pb-[60px] lg:pb-[60px] overflow-hidden`}>
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
                            {activeTab === "module" && (
                                <OverlayScrollbarsComponent
                                    defer
                                    options={{
                                        scrollbars: {
                                            visibility: 'hidden',
                                        },
                                    }}
                                    className="w-full max-h-[580px] lg:max-h-[calc(100vh-280px)]"
                                >

                                    <div className="flex flex-col gap-3 pr-[15px] pl-[1px] pb-4">
                                        <Collapse
                                            activeKey={moduleKeys}
                                            onChange={(k) => setModuleKeys(k as string[])}

                                            expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? -180 : 0} style={{ color: "#076EB8", fontSize: 12 }} />}
                                            expandIconPlacement="end" collapsible="header"
                                            style={{ background: "transparent", border: "none" }}
                                            styles={collapseStyles}
                                            items={modules.map((mod) => {
                                                const isExpanded = moduleKeys.includes(mod.id);
                                                return {
                                                    key: mod.id,
                                                    label: <span className="font-normal text-[#076EB8] text-[14px] !h-[35px]">{mod.name || `Module kho ${modules.indexOf(mod) + 1}`}</span>,

                                                    style: { marginBottom: 12, border: "0.5px solid #076eb8", borderRadius: "8px", overflow: "hidden", background: "#fff", boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.05)" },
                                                    children: (
                                                        <div>
                                                            <div className="h-[0.5px] bg-[#076eb8] mx-4" />
                                                            <div className="flex flex-col gap-[15px] pt-[15px] pb-[15px] pr-[20px] pl-[15px]">
                                                                <FormRow label="Mã module kho" required>
                                                                    <CustomInput disabled placeholder="Nhập mã" className='!h-[35px] !text-[#54545499] !rounded-[8px]' value={mod.code} onChange={(e) => updateModule(mod.id, { code: e.target.value })} />
                                                                </FormRow>
                                                                <FormRow label="Tên module kho" required>
                                                                    <CustomInput placeholder="Nhập tên module kho" className='!h-[35px] !text-[#484848] !rounded-[8px]' value={mod.name} onChange={(e) => updateModule(mod.id, { name: e.target.value })} />
                                                                </FormRow>
                                                                <FormRow label="Loại module" required>
                                                                    <CustomSelect options={[
                                                                        { label: "Mặt sàn di chuyển", value: "FLOOR" },
                                                                        { label: "Tháp", value: "TOWER" },
                                                                    ]} value={mod.tower_type} className="!text-[#484848] !h-[35px]  !rounded-[8px]" onChange={(v) => updateModule(mod.id, { tower_type: v })} />
                                                                </FormRow>
                                                                <FormRow label="Sử dụng">
                                                                    <Switch size="small" checked={mod.is_active} onChange={(e) => updateModule(mod.id, { is_active: e })} />
                                                                </FormRow>
                                                            </div>
                                                        </div>
                                                    ),
                                                };
                                            })}
                                        />
                                    </div>
                                </OverlayScrollbarsComponent>
                            )}

                            {activeTab === "floor" && (
                                <OverlayScrollbarsComponent
                                    defer
                                    options={{
                                        scrollbars: {
                                            visibility: 'hidden',
                                        },
                                    }}
                                    className="w-full max-h-[580px] lg:max-h-[calc(100vh-280px)]"
                                >
                                    <div className="flex flex-col gap-3 pr-[15px] pl-[1px] pb-4">
                                        <Collapse
                                            activeKey={floorKeys}
                                            onChange={(k) => setFloorKeys(k as string[])}
                                            expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? -180 : 0} style={{ color: "#076EB8", fontSize: 12 }} />}
                                            expandIconPlacement="end" collapsible="header"
                                            style={{ background: "transparent", border: "none" }}
                                            styles={collapseStyles}
                                            items={filteredFloors.map((fl, idx) => {
                                                const isExpanded = floorKeys.includes(fl.id);
                                                return {
                                                    key: fl.id,
                                                    label: (
                                                        <div
                                                            className="w-full"
                                                            onClick={() => {
                                                                if (editingId !== fl.id) handleEdit(fl.id, fl.nodes);
                                                            }}
                                                        >
                                                            <span className="font-normal text-[#076EB8] text-[14px]">{fl.name || `Tầng module ${idx + 1}`}</span>
                                                        </div>
                                                    ),
                                                    style: { marginBottom: 12, border: "0.5px solid #076eb8", borderRadius: "8px", overflow: "hidden", background: "#fff", boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.05)" },
                                                    children: (
                                                        <div>
                                                            <div className="h-[0.5px] bg-[#076eb8] mx-4" />
                                                            <div id={`collapse-item-${fl.id}`} className={`flex flex-col gap-3 pt-3 pb-2 px-2.5 ${fl.id === editingId && 'bg-[#F8FCFF]'}`}>
                                                                <FormRow label="Module kho" required>
                                                                    <CustomSelect className="!text-[#484848] !h-[35px] !rounded-[8px]" placeholder="Chọn Module kho" options={moduleOptions} value={fl.moduleId || undefined} onChange={(v) => updateFloor(fl.id, { moduleId: v })} />
                                                                </FormRow>
                                                                <FormRow label="Tên tầng" required>
                                                                    <CustomInput className='!h-[35px] !text-[#484848] !rounded-[8px]' placeholder="Nhập tên tầng" value={fl.name} onChange={(e) => updateFloor(fl.id, { name: e.target.value })} />
                                                                </FormRow>
                                                                <FormRow label="Vị trí" required>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[12px] text-[#484848] truncate">Đã chọn: {editingId === fl.id ? selectedCells.size : fl.nodes.length} vị trí</span>
                                                                        <SelectedCellsTags
                                                                            cells={editingId === fl.id ? Array.from(selectedCells) : fl.nodes}
                                                                            canRemove={editingId === fl.id}
                                                                            onRemove={(cell) => { const n = new Set(selectedCells); n.delete(cell); setSelectedCells(n); }}
                                                                        />
                                                                    </div>
                                                                </FormRow>
                                                                <FormRow label="Thiết bị" required>
                                                                    <div className="flex flex-col gap-2 min-h-0">
                                                                        <CustomInput
                                                                            placeholder="Tìm kiếm thiết bị"
                                                                            value={deviceSearch}
                                                                            onChange={(e) => setDeviceSearch(e.target.value)}
                                                                            className='!h-[35px] !text-[#54545499] !rounded-[8px]'
                                                                        />
                                                                        <OverlayScrollbarsComponent
                                                                            defer
                                                                            options={{
                                                                                scrollbars: {
                                                                                    autoHide: 'leave',
                                                                                    autoHideDelay: 500,
                                                                                },
                                                                            }}
                                                                            style={{ maxHeight: '200px' }}
                                                                            className="border border-[#D6E4F0] rounded-lg p-1.5 bg-[#F9FBFF]"
                                                                        >
                                                                            {Object.entries(groupedDevices).length === 0 && (
                                                                                <div className="text-center py-4 text-[#545454] text-[12px]">Không có thiết bị nào</div>
                                                                            )}
                                                                            {Object.entries(groupedDevices).map(([cat, devices]) => {
                                                                                const filtered = devices.filter(d =>
                                                                                    d.name?.toLowerCase().includes(deviceSearch.toLowerCase()) ||
                                                                                    d.code?.toLowerCase().includes(deviceSearch.toLowerCase())
                                                                                );
                                                                                if (filtered.length === 0) return null;
                                                                                return (
                                                                                    <div key={cat} className="flex flex-col mb-2 last:mb-0">
                                                                                        <div className="flex justify-between items-center px-2 py-1 bg-[#F0F7FF] rounded mb-1 border border-[#D6E4F0] w-full min-w-[270px]">
                                                                                            <span className="text-[12px] font-bold text-[#076EB8]">{cat}</span>
                                                                                            <DownOutlined style={{ fontSize: 9, color: '#076EB8' }} />
                                                                                        </div>
                                                                                        <div className="flex flex-col gap-0.5">
                                                                                            {filtered.map(d => {
                                                                                                const selectedDevice = fl.devices?.find(sd => sd.id === d.id);
                                                                                                return (
                                                                                                    <div key={d.id} className="flex justify-between items-center px-2 py-1.5 hover:bg-white rounded border border-transparent hover:border-[#D6E4F0] transition-all w-full min-w-[270px]">
                                                                                                        <span className="text-[12px] text-[#484848] font-medium truncate max-w-[100px]" title={d.name}>
                                                                                                            {d.name || d.code}
                                                                                                        </span>
                                                                                                        <div className="flex gap-1 flex-shrink-0">
                                                                                                            {[
                                                                                                                { label: 'Nhập', value: 'INBOUND', color: '#27AE60', bg: '#E8F8EF' },
                                                                                                                { label: 'Xuất', value: 'OUTBOUND', color: '#E67E22', bg: '#FEF4E8' },
                                                                                                                { label: 'Đa năng', value: 'MULTIPLE', color: '#076EB8', bg: '#E8F2FA' }
                                                                                                            ].map((p) => {
                                                                                                                const isActive = selectedDevice?.purpose === p.value;
                                                                                                                return (
                                                                                                                    <button
                                                                                                                        key={p.value}
                                                                                                                        onClick={() => {
                                                                                                                            let nextDevices = [...(fl.devices || [])];
                                                                                                                            const idx = nextDevices.findIndex(sd => sd.id === d.id);
                                                                                                                            if (idx > -1) {
                                                                                                                                if (isActive) {
                                                                                                                                    nextDevices.splice(idx, 1);
                                                                                                                                } else {
                                                                                                                                    nextDevices[idx] = { ...nextDevices[idx], purpose: p.value as any };
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                nextDevices.push({ id: d.id, purpose: p.value as any });
                                                                                                                            }
                                                                                                                            updateFloor(fl.id, { devices: nextDevices });
                                                                                                                        }}
                                                                                                                        className="px-1.5 py-0.5 text-[9px] rounded border transition-all"
                                                                                                                        style={{
                                                                                                                            borderColor: isActive ? p.color : '#D6E4F0',
                                                                                                                            background: isActive ? p.bg : '#fff',
                                                                                                                            color: isActive ? p.color : '#484848',
                                                                                                                            minWidth: 42
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        {p.label}
                                                                                                                    </button>
                                                                                                                );
                                                                                                            })}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </OverlayScrollbarsComponent>
                                                                    </div>
                                                                </FormRow>
                                                                <ActionIcons onEdit={() => handleEdit(fl.id, fl.nodes)} onDelete={() => removeFloor(fl.id)} />
                                                            </div>
                                                        </div>
                                                    ),
                                                };
                                            })}
                                        />
                                        <AddButton onClick={() => {
                                            if (editingId) saveFloorNodes(editingId, Array.from(selectedCells));
                                            addFloor();
                                        }} />
                                    </div>
                                </OverlayScrollbarsComponent>
                            )}

                            {activeTab === "area" && (
                                <OverlayScrollbarsComponent
                                    defer
                                    options={{
                                        scrollbars: {
                                            visibility: 'hidden',
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
                                                                <FormRow label="Tầng" required>
                                                                    <CustomSelect
                                                                        className="!text-[#54545499] !h-[35px] !rounded-[8px]"
                                                                        placeholder="Chọn tầng"
                                                                        options={floorOptions}
                                                                        value={area.floorId || undefined}
                                                                        onChange={(v) => updateArea(area.id, { floorId: v })}
                                                                        disabled
                                                                        suffixIcon={
                                                                            <svg width="14.45" height="7.16" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M8.6675 8.5975C7.9675 8.5975 7.2675 8.3275 6.7375 7.7975L0.2175 1.2775C-0.0725 0.987499 -0.0725 0.5075 0.2175 0.2175C0.5075 -0.0725 0.9875 -0.0725 1.2775 0.2175L7.7975 6.7375C8.2775 7.2175 9.0575 7.2175 9.5375 6.7375L16.0575 0.2175C16.3475 -0.0725 16.8275 -0.0725 17.1175 0.2175C17.4075 0.5075 17.4075 0.987499 17.1175 1.2775L10.5975 7.7975C10.0675 8.3275 9.3675 8.5975 8.6675 8.5975Z" fill="#076eb8" />
                                                                            </svg>
                                                                        }
                                                                    />
                                                                </FormRow>
                                                                <FormRow label="Loại khu vực" required>
                                                                    <CustomSelect
                                                                        className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                                        placeholder="Chọn loại khu vực"
                                                                        options={zoneTypes.map(zt => ({ value: zt.id, label: zt.name }))}
                                                                        value={area.zoneTypeId || undefined}
                                                                        onChange={(v) => {
                                                                            const selected = zoneTypes.find(zt => zt.id === v);
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
                                                                    <FormRow label="Chiều nhập trục X" required>
                                                                        <CustomSelect
                                                                            className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                                            placeholder="Chọn chiều nhập trục X"
                                                                            options={[
                                                                                { value: 'LEFT_TO_RIGHT', label: 'Nhập từ trái sang phải' },
                                                                                { value: 'RIGHT_TO_LEFT', label: 'Nhập từ phải sang trái' },
                                                                            ]}
                                                                            value={area.inbound_direction_x || undefined}
                                                                            onChange={(v) => updateArea(area.id, { inbound_direction_x: v })}
                                                                        />
                                                                    </FormRow>
                                                                    <FormRow label="Chiều nhập trục Y" required>
                                                                        <CustomSelect
                                                                            className="!text-[#484848] !h-[35px] !rounded-[8px]"
                                                                            placeholder="Chọn chiều nhập trục Y"
                                                                            options={[
                                                                                { value: 'TOP_TO_BOTTOM', label: 'Nhập từ trên xuống dưới' },
                                                                                { value: 'BOTTOM_TO_TOP', label: 'Nhập từ dưới lên trên' },
                                                                            ]}
                                                                            value={area.inbound_direction_y || undefined}
                                                                            onChange={(v) => updateArea(area.id, { inbound_direction_y: v })}
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

                                                                <ActionIcons onEdit={() => handleEdit(area.id, area.nodes)} onDelete={() => removeArea(area.id)} />
                                                            </div>
                                                        </div>
                                                    ),
                                                };
                                            })}
                                        />
                                        <AddButton onClick={() => {
                                            if (editingId) saveAreaNodes(editingId, Array.from(selectedCells));
                                            addArea('');
                                        }} />
                                    </div>
                                </OverlayScrollbarsComponent>
                            )}
                            <OverlayScrollbarsComponent
                                defer
                                options={{
                                    scrollbars: {
                                        visibility: 'hidden',
                                    },
                                }}
                                className="w-full max-h-[580px] lg:max-h-[calc(100vh-280px)]"
                            >
                                {activeTab === "position" && (

                                    <div className="pr-[15px]">
                                        <div className="flex flex-col gap-4 bg-white p-4 rounded-lg" style={{ border: "0.5px solid #076eb8", boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.05)" }}>
                                            {isSingleSelect && (
                                                <FormRow label="Tên vị trí" required>
                                                    <CustomInput
                                                        placeholder="Nhập tên vị trí"
                                                        value={posName}
                                                        onChange={(e) => setPosName(e.target.value)}
                                                        className='!h-[35px] !text-[#484848] !rounded-[8px]'
                                                    />
                                                </FormRow>
                                            )}

                                            <FormRow label="Vị trí" required>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] text-[#484848] truncate">Đã chọn: {selectedCells.size} vị trí</span>
                                                    <SelectedCellsTags
                                                        cells={Array.from(selectedCells)}
                                                        canRemove={true}
                                                        onRemove={(cell) => { const n = new Set(selectedCells); n.delete(cell); setSelectedCells(n); }}
                                                    />
                                                </div>
                                            </FormRow>

                                            {isSingleSelect && (
                                                <FormRow label="QR Code" required>
                                                    <CustomInput
                                                        placeholder="Nhập mã QR Code"
                                                        value={posQrCode}
                                                        onChange={(e) => setPosQrCode(e.target.value)}
                                                        className='!h-[35px] !text-[#484848] !rounded-[8px]'
                                                    />
                                                </FormRow>
                                            )}

                                            <FormRow label="Hướng đi" required>
                                                <Select
                                                    style={{ width: "100%" }}
                                                    className="!h-[35px] !rounded-[8px] !text-[#54545499]"
                                                    mode="multiple" placeholder="Chọn hướng di chuyển"
                                                    value={Object.entries(posDirections).filter(([_, v]) => v).map(([k]) => k)}
                                                    onChange={(vals: string[]) => {
                                                        const newDirs: DirectionFlags = { up: false, down: false, left: false, right: false };
                                                        vals.forEach(v => { if (v in newDirs) newDirs[v as keyof DirectionFlags] = true; });
                                                        setPosDirections(newDirs);
                                                    }}
                                                    options={[{ value: 'up', label: 'Trên' }, { value: 'down', label: 'Dưới' }, { value: 'left', label: 'Trái' }, { value: 'right', label: 'Phải' }]}
                                                />
                                            </FormRow>

                                            <FormRow label="Hình ảnh">
                                                <div className="w-20 h-20 border border-[#D6E4F0] rounded-lg flex flex-col items-center justify-center bg-[#F8FCFF] overflow-hidden">
                                                    <img
                                                        src={`/svgMap/${positionPreviewImg}`}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain p-2"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/svgMap/node.svg';
                                                        }}
                                                    />
                                                </div>
                                            </FormRow>
                                        </div>
                                    </div>
                                )}
                            </OverlayScrollbarsComponent>
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

                <Modal
                    zIndex={1560}
                    title="Sao chép cấu hình sang tầng khác"
                    open={copyModalVisible}
                    onOk={() => {
                        if (fromWFloorId && fromWFloorId !== currentWarehouseFloorId) {
                            copyFloorConfig(fromWFloorId, currentWarehouseFloorId);
                            setCopyModalVisible(false);
                            setFromWFloorId("");
                        }
                    }}
                    onCancel={() => setCopyModalVisible(false)}
                    okText="Sao chép"
                    cancelText="Đóng"
                >
                    <div className="py-4">
                        <p className="mb-2 text-[#545454]">Chọn tầng để sao chép cấu hình sang <b>{warehouseFloors.find(wf => wf.id.toString() === currentWarehouseFloorId)?.name || 'tầng hiện tại'}</b>:</p>
                        <CustomSelect
                            placeholder="Chọn tầng nguồn"
                            style={{ width: '100%' }}
                            options={warehouseFloors.filter(wf => wf.id.toString() !== currentWarehouseFloorId).map(wf => ({ value: wf.id.toString(), label: wf.name || `Tầng ${wf.floor_number || ''}` }))}
                            value={fromWFloorId || undefined}
                            onChange={setFromWFloorId}
                        />
                    </div>
                </Modal>

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
                <button onClick={onEdit} className="w-7 h-7 rounded-full bg-[#076EB8] flex items-center justify-center text-[white] hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:outline-none">
                    <EditOutlined style={{ fontSize: 12 }} />
                </button>
            )}
            <button onClick={onDelete} className="w-7 h-7 rounded-full border-[#C60808] border-[1px] bg-white flex items-center justify-center text-[#C60808] hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:outline-none">
                <DeleteOutlined style={{ fontSize: 12 }} />
            </button>
        </div>
    );
}
// chuyển đổi tọa độ thành tên vị trí 
function SelectedCellsTags({ cells, canRemove, onRemove }: { cells: string[]; canRemove: boolean; onRemove: (cell: string) => void }) {
    const { currentWarehouseFloorId, warehouseFloors } = useWarehouseConfig();
    const currentFloorNum = warehouseFloors.find(wf => wf.id.toString() === currentWarehouseFloorId)?.floor_number || 1;
    if (cells.length === 0) return <div className="border-[0.5px] border-[#d9d9d9] bg-white rounded-lg p-2  h-[35px]min-h-[35px] text-[#545454] text-[14px] truncate ">Chọn vị trí trên bản đồ</div>;
    // code của vị trí tự sinh 
    const getLabel = (cell: string) => {
        const [r, c] = cell.split(',').map(Number);// 1. Tách toạ độ dạng chuỗi "hàng,cột" (ví dụ "0,3") thành 2 số: r (row) và c (column)
        let colName = '';
        // 2. Tự động chuyển đổi số thứ tự cột (0, 1, 2...) thành chữ cái (A, B, C... Z, AA, AB...)
        let ci = c;
        while (ci >= 0) {
            colName = String.fromCharCode(65 + (ci % 26)) + colName;
            ci = Math.floor(ci / 26) - 1;
        }
        // 3.Ghép lại: Tầng - Cột (chữ cái) - Hàng (cộng 1 cho dễ đọc)
        return `${currentFloorNum}-${colName}${r + 1}`;
    };
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
                        {getLabel(cell)}
                        {canRemove && <span className="text-red-500 cursor-pointer ml-0.5 font-bold text-[13px] leading-none" onClick={() => onRemove(cell)}>×</span>}
                    </span>
                ))}
            </div>
        </OverlayScrollbarsComponent>
    );
}



function AddButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex justify-center pt-2">
            <button onClick={onClick} className="text-[#076EB8] hover:opacity-80 rounded-full transition-opacity cursor-pointer focus:outline-none focus-visible:outline-none">
                <PlusCircleFilled style={{ fontSize: 24 }} />
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
