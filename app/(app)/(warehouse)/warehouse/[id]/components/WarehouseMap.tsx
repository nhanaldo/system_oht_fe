'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWarehouseConfig } from './WarehouseContext';
import { hasAnyDirection, getSelectedTileName, AreaConfig, PositionConfig } from './warehouse-types';

const CELL_SIZE = 30;
// bản đồ tương tác trực quan để hiển thị bên trái màn hình ( dạng lưới Grid)
//Nó vẽ sơ đồ kho lên một thẻ <canvas> của HTML5 (giúp tối ưu hiệu năng hiển thị hàng ngàn ô vuông cùng lúc thay vì dùng thẻ div).
//lấy tọa độ từ warehouse context để biết ô nào thuộc Tầng nào,
//  ô nào thuộc Khu vực nào để tô màu (xanh, xám) và chèn ảnh SVG lên đúng tọa độ.
//Xử lý các sự kiện chuột phức tạp của người dùng: Kéo chuột để quét chọn nhiều ô vuông (selectionBoxRef), 
// di chuột để xem thông tin ô (hoveredCell), hỗ trợ phóng to / thu nhỏ bản đồ (Zoom in / Zoom out).
/**
 * Component hiển thị bản đồ lưới của kho hàng (Canvas 2D)
 * Xử lý các logic: vẽ map, zoom, pan, select cells
 */
// Ngay đầu Component, nó sử dụng hook useWarehouseConfig() để lấy ra các State và các hàm cập nhật từ Context:
interface WarehouseMapProps {
  showDevices?: boolean;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({ showDevices = false }) => {
  const {
    activeTab, selectedCells, setSelectedCells, scale, setScale,
    nodes, floors, areas, getTakenCells, positionItems, initialEditingKeys,
    images, rows, columns, updateArea, editingId, setEditingId, setInitialEditingKeys,
    posDirections, posName, posQrCode, currentWarehouseFloorId, allProducts, categories,
    setActiveTab, readOnly, allDevices, allDeviceTypes, allLocations
  } = useWarehouseConfig();

  useEffect(() => {
    if (readOnly && showDevices) {
      // console.log("Nodes with qrCode:", Object.values(nodes).filter(n => n.qrCode).map(n => ({ key: n.key, name: n.name, qrCode: n.qrCode })));
      // console.log("All devices:", allDevices.map(d => ({ code: d.code, metadata: d.metadata })));
    }
  }, [nodes, allDevices, readOnly, showDevices]);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);// Khung cuộn bản đồ
  const containerRef = React.useRef<HTMLDivElement>(null);// Vùng chứa bản đồ (dùng tính tọa độ chuột)
  const canvasRef = React.useRef<HTMLCanvasElement>(null);// Thẻ canvas để vẽ bản đồ
  const selectionBoxRef = React.useRef<HTMLDivElement>(null);// Khung chọn vùng (khi kéo chuột)
  const selectionStateRef = React.useRef<{// Lưu trạng thái chọn vùng
    isSelecting: boolean;
    startX: number;
    startY: number;
    startClientX?: number;
    startClientY?: number;
  }>({ isSelecting: false, startX: 0, startY: 0 });

