'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWarehouseConfig } from './WarehouseContext';
import { hasAnyDirection, getSelectedTileName, AreaConfig, PositionConfig } from './warehouse-types';
import { useOverlayScrollbars } from 'overlayscrollbars-react';

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
    nodes, areas, getTakenCells, positionItems, initialEditingKeys,
    images, rows, columns, updateArea, editingId, setEditingId, setInitialEditingKeys,
    posDirections, posName, posQrCode, allProducts, categories,
    routeType, curveAngle, setCurveAngle, routeControlPoint, setRouteControlPoint, curveDirection, setCurveDirection, routeDirection, routes,
    setRouteType, setRouteDirection,
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
    isDraggingCurve?: boolean;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    L?: number;
    dx?: number;
    dy?: number;
  }>({ isSelecting: false, startX: 0, startY: 0 });

  const handlersRef = React.useRef<{ move?: any; up?: any }>({});

  const [init] = useOverlayScrollbars({
    defer: true,
    options: { scrollbars: { autoHide: 'leave', theme: 'os-theme-dark os-theme-hover' } }
  });

  useEffect(() => {
    if (scrollContainerRef.current) {
      init({
        target: scrollContainerRef.current,
        elements: { viewport: scrollContainerRef.current }
      });
    }
  }, [init, scrollContainerRef]);

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
    areaNodes, areaMap, cellToAreaMap, nodeMap,
    cellToPositionItemMap, positionItemByKeyMap,
    storageAreas
  } = useMemo(() => {
    const aMap = new Map<string, AreaConfig>();
    const aNodes = new Set<string>();
    const cToAMap = new Map<string, string>();
    const nMap = new Map<string, PositionConfig>();
    const pIByKeyMap = new Map<string, PositionConfig>();
    const cToPIMap = new Map<string, PositionConfig>();

    areas.forEach(a => {
      aMap.set(a.id, a);
      a.nodes.forEach(p => {
        aNodes.add(p);
        cToAMap.set(p, a.id);
      });
    });

    const prefix = `node_`;
    for (const fullKey in nodes) {
      if (fullKey.startsWith(prefix)) {
        nMap.set(fullKey.split('_')[1], nodes[fullKey]);
      }
    }

    positionItems.forEach(p => {
      pIByKeyMap.set(p.key, p);
      p.cellKeys?.forEach(k => cToPIMap.set(k, p));
    });

    const sAreas: { id: string; name: string; product_id?: string; center: { r: number, c: number }; nodes: Set<string>; isVertical: boolean }[] = [];
    areas.filter(a => a.areaType === 'storage').forEach(a => {
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
      areaNodes: aNodes, areaMap: aMap,
      cellToAreaMap: cToAMap, nodeMap: nMap,
      cellToPositionItemMap: cToPIMap,
      positionItemByKeyMap: pIByKeyMap,
      storageAreas: sAreas
    };
  }, [areas, nodes, positionItems, editingId, selectedCells]);

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
    activeTab, editingId, areas, cellToAreaMap, areaNodes, selectedCells, getTakenCells, rows, columns, updateArea, setSelectedCells, setEditingId, setInitialEditingKeys, nodeMap, routeType, setCurveAngle,
    setRouteType, setCurveDirection, setRouteControlPoint, setRouteDirection, routes, curveDirection, routeControlPoint, routeDirection, curveAngle
  });
  useEffect(() => {
    latestRef.current = {
      activeTab, editingId, areas, cellToAreaMap, areaNodes, selectedCells, getTakenCells, rows, columns, updateArea, setSelectedCells, setEditingId, setInitialEditingKeys, nodeMap, routeType, setCurveAngle,
      setRouteType, setCurveDirection, setRouteControlPoint, setRouteDirection, routes, curveDirection, routeControlPoint, routeDirection, curveAngle
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
    if (!readOnly) {
      ctx.fillStyle = "#677594";
      for (let r = visibleRange.rStart; r <= visibleRange.rEnd; r++) {
        for (let c = visibleRange.cStart; c <= visibleRange.cEnd; c++) {
          ctx.beginPath();
          ctx.arc(c * CELL_SIZE + CELL_SIZE / 2, r * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const isEditing = !!editingId;
    const currentPosItem = isEditing && (activeTab === 'position' || activeTab === 'route') ? positionItemByKeyMap.get(editingId!) : null;
    const currentArea = isEditing && activeTab === 'area' ? areaMap.get(editingId!) : null;

    const drawSingleRoute = (
      r1_in: number, c1_in: number, r2_in: number, c2_in: number,
      rType: string | null, cDir: string | null, rDir: string, cAngle?: string | number | null,
      cPoint?: { x: number, y: number } | null, isActiveRoute?: boolean
    ) => {
      let r1 = r1_in, c1 = c1_in;
      let r2 = r2_in, c2 = c2_in;

      const x1 = c1 * CELL_SIZE + CELL_SIZE / 2;
      const y1 = r1 * CELL_SIZE + CELL_SIZE / 2;
      const x2 = c2 * CELL_SIZE + CELL_SIZE / 2;
      const y2 = r2 * CELL_SIZE + CELL_SIZE / 2;

      let cx_curve = 0, cy_curve = 0;

      ctx.beginPath();
      ctx.moveTo(x1, y1);

      if (rType === 'Đường thẳng') {
        ctx.lineTo(x2, y2);
        cx_curve = (x1 + x2) / 2;
        cy_curve = (y1 + y2) / 2;
      } else {
        const angleDegree = (cAngle !== null && cAngle !== undefined && cAngle !== '') ? Number(cAngle) : 45;
        const scale = angleDegree / 90; // Độ cong tỷ lệ với góc
        const dx = x2 - x1;
        const dy = y2 - y1;
        const L = Math.hypot(dx, dy);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        let Nx = 0, Ny = 0;
        const dirStr = cDir?.toLowerCase() || '';
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

        if (L > 0) {
          Nx /= L;
          Ny /= L;
        }

        let cx_bezier = 0;
        let cy_bezier = 0;
        if (cPoint) {
          cx_curve = cPoint.x;
          cy_curve = cPoint.y;
          cx_bezier = 2 * cx_curve - midX;
          cy_bezier = 2 * cy_curve - midY;
        } else {
          cx_bezier = midX + Nx * L * scale;
          cy_bezier = midY + Ny * L * scale;
          cx_curve = 0.25 * x1 + 0.5 * cx_bezier + 0.25 * x2;
          cy_curve = 0.25 * y1 + 0.5 * cy_bezier + 0.25 * y2;
        }

        ctx.quadraticCurveTo(cx_bezier, cy_bezier, x2, y2);

      }

      ctx.strokeStyle = "rgba(161, 161, 170, 0.8)"; // Màu xám như thiết kế
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Vẽ điểm điều khiển nếu đang chỉnh sửa (Active Route) - Phải vẽ sau khi stroke đường chính
      if (isActiveRoute && !readOnly) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx_curve, cy_curve, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b'; // cam
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Vẽ mũi tên hướng đi nếu có chọn hướng
      if (rDir) {
        // Tính toán góc và vị trí giữa đoạn vẽ
        let midX, midY, angle;
        if (rType === 'Đường thẳng') {
          midX = (x1 + x2) / 2;
          midY = (y1 + y2) / 2;
          angle = Math.atan2(y2 - y1, x2 - x1);
        } else {
          const angleDegree = (cAngle !== null && cAngle !== undefined && cAngle !== '') ? Number(cAngle) : 45;
          const scale = angleDegree / 90; // Độ cong tỷ lệ với góc
          const dx = x2 - x1;
          const dy = y2 - y1;
          const L = Math.hypot(dx, dy);

          const midXSegment = (x1 + x2) / 2;
          const midYSegment = (y1 + y2) / 2;

          let Nx = 0, Ny = 0;
          const dirStr = cDir?.toLowerCase() || '';
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

          if (L > 0) {
            Nx /= L;
            Ny /= L;
          }

          let cx_bezier = 0;
          let cy_bezier = 0;

          if (cPoint) {
            cx_bezier = 2 * cPoint.x - midXSegment;
            cy_bezier = 2 * cPoint.y - midYSegment;
          } else {
            cx_bezier = midXSegment + Nx * L * scale;
            cy_bezier = midYSegment + Ny * L * scale;
          }

          midX = 0.25 * x1 + 0.5 * cx_bezier + 0.25 * x2;
          midY = 0.25 * y1 + 0.5 * cy_bezier + 0.25 * y2;
          // Tangent at t=0.5 is proportional to (x2 - x1), wait actually the tangent vector for quadratic bezier at t=0.5 is simply P2 - P0!
          // Therefore, angle = Math.atan2(y2 - y1, x2 - x1) is mathematically exact for t=0.5 regardless of the control point!
          angle = Math.atan2(y2 - y1, x2 - x1);
        }

        const drawArrow = (x: number, y: number, ang: number) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.moveTo(-2, -2);
          ctx.lineTo(2, 0);
          ctx.lineTo(-2, 2);
          ctx.strokeStyle = "#076EB8";
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          ctx.restore();
        };

        if (rDir === 'right') {
          drawArrow(midX, midY, angle);
        } else if (rDir === 'left') {
          drawArrow(midX, midY, angle + Math.PI);
        } else if (rDir === 'left_right') {
          // khoản cách hai chiều 
          drawArrow(midX - Math.cos(angle) * 3, midY - Math.sin(angle) * 3, angle + Math.PI);
          drawArrow(midX + Math.cos(angle) * 3, midY + Math.sin(angle) * 3, angle);
        }
      }
    };

    // Vẽ các tuyến đường đã lưu
    if (activeTab === 'route') {
      const selectedCellsStr = Array.from(selectedCells).sort().join('|');
      
      routes.forEach(rt => {
        if (rt.cells.length === 2) {
          // Bỏ qua tuyến đường đang được chọn để chỉnh sửa (tránh vẽ đè đường cũ và mới)
          const rtCellsStr = [...rt.cells].sort().join('|');
          if (rtCellsStr === selectedCellsStr) return;

          const [r1, c1] = rt.cells[0].split(',').map(Number);
          const [r2, c2] = rt.cells[1].split(',').map(Number);
          drawSingleRoute(r1, c1, r2, c2, rt.routeType, rt.curveDirection, rt.routeDirection, rt.curveAngle, rt.controlPoint, false);
        }
      });
    }

    // Vẽ tuyến đường đang tạo (chưa lưu)
    if (activeTab === 'route' && selectedCells.size === 2 && routeType) {
      const arr = Array.from(selectedCells);
      const [r1, c1] = arr[0].split(',').map(Number);
      const [r2, c2] = arr[1].split(',').map(Number);
      drawSingleRoute(r1, c1, r2, c2, routeType, curveDirection, routeDirection, curveAngle, routeControlPoint, true);
    }

    for (let r = visibleRange.rStart; r <= visibleRange.rEnd; r++) {
      for (let c = visibleRange.cStart; c <= visibleRange.cEnd; c++) {
        const key = `${r},${c}`;
        const isSelected = selectedCells.has(key);
        const hasAreaPos = areaNodes.has(key);
        const nodeConfig = nodeMap.get(key);
        let imgName = '';
        let bgColor = ''
        // hiển thị màu nếu được quét


        if (activeTab === 'area') {
          const isPartOfCurrentEditingArea = isEditing && initialEditingKeys.has(key);
          // gọi hàm bên warehouse-types để lấy tên ảnh 
          if (isSelected && isEditing) {
            imgName = getSelectedTileName({ up: false, down: false, left: false, right: false }, currentArea?.areaType);
          } else if (isPartOfCurrentEditingArea && !isSelected) {
            // This was part of the area but is now deselected - show as floor (gray)
            if (isSelected) imgName = 'node.svg';
          } else if (hasAreaPos) {
            const areaId = cellToAreaMap.get(key);
            const area = areaId ? areaMap.get(areaId) : null;
            imgName = getSelectedTileName({ up: false, down: false, left: false, right: false }, area?.areaType);
          } else if (isSelected) {
            imgName = 'node.svg';
          }
        } else if (activeTab === 'position' || activeTab === 'route') {
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
          
          }
        }
        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        // vẻ ảnh lên tọa độ c(cột) và r (hàng)
        if (imgName && images[imgName]) {
          if (imgName === 'node.svg') {
            const size = 8;
            const offset = (CELL_SIZE - size) / 2;
            ctx.drawImage(images[imgName], c * CELL_SIZE + offset, r * CELL_SIZE + offset, size, size);
          } else if (['inbound.svg', 'outbound.svg', 'waiting.svg', 'charging.svg', 'maintenance.svg', 'bypass.svg'].includes(imgName)) {
            const size = Math.max(12, CELL_SIZE * 0.7); // 70% of cell size
            const offset = (CELL_SIZE - size) / 2;
            ctx.drawImage(images[imgName], c * CELL_SIZE + offset, r * CELL_SIZE + offset, size, size);
          } else {
            ctx.drawImage(images[imgName], c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
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
  }, [visibleRange, selectedCells, activeTab, areaNodes, nodeMap, areaMap, cellToAreaMap, cellToPositionItemMap, positionItemByKeyMap, storageAreas, images, scale, editingId, initialEditingKeys, rows, columns, posDirections, posName, posQrCode, allLocations, allDevices, showDevices, routeType, curveDirection, routeDirection, curveAngle, routes, routeControlPoint]);

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

    // Kiểm tra xem có đang click vào điểm điều khiển (control point) không
    if (activeTab === 'route' && selectedCells.size === 2 && routeType) {
      const arr = Array.from(selectedCells);
      const [r1, c1] = arr[0].split(',').map(Number);
      const [r2, c2] = arr[1].split(',').map(Number);
      const x1 = c1 * CELL_SIZE + CELL_SIZE / 2;
      const y1 = r1 * CELL_SIZE + CELL_SIZE / 2;
      const x2 = c2 * CELL_SIZE + CELL_SIZE / 2;
      const y2 = r2 * CELL_SIZE + CELL_SIZE / 2;

      let cx = 0, cy = 0;
      if (routeControlPoint) {
        cx = routeControlPoint.x;
        cy = routeControlPoint.y;
      } else if (routeType === 'Đường thẳng') {
        cx = (x1 + x2) / 2;
        cy = (y1 + y2) / 2;
      } else {
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
        cx = 0.25 * x1 + 0.5 * cx_bezier + 0.25 * x2;
        cy = 0.25 * y1 + 0.5 * cy_bezier + 0.25 * y2;
      }

      const dist = Math.hypot(x - cx, y - cy);
      if (dist <= 15) { // Bán kính tương tác
        selectionStateRef.current = {
          isSelecting: false,
          isDraggingCurve: true,
          startX: x,
          startY: y,
        };
        handlersRef.current.move = handleMouseMove;
        handlersRef.current.up = handleMouseUp;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return;
      }
    }

    // Kiểm tra xem có đang click vào một tuyến đường đã lưu hay không
    if (activeTab === 'route') {
      let clickedRoute = null;
      for (const rt of routes) {
        if (rt.cells.length === 2) {
          const [r1, c1] = rt.cells[0].split(',').map(Number);
          const [r2, c2] = rt.cells[1].split(',').map(Number);
          const x1 = c1 * CELL_SIZE + CELL_SIZE / 2;
          const y1 = r1 * CELL_SIZE + CELL_SIZE / 2;
          const x2 = c2 * CELL_SIZE + CELL_SIZE / 2;
          const y2 = r2 * CELL_SIZE + CELL_SIZE / 2;

          const distToNode1 = Math.hypot(x - x1, y - y1);
          const distToNode2 = Math.hypot(x - x2, y - y2);
          if (distToNode1 <= 15 || distToNode2 <= 15) {
            continue;
          }

          if (rt.routeType === 'Đường thẳng' || !rt.routeType) {
            const L2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
            let dist = 0;
            if (L2 === 0) {
              dist = Math.hypot(x - x1, y - y1);
            } else {
              let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / L2;
              t = Math.max(0, Math.min(1, t));
              const projX = x1 + t * (x2 - x1);
              const projY = y1 + t * (y2 - y1);
              dist = Math.hypot(x - projX, y - projY);
            }
            if (dist <= 20) {
              clickedRoute = rt;
              break;
            }
          } else {
            let cx = 0, cy = 0;
            if (rt.controlPoint) {
              cx = rt.controlPoint.x;
              cy = rt.controlPoint.y;
            } else {
              const dx = x2 - x1;
              const dy = y2 - y1;
              const L = Math.hypot(dx, dy);
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              let Nx = 0, Ny = 0;
              const dirStr = rt.curveDirection?.toLowerCase() || '';
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
              const angleDegree = (rt.curveAngle !== null && rt.curveAngle !== undefined && rt.curveAngle !== '') ? Number(rt.curveAngle) : 45;
              const scaleDist = angleDegree / 90;
              const cx_bezier = midX + Nx * L * scaleDist;
              const cy_bezier = midY + Ny * L * scaleDist;
              cx = 0.25 * x1 + 0.5 * cx_bezier + 0.25 * x2;
              cy = 0.25 * y1 + 0.5 * cy_bezier + 0.25 * y2;
            }

            let minDist = Infinity;
            for (let i = 0; i <= 20; i++) {
              const t = i / 20;
              const px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2;
              const py = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2;
              const d = Math.hypot(x - px, y - py);
              if (d < minDist) minDist = d;
            }
            if (minDist <= 20) {
              clickedRoute = rt;
              break;
            }
          }
        }
      }

      if (clickedRoute) {
        latestRef.current.setSelectedCells(new Set(clickedRoute.cells));
        latestRef.current.setRouteType(clickedRoute.routeType || null);
        latestRef.current.setCurveDirection(clickedRoute.curveDirection || null);
        latestRef.current.setCurveAngle(String(clickedRoute.curveAngle || "45"));
        latestRef.current.setRouteControlPoint(clickedRoute.controlPoint || null);
        latestRef.current.setRouteDirection((clickedRoute.routeDirection as '' | 'left' | 'right' | 'left_right') || '');
        return;
      }
    }

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

    if (activeTab === 'area' && areaId && areaId !== editingId) {
      const area = areaMap.get(areaId);
      if (area) {
        setEditingId(areaId);
        setSelectedCells(new Set(area.nodes));
        setInitialEditingKeys(new Set(area.nodes));
        (selectionStateRef.current as any).initialSelected = new Set(area.nodes);
      }
    }


    const isStartCellSelected = selectedCells.has(cellKey);
    (selectionStateRef.current as any).selectionMode = isStartCellSelected ? 'unselect' : 'select';
    if (!(selectionStateRef.current as any).initialSelected) {
      (selectionStateRef.current as any).initialSelected = new Set(selectedCells);
    }
    if (selectionBoxRef.current) {
      selectionBoxRef.current.style.display = 'none';
      selectionBoxRef.current.style.left = `${x}px`;
      selectionBoxRef.current.style.top = `${y}px`;
      selectionBoxRef.current.style.width = '0px';
      selectionBoxRef.current.style.height = '0px';
    }
    handlersRef.current.move = handleMouseMove;
    handlersRef.current.up = handleMouseUp;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * Xử lý khi chuột di chuyển trong lúc đang giữ chuột (vẽ hình chữ nhật chọn vùng - selection box)
   */
  const handleMouseMove = (e: MouseEvent) => {
    const state = selectionStateRef.current as any;
    if (!containerRef.current) return;

    if (state.isDraggingCurve) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / scale;
      const currentY = (e.clientY - rect.top) / scale;
      setRouteControlPoint({ x: currentX, y: currentY });

      // Cập nhật lại góc cong và hướng cong hiển thị ở Sidebar
      if (selectedCells.size === 2) {
        const arr = Array.from(selectedCells);
        const [r1, c1] = arr[0].split(',').map(Number);
        const [r2, c2] = arr[1].split(',').map(Number);
        const x1 = c1 * CELL_SIZE + CELL_SIZE / 2;
        const y1 = r1 * CELL_SIZE + CELL_SIZE / 2;
        const x2 = c2 * CELL_SIZE + CELL_SIZE / 2;
        const y2 = r2 * CELL_SIZE + CELL_SIZE / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const L = Math.hypot(dx, dy);

        if (L > 0) {
          const dist = Math.hypot(currentX - midX, currentY - midY);
          let newAngle = Math.round((dist * 180) / L);
          if (newAngle > 180) newAngle = 180;

          let newDir = '';
          if (c1 === c2) { // vertical
            newDir = currentX < midX ? 'trái' : 'phải';
          } else { // horizontal or diagonal
            newDir = currentY < midY ? 'trên' : 'dưới';
          }

          if (latestRef.current.setRouteType && routeType === 'Đường thẳng') {
            latestRef.current.setRouteType('Arc tròn');
          }
          setCurveAngle(newAngle.toString());
          setCurveDirection(newDir);
        }
      }
      return;
    }

    if (!state.isSelecting || !selectionBoxRef.current) return;

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
    if (!containerRef.current) return;

    if (state.isDraggingCurve) {
      state.isDraggingCurve = false;
      window.removeEventListener('mousemove', handlersRef.current.move);
      window.removeEventListener('mouseup', handlersRef.current.up);
      return;
    }

    if (!state.isSelecting) return;
    const rect = containerRef.current.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / scale;
    const endY = (e.clientY - rect.top) / scale;

    // Phát hiện nhấp chuột đơn giản (chuột di chuyển dưới 5px) để ngăn chặn việc vô tình chọn nhiều mục khi di chuyển chuột ở mức dưới pixel.
    const diffX = Math.abs(e.clientX - (state.startClientX ?? e.clientX));
    const diffY = Math.abs(e.clientY - (state.startClientY ?? e.clientY));
    const isClick = diffX < 5 && diffY < 5;

    const rawStartR = Math.floor(state.startY / CELL_SIZE);
    const rawEndR = isClick ? rawStartR : Math.floor(endY / CELL_SIZE);
    const rawStartC = Math.floor(state.startX / CELL_SIZE);
    const rawEndC = isClick ? rawStartC : Math.floor(endX / CELL_SIZE);

    let newSelected = new Set<string>(state.initialSelected);
    const rStart = Math.max(0, Math.min(latest.rows - 1, rawStartR));
    const rEnd = Math.max(0, Math.min(latest.rows - 1, rawEndR));
    const cStart = Math.max(0, Math.min(latest.columns - 1, rawStartC));
    const cEnd = Math.max(0, Math.min(latest.columns - 1, rawEndC));

    const takenCells = latest.getTakenCells(latest.activeTab, latest.editingId || undefined);
    if (state.initialSelected.size > 0) {
      // route might use state.initialSelected later, but we removed lockedAreaId
    }

    const rStep = rStart <= rEnd ? 1 : -1;
    const cStep = cStart <= cEnd ? 1 : -1;

    for (let i = rStart; rStep > 0 ? i <= rEnd : i >= rEnd; i += rStep) {
      for (let j = cStart; cStep > 0 ? j <= cEnd : j >= cEnd; j += cStep) {
        const key = `${i},${j}`;

        if (latest.activeTab === 'route') {
          const cellAreaId = latest.cellToAreaMap.get(key);
          const cellNode = latest.nodeMap.get(key);
          const cellDirs = cellNode ? JSON.stringify(cellNode.directions) : null;
        }
        if (state.selectionMode === 'select' && latest.activeTab === 'area' && takenCells.has(key)) continue;
        if (state.selectionMode === 'select') newSelected.add(key); // Thêm vào danh sách chọn
        else newSelected.delete(key);// Bỏ khỏi danh sách chọn
      }
    }
    if (latest.activeTab === 'route') {
      newSelected = new Set(Array.from(newSelected).filter(cell => latest.cellToAreaMap.has(cell)));
    }

    if (latest.activeTab === 'position') {
      // Giới hạn chỉ cho phép chọn 1 vị trí
      if (newSelected.size > 1) {
        newSelected = new Set(Array.from(newSelected).slice(-1));
      }
    }

    if (latest.activeTab === 'route') {
      // Giới hạn chỉ cho phép chọn tối đa 2 vị trí cho tuyến đường.
      if (newSelected.size > 2) {
        newSelected = new Set(Array.from(newSelected).slice(-2));
      }

      // Ràng buộc: Vị trí thứ 2 phải cùng hàng hoặc cùng cột với vị trí thứ 1,
      // và không được có vị trí nào khác nằm xen giữa.
      if (newSelected.size === 2) {
        const arr = Array.from(newSelected);
        const [r1, c1] = arr[0].split(',').map(Number);
        const [r2, c2] = arr[1].split(',').map(Number);

        // Cho phép chọn bất kỳ 2 điểm nào để vẽ tuyến đường (không ràng buộc cùng hàng/cột hay bị chắn)
      }
    }

    if (latest.activeTab === 'area' && !latest.editingId) {
      latest.setSelectedCells(new Set());
    } else {
      latest.setSelectedCells(newSelected);
    }

    state.isSelecting = false;
    if (selectionBoxRef.current) selectionBoxRef.current.style.display = 'none';
    window.removeEventListener('mousemove', handlersRef.current.move || handleMouseMove);
    window.removeEventListener('mouseup', handlersRef.current.up || handleMouseUp);
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
      <div ref={scrollContainerRef} className="overflow-auto flex-1 relative">
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
            {!readOnly && Array.from({ length: visibleRange.cEnd - visibleRange.cStart + 1 }).map((_, i) => {
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
            {!readOnly && Array.from({ length: visibleRange.rEnd - visibleRange.rStart + 1 }).map((_, i) => {
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
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm z-[300] overflow-hidden">
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