  const [visibleRange, setVisibleRange] = useState({
    rStart: 0, rEnd: 30,
    cStart: 0, cEnd: 40,
  });

  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);
  const [pinnedDeviceId, setPinnedDeviceId] = useState<string | null>(null);// gim khi onclick


  //Tính toán sơ bộ toạ độ bằng useMemo (Dòng 47 - 121)
  //Trước khi vẽ, bản đồ cần biết nhanh toạ độ nào thuộc về tầng nào hoặc khu vực nào. 
  // useMemo sẽ chạy để lọc ra danh sách ô chỉ thuộc về Tầng vật lý hiện tại (currentWarehouseFloorId) 
  // và tạo các bản đồ ánh xạ nhanh (Maps):
  const {
    floorNodes, areaNodes, areaMap, cellToAreaMap, nodeMap,
    cellToPositionItemMap, positionItemByKeyMap, cellToFloorMap,
    storageAreas
  } = useMemo(() => {
    const fNodes = new Set<string>();
    const aNodes = new Set<string>();
    const aMap = new Map<string, AreaConfig>();
    const cToAMap = new Map<string, string>();
    const nMap = new Map<string, PositionConfig>();
    const cToPIMap = new Map<string, typeof positionItems[0]>();
    const pIByKeyMap = new Map<string, typeof positionItems[0]>();
    const cToFMap = new Map<string, string>();

    const currentFloorIds = floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId).map(f => f.id);

    floors.filter(f => f.warehouseFloorId === currentWarehouseFloorId).forEach(f => {
      f.nodes.forEach(p => {
        fNodes.add(p);
        cToFMap.set(p, f.id);
      });
    });

    areas.filter(a => currentFloorIds.includes(a.floorId)).forEach(a => {
      aMap.set(a.id, a);
      a.nodes.forEach(p => {
        aNodes.add(p);
        cToAMap.set(p, a.id);
      });
    });

    const prefix = `wFloor_${currentWarehouseFloorId}:`;
    for (const fullKey in nodes) {
      if (fullKey.startsWith(prefix)) {
        nMap.set(fullKey.split(':')[1], nodes[fullKey]);
      }
    }

    positionItems.forEach(p => {
      pIByKeyMap.set(p.key, p);
      p.cellKeys?.forEach(k => cToPIMap.set(k, p));
    });

    const sAreas: { id: string; name: string; product_id?: string; center: { r: number, c: number }; nodes: Set<string>; isVertical: boolean }[] = [];
    areas.filter(a => (currentFloorIds.includes(a.floorId) || a.id === editingId) && a.areaType === 'storage').forEach(a => {
      // Use live selection if currently editing this area
      const activeNodes = a.id === editingId ? Array.from(selectedCells) : a.nodes;

      const coords = activeNodes.map(p => p.split(',').map(Number));
      if (coords.length === 0) return;
      const sumR = coords.reduce((acc, curr) => acc + curr[0], 0);
      const sumC = coords.reduce((acc, curr) => acc + curr[1], 0);

      const rows_coords = coords.map(c => c[0]);
      const cols_coords = coords.map(c => c[1]);
      const minR = Math.min(...rows_coords);
      const maxR = Math.max(...rows_coords);
      const minC = Math.min(...cols_coords);
      const maxC = Math.max(...cols_coords);
      const height = maxR - minR + 1;
      const width = maxC - minC + 1;

      sAreas.push({
        id: a.id,
        name: a.name,
        product_id: a.product_id,
        center: { r: sumR / coords.length, c: sumC / coords.length },
        nodes: new Set(activeNodes),
        isVertical: height > width
      });
    });

    return {
      floorNodes: fNodes, areaNodes: aNodes, areaMap: aMap,
      cellToAreaMap: cToAMap, nodeMap: nMap, cellToPositionItemMap: cToPIMap,
      positionItemByKeyMap: pIByKeyMap, cellToFloorMap: cToFMap,
      storageAreas: sAreas
    };
  }, [floors, areas, nodes, positionItems, currentWarehouseFloorId, editingId, selectedCells]);

  const hoveredArea = useMemo(() => {
    if (!hoveredCell) return null;
    const areaId = cellToAreaMap.get(hoveredCell);
    return areaId ? areaMap.get(areaId) : null;
  }, [hoveredCell, cellToAreaMap, areaMap]);

  const hoveredNode = useMemo(() => {
    if (!hoveredCell || activeTab !== 'position') return null;
    return nodeMap.get(hoveredCell);
  }, [hoveredCell, nodeMap, activeTab]);

  // Ref for event handlers to avoid stale closures
  const latestRef = React.useRef({
    activeTab, editingId, areas, cellToAreaMap, cellToFloorMap, areaNodes, floorNodes, selectedCells, getTakenCells, rows, columns, updateArea, setSelectedCells, setEditingId, setInitialEditingKeys, currentWarehouseFloorId, nodeMap
  });
  useEffect(() => {
    latestRef.current = {
      activeTab, editingId, areas, cellToAreaMap, cellToFloorMap, areaNodes, floorNodes, selectedCells, getTakenCells, rows, columns, updateArea, setSelectedCells, setEditingId, setInitialEditingKeys, currentWarehouseFloorId, nodeMap
    };
  });

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
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleResize = () => {
      const cw = el.clientWidth - 50;
      const ch = el.clientHeight - 50;
      const sw = columns * CELL_SIZE;
      const sh = rows * CELL_SIZE;
      // Tự động tính tỷ lệ co giãn tối đa để vừa khít hoàn hảo với màn hình hiển thị (không giới hạn bởi 1)
      const fit = Math.min(cw / sw, ch / sh);

      // Trên thiết bị di động/máy tính bảng (chiều ngang hẹp), không để tỷ lệ zoom nhỏ hơn 0.65
      // để các ô kệ hiển thị to, rõ ràng và dễ dàng bấm chọn bằng ngón tay. Người dùng có thể cuộn ngang để xem.
      const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
      const finalFit = isMobile ? Math.max(0.65, fit) : fit;

      setScale(Math.round(finalFit * 100) / 100);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setScale, rows, columns]);

  /** 
   * Tính toán vùng hiển thị (visibleRange) hiện tại trên canvas khi người dùng cuộn (scroll) bản đồ 
   * Giúp tối ưu hiệu năng: chỉ vẽ những ô nằm trong khung nhìn
   */
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = scrollContainerRef.current;
    const rStart = Math.max(0, Math.floor(scrollTop / (CELL_SIZE * scale)) - 2);
    const rEnd = Math.min(rows - 1, Math.ceil((scrollTop + clientHeight) / (CELL_SIZE * scale)) + 2);
    const cStart = Math.max(0, Math.floor(scrollLeft / (CELL_SIZE * scale)) - 2);
    const cEnd = Math.min(columns - 1, Math.ceil((scrollLeft + clientWidth) / (CELL_SIZE * scale)) + 2);
    setVisibleRange(prev => {
      if (prev.rStart === rStart && prev.rEnd === rEnd && prev.cStart === cStart && prev.cEnd === cEnd) return prev;
      return { rStart, rEnd, cStart, cEnd };
    });
  }, [scale, rows, columns]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    scrollContainer.addEventListener('scroll', onScroll);
    handleScroll();
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  // Scroll to selected nodes when editingId changes
  useEffect(() => {
    if (editingId && selectedCells.size > 0 && scrollContainerRef.current) {
      const coords = Array.from(selectedCells).map(k => k.split(',').map(Number));
      const minR = Math.min(...coords.map(c => c[0]));
      const maxR = Math.max(...coords.map(c => c[0]));
      const minC = Math.min(...coords.map(c => c[1]));
      const maxC = Math.max(...coords.map(c => c[1]));

      const centerR = (minR + maxR + 1) / 2;
      const centerC = (minC + maxC + 1) / 2;

      const container = scrollContainerRef.current;
      const targetX = (centerC * CELL_SIZE * scale) - (container.clientWidth / 2) + 40; // +40 for margins
      const targetY = (centerR * CELL_SIZE * scale) - (container.clientHeight / 2) + 32;

      container.scrollTo({
        left: Math.max(0, targetX),
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
    }
  }, [editingId]); // Only trigger when we start editing a new item

  //Sử dụng requestAnimationFrame để giới hạn tần suất vẽ lại Canvas tối đa bằng tần số quét màn hình (60 FPS), loại bỏ lag.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = columns * CELL_SIZE;
    const h = rows * CELL_SIZE;
    const resolutionScale = scale * dpr;
    if (canvas.width !== Math.floor(w * resolutionScale) || canvas.height !== Math.floor(h * resolutionScale)) {
      canvas.width = Math.floor(w * resolutionScale);
      canvas.height = Math.floor(h * resolutionScale);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    // Vẽ đường lưới
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(resolutionScale, 0, 0, resolutionScale, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#677594";
    for (let r = visibleRange.rStart; r <= visibleRange.rEnd; r++) {
      for (let c = visibleRange.cStart; c <= visibleRange.cEnd; c++) {
        ctx.beginPath();
        ctx.arc(c * CELL_SIZE + CELL_SIZE / 2, r * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const isEditing = !!editingId;
    const currentPosItem = isEditing && activeTab === 'position' ? positionItemByKeyMap.get(editingId!) : null;
    const currentArea = isEditing && activeTab === 'area' ? areaMap.get(editingId!) : null;
    for (let r = visibleRange.rStart; r <= visibleRange.rEnd; r++) {
      for (let c = visibleRange.cStart; c <= visibleRange.cEnd; c++) {
        const key = `${r},${c}`;
        const isSelected = selectedCells.has(key);
        const hasFloorPos = floorNodes.has(key);
        const hasAreaPos = areaNodes.has(key);
        const nodeConfig = nodeMap.get(key);
        let imgName = '';
        let bgColor = ''
        // hiển thị màu khi onclick vào ô ở tầng
        if (isSelected) bgColor = 'rgba(7, 110, 184, 0.4)';

        if (activeTab === 'floor') {
          if (hasFloorPos && !bgColor) bgColor = 'rgba(7, 110, 184, 0.15)';
          if (hasFloorPos || isSelected) imgName = 'node.svg';
        } else if (activeTab === 'area') {
          // Show floor as gray
          if (hasFloorPos && !bgColor) bgColor = '#D8D8D833';

          const isPartOfCurrentEditingArea = isEditing && initialEditingKeys.has(key);
          // gọi hàm bên warehouse-types để lấy tên ảnh 
          if (isSelected && isEditing) {
            imgName = getSelectedTileName({ up: false, down: false, left: false, right: false }, currentArea?.areaType);
          } else if (isPartOfCurrentEditingArea && !isSelected) {
            // This was part of the area but is now deselected - show as floor (gray)
            if (hasFloorPos || isSelected) imgName = 'node.svg';
          } else if (hasAreaPos) {
            const areaId = cellToAreaMap.get(key);
            const area = areaId ? areaMap.get(areaId) : null;
            imgName = getSelectedTileName({ up: false, down: false, left: false, right: false }, area?.areaType);
          } else if (hasFloorPos || isSelected) {
            imgName = 'node.svg';
          }
        } else if (activeTab === 'position') {
          // Show Area and Position
          if (isSelected) {
            // Khi đang click chọn/chỉnh sửa ở tab Vị trí
            const areaId = cellToAreaMap.get(key);
            const area = areaId ? areaMap.get(areaId) : null;
            // Lấy tên ảnh dựa trên hướng đi của form (posDirections) và loại khu vực hiện tại
            imgName = getSelectedTileName(posDirections, area?.areaType);
          } else if (nodeConfig && hasAnyDirection(nodeConfig.directions)) {
            // Nếu ô đã lưu cấu hình hướng đi từ trước, lấy ảnh tương ứng của nó
            imgName = nodeConfig.imgName || '';
          } else if (hasAreaPos) {
            const areaId = cellToAreaMap.get(key);
            const area = areaId ? areaMap.get(areaId) : null;
            // Lấy tên ảnh cơ bản (không hướng) dựa trên loại khu vực
            imgName = getSelectedTileName({ up: false, down: false, left: false, right: false }, area?.areaType);
          } else if (hasFloorPos) {
            // Maybe show floor dots or nothing? User said "hiển thị khu vực và vị trí"
            // I'll keep it subtle or just dots.
          }
        }
        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        // vẻ ảnh lên tọa độ c(cột) và r (hàng)
        if (imgName && images[imgName]) {
          ctx.drawImage(images[imgName], c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }

        // hiển thị location lên map 
        if (readOnly && showDevices && allLocations && allLocations.length > 0 && nodeConfig) {
          const hasOccupiedGoods = allLocations.some(loc => {
            const matchesNode = loc.node_id && nodeConfig.nodeId && loc.node_id.trim().toUpperCase() === nodeConfig.nodeId.trim().toUpperCase();
            const matchesQr = loc.qrcode && nodeConfig.qrCode && loc.qrcode.trim().toUpperCase() === nodeConfig.qrCode.trim().toUpperCase();
            const matchesZone = nodeConfig.areaType === 'storage';
            return (matchesNode || matchesQr) && matchesZone && loc.is_occupied;
          });
          if (hasOccupiedGoods && images['goods.svg']) {
            const iconSize = 20;
            const offset = (CELL_SIZE - iconSize) / 2;
            ctx.drawImage(images['goods.svg'], c * CELL_SIZE + offset, r * CELL_SIZE + offset, iconSize, iconSize);
          }
        }
      }
    }

    // thêm viền xanh cho khu vực lưu trữ
    if (activeTab === 'area' || readOnly) {
      ctx.strokeStyle = "#076EB8";
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      for (const area of storageAreas) {
        const areaCells = area.nodes;
        ctx.beginPath();
        for (const cell of area.nodes) {
          const [r, c] = cell.split(',').map(Number);
          if (r < visibleRange.rStart - 1 || r > visibleRange.rEnd + 1 || c < visibleRange.cStart - 1 || c > visibleRange.cEnd + 1) continue;
          const x = c * CELL_SIZE;
          const y = r * CELL_SIZE;
          if (!areaCells.has(`${r - 1},${c}`)) { ctx.moveTo(x, y); ctx.lineTo(x + CELL_SIZE, y); }
          if (!areaCells.has(`${r + 1},${c}`)) { ctx.moveTo(x, y + CELL_SIZE); ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE); }
          if (!areaCells.has(`${r},${c - 1}`)) { ctx.moveTo(x, y); ctx.lineTo(x, y + CELL_SIZE); }
          if (!areaCells.has(`${r},${c + 1}`)) { ctx.moveTo(x + CELL_SIZE, y); ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE); }
        }
        ctx.stroke();
      }
    }
  }, [visibleRange, selectedCells, activeTab, floorNodes, areaNodes, nodeMap, areaMap, cellToAreaMap, cellToPositionItemMap, positionItemByKeyMap, storageAreas, images, scale, editingId, initialEditingKeys, rows, columns, posDirections, posName, posQrCode, allLocations, allDevices, showDevices]);

  /**
   * Bắt đầu sự kiện kéo chuột (drag) để chọn nhiều ô
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly || !containerRef.current) return;
    e.preventDefault();
    setHoveredCell(null); // Hide label during interaction
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    selectionStateRef.current = {
      isSelecting: true,
      startX: x,
      startY: y,
      startClientX: e.clientX,
      startClientY: e.clientY
    };
    const startR = Math.floor(y / CELL_SIZE);
    const startC = Math.floor(x / CELL_SIZE);
    const cellKey = `${startR},${startC}`;

    // Auto-switch editingId based on clicked cell if not already selecting
    const areaId = cellToAreaMap.get(cellKey);
    const floorId = cellToFloorMap.get(cellKey);

    if (activeTab === 'area' && areaId && areaId !== editingId) {
      const area = areaMap.get(areaId);
      if (area) {
        setEditingId(areaId);
        setSelectedCells(new Set(area.nodes));
        setInitialEditingKeys(new Set(area.nodes));
        (selectionStateRef.current as any).initialSelected = new Set(area.nodes);
      }
    } else if (activeTab === 'floor' && floorId && floorId !== editingId) {
      const floor = floors.find(f => f.id === floorId);
      if (floor) {
        setEditingId(floorId);
        setSelectedCells(new Set(floor.nodes));
        setInitialEditingKeys(new Set(floor.nodes));
        (selectionStateRef.current as any).initialSelected = new Set(floor.nodes);
      }
    }

    const isStartCellSelected = selectedCells.has(cellKey);
    (selectionStateRef.current as any).selectionMode = isStartCellSelected ? 'unselect' : 'select';
    if (!(selectionStateRef.current as any).initialSelected) {
      (selectionStateRef.current as any).initialSelected = new Set(selectedCells);
    }

    if (activeTab === 'area') {
      const currentArea = editingId ? areas.find(a => a.id === editingId) : null;
      (selectionStateRef.current as any).startFloorId = (currentArea && currentArea.floorId) ? currentArea.floorId : cellToFloorMap.get(cellKey);
    }
    if (selectionBoxRef.current) {
      selectionBoxRef.current.style.display = 'none';
      selectionBoxRef.current.style.left = `${x}px`;
      selectionBoxRef.current.style.top = `${y}px`;
      selectionBoxRef.current.style.width = '0px';
      selectionBoxRef.current.style.height = '0px';
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * Xử lý khi chuột di chuyển trong lúc đang giữ chuột (vẽ hình chữ nhật chọn vùng - selection box)
   */
  const handleMouseMove = (e: MouseEvent) => {
    const state = selectionStateRef.current;
    if (!state.isSelecting || !containerRef.current || !selectionBoxRef.current) return;

    // Only display visual box if dragged at least 5px
    const diffX = Math.abs(e.clientX - (state.startClientX ?? e.clientX));
    const diffY = Math.abs(e.clientY - (state.startClientY ?? e.clientY));
    if (diffX < 5 && diffY < 5) {
      selectionBoxRef.current.style.display = 'none';
      return;
    }

    selectionBoxRef.current.style.display = 'block';
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;
    const left = Math.min(state.startX, currentX);
    const top = Math.min(state.startY, currentY);
    const width = Math.abs(state.startX - currentX);
    const height = Math.abs(state.startY - currentY);
    selectionBoxRef.current.style.left = `${left}px`;
    selectionBoxRef.current.style.top = `${top}px`;
    selectionBoxRef.current.style.width = `${width}px`;
    selectionBoxRef.current.style.height = `${height}px`;
  };

  /**
   * Xử lý khi nhả chuột (kết thúc quá trình chọn vùng)
   * Tính toán xem những ô nào nằm trong vùng chọn và cập nhật State
   */
  const handleMouseUp = (e: MouseEvent) => {
    const state = selectionStateRef.current as any;
    const latest = latestRef.current;
    if (!state.isSelecting || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / scale;
    const endY = (e.clientY - rect.top) / scale;

    // Phát hiện nhấp chuột đơn giản (chuột di chuyển dưới 5px) để ngăn chặn việc vô tình chọn nhiều mục khi di chuyển chuột ở mức dưới pixel.
    const diffX = Math.abs(e.clientX - (state.startClientX ?? e.clientX));
    const diffY = Math.abs(e.clientY - (state.startClientY ?? e.clientY));
    const isClick = diffX < 5 && diffY < 5;

    const startR = isClick ? Math.floor(state.startY / CELL_SIZE) : Math.floor(Math.min(state.startY, endY) / CELL_SIZE);
    const endR = isClick ? Math.floor(state.startY / CELL_SIZE) : Math.floor(Math.max(state.startY, endY) / CELL_SIZE);
    const startC = isClick ? Math.floor(state.startX / CELL_SIZE) : Math.floor(Math.min(state.startX, endX) / CELL_SIZE);
    const endC = isClick ? Math.floor(state.startX / CELL_SIZE) : Math.floor(Math.max(state.startX, endX) / CELL_SIZE);

    const newSelected = new Set<string>(state.initialSelected);
    const finalStartR = Math.max(0, startR);
    const finalEndR = Math.min(latest.rows - 1, endR);
    const finalStartC = Math.max(0, startC);
    const finalEndC = Math.min(latest.columns - 1, endC);
    const takenCells = latest.getTakenCells(latest.activeTab, latest.editingId || undefined);
    let lockedAreaId: string | undefined | null = null;
    let lockedDirections: string | null = null;
    // khóa hướng đi nêu không giống đường đi 
    if (latest.activeTab === 'position' && state.initialSelected.size > 0) {
      const floorPrefix = `wFloor_${latest.currentWarehouseFloorId}:`;
      const firstKey = Array.from(state.initialSelected)[0] as string;
      lockedAreaId = latest.cellToAreaMap.get(firstKey);
      const firstNode = latest.nodeMap.get(firstKey);
      if (firstNode) lockedDirections = JSON.stringify(firstNode.directions);
    }
    for (let i = finalStartR; i <= finalEndR; i++) {
      for (let j = finalStartC; j <= finalEndC; j++) {
        const key = `${i},${j}`;
        if (latest.activeTab === 'area') {
          if (!state.startFloorId || latest.cellToFloorMap.get(key) !== state.startFloorId) continue;
        }
        if (latest.activeTab === 'position') {
          if (!latest.floorNodes.has(key)) continue;
          const cellAreaId = latest.cellToAreaMap.get(key);
          const cellNode = latest.nodeMap.get(key);
          const cellDirs = cellNode ? JSON.stringify(cellNode.directions) : null;

          if (state.selectionMode === 'select') { // ... Kiểm tra ràng buộc hướng đi, khu vực, trùng lặp ô ...
            if (lockedAreaId === null) lockedAreaId = cellAreaId;
            else if (cellAreaId !== lockedAreaId) continue;

            if (lockedDirections === null) lockedDirections = cellDirs;
            else if (cellDirs !== lockedDirections) continue;
          }
        }
        if (state.selectionMode === 'select' && latest.activeTab !== 'position' && takenCells.has(key)) continue;
        if (state.selectionMode === 'select') newSelected.add(key); // Thêm vào danh sách chọn
        else newSelected.delete(key);// Bỏ khỏi danh sách chọn
      }
    }
    latest.setSelectedCells(newSelected);
    if (latest.activeTab === 'area' && latest.editingId && state.startFloorId) {
      const area = latest.areas.find(a => a.id === latest.editingId);
      if (area && area.floorId !== state.startFloorId) latest.updateArea(latest.editingId, { floorId: state.startFloorId });
    }
    state.isSelecting = false;
    if (selectionBoxRef.current) selectionBoxRef.current.style.display = 'none';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  /**
   * Xử lý di chuột tự do trên bản đồ (hiển thị tooltip toạ độ hoặc tên khu vực - Hover effect)
   */
  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || selectionStateRef.current.isSelecting) {
      if (hoveredCell) setHoveredCell(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const r = Math.floor(y / CELL_SIZE);
    const c = Math.floor(x / CELL_SIZE);

    if (r >= 0 && r < rows && c >= 0 && c < columns) {
      const key = `${r},${c}`;
      if (hoveredCell !== key) setHoveredCell(key);
    } else {
      if (hoveredCell) setHoveredCell(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 select-none overflow-hidden relative h-full">
      {/* đặt ref chỗ này vì có overflow tạo thanh cuộn  */}
      <div ref={scrollContainerRef} className="overflow-auto custom-scrollbar flex-1 relative">
        <div
          className="relative ml-6 mt-6 pr-10 pb-10 origin-top-left"
          //  Hệ thống dùng vòng lặp sinh ra các nhãn cột dựa theo số cột giới hạn bởi columns 
          //Vẽ Tên Cột (Chữ cái A, B, C...) ở trên đỉnh
          // style={{
          //   transform: `scale(${scale})`,
          //   width: columns * CELL_SIZE,
          //   height: rows * CELL_SIZE
          // }}
          style={{
            zoom: scale,
            width: columns * CELL_SIZE,
            height: rows * CELL_SIZE
          }}
        >
          <div className="absolute -top-5 left-0 h-5">
            {Array.from({ length: visibleRange.cEnd - visibleRange.cStart + 1 }).map((_, i) => {
              const c = visibleRange.cStart + i;
              return (
                <div key={`col-${c}`} className="text-[14px] text-[#545454] font-normal text-center absolute bottom-0" style={{ width: CELL_SIZE, left: c * CELL_SIZE }}>
                  {getColName(c)}
                </div>
              );
            })}
          </div>
          {/* Vẽ Tên Hàng (Số 1, 2, 3...) ở bên trái */}
          <div className="absolute -left-6 top-0" style={{ width: 24 }}>
            {Array.from({ length: visibleRange.rEnd - visibleRange.rStart + 1 }).map((_, i) => {
              const r = visibleRange.rStart + i; // in ra số hàng bắt đầu từ 1
              return (
                <div key={`row-${r}`} className="text-[14px] text-[#545454] font-normal text-right absolute flex items-center justify-end pr-[5px] pt-[5px] pb-[5px]" style={{ height: CELL_SIZE, top: r * CELL_SIZE, width: 24 }}>
                  {r + 1}
                </div>
              );
            })}
          </div>
          {/* chiều rộng chiều cao * vào */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleContainerMouseMove}
            onMouseLeave={() => setHoveredCell(null)}
            className="relative bg-[white]"
            style={{ width: columns * CELL_SIZE, height: rows * CELL_SIZE }}
          >
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0"
            />

            {/* {activeTab === 'position' && !selectionStateRef.current.isSelecting && Array.from(selectedCells).length === 1 && (
              <div
                className="absolute pointer-events-none bg-white border border-[#D6E4F0] px-2 py-1 rounded shadow-md z-40 text-[10px] font-bold text-[#076EB8]"
                style={{
                  left: (Array.from(selectedCells)[0].split(',').map(Number)[1] * CELL_SIZE) + CELL_SIZE / 2,
                  top: (Array.from(selectedCells)[0].split(',').map(Number)[0] * CELL_SIZE) + CELL_SIZE + 4,
                  transform: 'translateX(-50%)'
                }}
              >
                {`wFloor_${currentWarehouseFloorId}:${Array.from(selectedCells)[0]}`}
              </div>
            )} */}

            {/* Hiển thị tên khu vực và sản phẩm đối với giám sát hoạt động thì ko hiển thị && !showDevices */}
            {(activeTab === 'area' || (readOnly && !showDevices)) && !hoveredCell && !selectionStateRef.current.isSelecting && storageAreas.map(area => {
              const product = allProducts?.find(p => p.id?.toString() === area.product_id?.toString());
              const category = product ? categories?.find(c => c.id?.toString() === product.category_id?.toString()) : null;

              const productLabel = product ? product.code : area.name;
              const categoryLabel = category ? category.name : null;

              return (
                (productLabel || categoryLabel) && <div
                  key={`label-${area.id}`}
                  className="absolute pointer-events-none bg-white border border-[#D6E4F0] px-2 py-1 rounded shadow-md z-20 flex flex-col items-center justify-center min-w-[100px]"
                  style={{
                    left: (area.center.c + 0.5) * CELL_SIZE,
                    top: (area.center.r + 0.5) * CELL_SIZE,
                    transform: `translate(-50%, -50%) ${area.isVertical ? 'rotate(-90deg)' : ''}`,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span className="text-[#076eb8] text-[12px] font-bold leading-tight">{productLabel}</span>
                </div>
              );
            })}

            {/* Hover hiển thị tên khu vực chứa hàng và chi tiết vị trí */}
            {/* {hoveredArea && hoveredArea.areaType === 'storage' && hoveredArea.code && hoveredArea.code.trim() !== '' && !selectionStateRef.current.isSelecting && (() => { */}
            {readOnly && showDevices && hoveredArea && hoveredArea.areaType === 'storage' && hoveredArea.code && hoveredArea.code.trim() !== '' && !selectionStateRef.current.isSelecting && !hoveredDeviceId && (() => {

              const nodeConfig = hoveredCell ? nodeMap.get(hoveredCell) : null;
              const location = allLocations?.find(loc => {
                const matchesNode = loc.node_id && nodeConfig?.nodeId && loc.node_id.trim().toUpperCase() === nodeConfig.nodeId.trim().toUpperCase();
                const matchesQr = loc.qrcode && nodeConfig?.qrCode && loc.qrcode.trim().toUpperCase() === nodeConfig.qrCode.trim().toUpperCase();
                return matchesNode || matchesQr;
              });

              const code = location?.code || nodeConfig?.name || 'N/A';
              const qrCode = location?.qrcode || nodeConfig?.qrCode || 'N/A';
              const isOccupied = location ? location.is_occupied : false;

              return (
                <div
                  className="absolute pointer-events-none bg-white text-[#484848] p-3 rounded-lg shadow-xl text-[11px] font-medium z-50 border border-[#D6E4F0] flex flex-col gap-1.5 min-w-[170px]"
                  style={{
                    left: (hoveredCell!.split(',').map(Number)[1] * CELL_SIZE) + CELL_SIZE / 2,
                    top: (hoveredCell!.split(',').map(Number)[0] * CELL_SIZE) - 6,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 100
                  }}
                >
                  <div className="font-bold text-[#076eb8] border-b border-[#E8F2FA] pb-1 mb-1 ">{hoveredArea.code}</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#888888] ">Vị trí:</span>
                    <span className="text-[#545454] font-semibold">{code}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#888888] ">Mã QR:</span>
                    <span className="text-[#545454] font-semibold">{qrCode}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#888888]">Trạng thái:</span>
                    <span className={isOccupied ? 'text-green-500 font-semibold' : 'text-[#076eb8] font-semibold'}>
                      {isOccupied ? 'Đang chứa hàng' : 'Ô trống'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Hiển thị devices trên map */}
            {readOnly && showDevices && allDevices && allDevices.length > 0 && allDevices.map((device) => {
              // Trích xuất qrCode của thiết bị
              let deviceQr = '';
              if (device.metadata) {
                try {
                  let meta = typeof device.metadata === 'string' ? JSON.parse(device.metadata) : device.metadata;
                  if (typeof meta === 'string') {
                    meta = JSON.parse(meta);
                  }
                  deviceQr = meta?.qrCode || meta?.qrcode || '';
                } catch (e) {
                  if (typeof device.metadata === 'string') {
                    const match = device.metadata.match(/"qr[cC]ode"\s*:\s*"([^"]+)"/);
                    if (match) deviceQr = match[1];
                  }
                }
              }

              if (!deviceQr) return null;

              // Tìm ô lưới tương ứng với qrCode của thiết bị trên tầng hiện tại
              const node = Object.values(nodes).find((n) => {
                const prefix = `wFloor_${currentWarehouseFloorId}:`;
                return n.key.startsWith(prefix) && n.qrCode && n.qrCode.trim().toUpperCase() === deviceQr.trim().toUpperCase();
              });

              if (!node) return null;

              const coordPart = node.key.split(':')[1];
              const [row, col] = coordPart.split(',').map(Number);

              // Tìm loại thiết bị bằng device_type_id
              const matchedDeviceType = allDeviceTypes?.find(
                (dt) => dt.id === device.device_type_id
              );
              const typeCode = device.device_type_code || matchedDeviceType?.code || 'SHUTTLE';

              // Kiểm tra packageStatus\":0 ở devices để set icon cho shuttle 
              let packageStatusVal: number | undefined = undefined;
              if (device.metadata) {
                try {
                  let meta = typeof device.metadata === 'string' ? JSON.parse(device.metadata) : device.metadata;
                  if (typeof meta === 'string') {
                    meta = JSON.parse(meta);
                  }
                  if (meta.packageStatus !== undefined) {
                    packageStatusVal = Number(meta.packageStatus);
                  }
                } catch (e) {
                  if (typeof device.metadata === 'string') {
                    const match = device.metadata.match(/"packageStatus"\s*:\s*(\d+)/);
                    if (match) packageStatusVal = parseInt(match[1], 10);
                  }
                }
              }

              // Get tương ứng shuttle icon (st1, st2, st3) hoặc lifter
              const typeIndex = allDeviceTypes ? allDeviceTypes.findIndex((dt) => dt.id === device.device_type_id) : 0;
              let iconName = 'st5-shuttle.svg';
              const codeUpper = typeCode.toUpperCase();
              const isLifter = codeUpper === 'LIFTER' || codeUpper.includes('LIFTER');

              if (isLifter) {
                iconName = 'lifter.svg';
              } else if (packageStatusVal === 0) {
                iconName = 'st5-shuttle.svg';
              } else if (packageStatusVal === 1) {
                iconName = 'st4-shuttle.svg';
              } else {
                if (codeUpper === 'SHUTTLE' || codeUpper.includes('ST5')) {
                  iconName = 'st5-shuttle.svg';
                } else if (codeUpper.includes('2D') || codeUpper.includes('ST5')) {
                  iconName = 'st5-shuttle.svg';
                } else if (codeUpper.includes('4D') || codeUpper.includes('ST4')) {
                  iconName = 'st4-shuttle.svg';
                } else {
                  if (typeIndex === 0) iconName = 'st4-shuttle.svg';
                  else if (typeIndex === 1) iconName = 'st1-shuttle.svg';
                  else iconName = 'st5-shuttle.svg';
                }
              }

              // Parse status để style badge màu trạng thái
              // hover đối với shutte
              const devStatus = device.status?.toUpperCase() || 'OFFLINE';

              // Quy định Z-Index: Đặt Shuttle (36) đè lên Lifter (20) nếu chúng ở cùng 1 ô lưới
              const finalZIndex = isLifter ? 20 : 36;

              // Trích xuất thông tin tooltip từ metadata
              let deviceQrDisplay = '';
              let batteryPercentage: number | null = null;
              let packageStatus: number | null = null;
              let currentTask: string | null = null;
              if (device.metadata) {
                try {
                  let meta = typeof device.metadata === 'string' ? JSON.parse(device.metadata) : device.metadata;
                  if (typeof meta === 'string') meta = JSON.parse(meta);
                  deviceQrDisplay = meta?.qrCode || meta?.qrcode || '';
                  if (meta?.batteryPercentage !== undefined) batteryPercentage = Number(meta.batteryPercentage);
                  if (meta?.packageStatus !== undefined) packageStatus = Number(meta.packageStatus);
                  if (meta?.currentTask !== undefined) currentTask = String(meta.currentTask);
                } catch (e) { }
              }

              const isHovered = hoveredDeviceId === device.id;

              // Badge màu theo trạng thái
              const statusLabel: Record<string, { label: string; bg: string; text: string; dot: string }> = {
                OFFLINE: { label: 'Mất kết nối', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
                ONLINE: { label: 'Đã kết nối', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
                IDLE: { label: 'Đang chờ lệnh', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
                ERROR: { label: 'Lỗi', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
                FAULT: { label: 'Lỗi', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
                RUNNING: { label: 'Đang hoạt động', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
                CHARGING: { label: 'Sạc pin', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
              };
              const statusInfo = statusLabel[devStatus] ?? { label: devStatus, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

              return (
                <div
                  key={`device-overlay-${device.id}`}
                  className="absolute transition-all duration-300 ease-in-out"
                  style={{
                    left: col * CELL_SIZE,
                    top: row * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: (hoveredDeviceId === device.id || pinnedDeviceId === device.id) ? 200 : finalZIndex,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Icon Shuttle/Lifter */}
                  <img
                    src={`/svgMap/${iconName}`}
                    className="w-[30px] h-[20px] object-contain relative z-30"
                    alt={device.code}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredDeviceId(device.id)}
                    onMouseLeave={() => { if (pinnedDeviceId !== device.id) setHoveredDeviceId(null); }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPinnedDeviceId(prev => prev === device.id ? null : device.id);
                    }}
                  />

                  {/* Tooltip khi hover hoặc khi đã pin (click) */}
                  {(isHovered || pinnedDeviceId === device.id) && (() => {
                    // Nếu device gần cuối bản đồ → hiển thị phía trên (bottom), ngược lại phía dưới (top)
                    const showAbove = row >= rows - 5;
                    return (
                      <div
                        className="absolute pointer-events-none bg-white border border-[#D6E4F0] rounded-lg shadow-xl text-[11px] font-medium z-50 min-w-[300px] p-3 flex flex-col gap-1.5"
                        style={{
                          left: CELL_SIZE / 2,
                          ...(showAbove
                            ? { bottom: CELL_SIZE + 2 }
                            : { top: CELL_SIZE + 2 }),
                          transform: 'translateX(-50%)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        }}
                      >
                        {/* Mũi tên — trỏ lên khi tooltip ở dưới, trỏ xuống khi tooltip ở trên */}
                        <div style={{
                          position: 'absolute',
                          ...(showAbove ? { bottom: -6 } : { top: -6 }),
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          ...(showAbove
                            ? { borderTop: '6px solid #D6E4F0' }
                            : { borderBottom: '6px solid #D6E4F0' }),
                        }} />
                        <div style={{
                          position: 'absolute',
                          ...(showAbove ? { bottom: -5 } : { top: -5 }),
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          ...(showAbove
                            ? { borderTop: '5px solid white' }
                            : { borderBottom: '5px solid white' }),
                        }} />

                        {/* Header: dot + Code (trái) | % Pin (phải, chỉ Shuttle) */}
                        <div className="font-bold text-[#076eb8] border-b border-[#E8F2FA] pb-1.5 mb-0.5 flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusInfo.dot}`} />
                            <span className="truncate">{device.code}</span>
                          </div>
                          {!isLifter && batteryPercentage !== null && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <img
                                src="/icon.svg/pin.svg"
                                className="w-[14px] h-[14px] object-contain flex-shrink-0"
                                alt="pin"
                              />
                              <span className={`text-[10px] font-semibold ${batteryPercentage > 50 ? 'text-green-600' : batteryPercentage > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {batteryPercentage}%
                              </span>
                            </div>

                          )}
                        </div>

                        {/* QR Code */}
                        {deviceQrDisplay && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#888] flex-shrink-0">Vị Trí:</span>
                            <span className="text-[#333] font-semibold">{node ? `${node.name} (${deviceQrDisplay})` : deviceQrDisplay}</span>
                          </div>
                        )}

                        {/* Trạng thái */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#888] flex-shrink-0">Trạng thái:</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Hàng hóa - chỉ hiển thị với Shuttle */}
                        {!isLifter && packageStatus !== null && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#888] flex-shrink-0">Hàng hóa:</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${packageStatus === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${packageStatus === 1 ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                              {packageStatus === 1 ? 'Có mang hàng' : 'Không mang hàng'}
                            </span>
                          </div>
                        )}

                        {/* Nhiệm vụ hiện tại - chỉ Shuttle */}
                        {!isLifter && currentTask && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#888] flex-shrink-0">Nhiệm vụ:</span>
                            <span className="text-[#333] font-semibold text-right">{currentTask}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              );
            })}


            {/* Hiển thị goods lên ô lifter (đè lên lifter) */}
            {readOnly && showDevices && allLocations && allLocations.length > 0 && allLocations
              .filter(loc => loc.is_occupied)
              .map((loc) => {
                const node = Object.values(nodes).find((n) => {
                  const prefix = `wFloor_${currentWarehouseFloorId}:`;
                  const matchesNode = loc.node_id && n.nodeId && loc.node_id.trim().toUpperCase() === n.nodeId.trim().toUpperCase();
                  const matchesQr = loc.qrcode && n.qrCode && loc.qrcode.trim().toUpperCase() === n.qrCode.trim().toUpperCase();
                  const matchesZone = n.areaType === 'lifter';
                  return n.key.startsWith(prefix) && (matchesNode || matchesQr) && matchesZone;
                });

                if (!node) return null;

                const coordPart = node.key.split(':')[1];
                const [row, col] = coordPart.split(',').map(Number);

                // zIndex:InBound (33) Lifter (30) < Goods (35) < Shuttle (45)
                const goodsZIndex = 35;

                return (
                  <div
                    key={`goods-lifter-overlay-${loc.id || loc.qrcode}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: col * CELL_SIZE,
                      top: row * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: goodsZIndex,
                    }}
                  >
                    <img
                      src="/svgMap/goods.svg"
                      className="w-[20px] h-[20px] object-contain"
                      alt="goods on lifter"
                    />
                  </div>
                );
              })}

            {/* Selection Box Overlay (Still DOM for performance) */}
            <div
              ref={selectionBoxRef}
              className="absolute border-2 border-[#076EB8] bg-[rgba(7,110,184,0.15)] pointer-events-none z-10 rounded-[2px]"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Zoom Controls - bottom right */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm z-20 overflow-hidden">
        <button
          onClick={() => setScale(Math.min(2, scale + 0.1))}
          className="w-7 h-7 md:w-8 md:h-8 flex items-center !text-[#076eb8] justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm md:text-lg font-bold"
        >
          +
        </button>
        <div className="border-t border-gray-200" />
        <button
          onClick={() => setScale(Math.max(0.3, scale - 0.1))}
          className="w-7 h-7 md:w-8 md:h-8 !text-[#076eb8] flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm md:text-lg font-bold"
        >
          −
        </button>
      </div>
    </div>
  );
};

export default WarehouseMap;
