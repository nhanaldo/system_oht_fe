"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ConfigProvider } from 'antd';
import DynamicIcon from '@/components/ui/DynamicIcon';

interface SideBarProps {
    collapse: boolean;
    pathname?: string;
    menuItems?: any[];
}

const IconRenderer = ({ iconName, style, className }: { iconName?: string, style?: React.CSSProperties, className?: string }) => {
    return <DynamicIcon iconName={iconName} style={style} className={className} />;
};

const SideBar = ({ collapse, pathname: propPathname, menuItems }: SideBarProps) => {
    const currentPathname = usePathname();
    const pathname = propPathname || currentPathname;

    // ===== selected key: chọn page.path match pathname =====
    const selectedKey = useMemo(() => {
        const items = menuItems || [];
        for (const m of items) {
            const hit = m.pages?.find((p: any) => pathname?.includes(p.path));
            if (hit) return hit.path;
        }
        return "";
    }, [menuItems, pathname]);

    // ===== open keys: mở menu cha chứa page đang active (chỉ khi không collapse) =====
    const defaultOpenKeys = useMemo(() => {
        if (collapse) return [];
        const items = menuItems || [];
        return items.map((m: any) => m.menuName);
    }, [menuItems, collapse]);

    const skeletonItems = useMemo(() => {
        return Array.from({ length: 10 }).map((_, index) => ({
            key: `skeleton-${index}`,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#f5f5f5' }} className="animate-pulse" />
                    <div style={{ height: '16px', width: '75%', backgroundColor: '#f5f5f5', borderRadius: '4px' }} className="animate-pulse" />
                </div>
            ),
            disabled: true,
            style: { cursor: 'default' }
        }));
    }, []);

    const items = useMemo(() => {
        if (!menuItems || menuItems.length === 0) {
            return skeletonItems;
        }

        // Nếu menuItems bị bọc trong { data: [...] } thì lấy data
        const itemsList = Array.isArray(menuItems) ? menuItems : ((menuItems as any).data || []);
        if (!Array.isArray(itemsList)) return skeletonItems;

        return itemsList
            .filter(() => true)
            .map((menu: any, index: number) => {
                const hasChildren = Array.isArray(menu.pages) && menu.pages.length > 0;
                const menuName = menu.menuName || menu.name || `Menu ${index}`;

                // ===== icon cha: yêu cầu của bạn =====
                let parentIcon: React.ReactNode = undefined;
                if (menu.menuIcon) {
                    parentIcon = collapse ? (
                        <span style={{ display: "inline-flex" }}>
                            <IconRenderer iconName={menu.menuIcon} />
                        </span>
                    ) : undefined;
                } else {
                    parentIcon = collapse ? null : undefined;
                }

                return {
                    key: menuName,
                    icon: parentIcon,

                    children: !hasChildren
                        ? undefined
                        : menu.pages.map((page: any, pIndex: number) => {
                            const isPageActive = page.path === "/" ? pathname === "/" : pathname?.includes(page.path);

                            return {
                                key: page.path || `page-${pIndex}`,
                                icon: (
                                    <IconRenderer
                                        iconName={page.pageIcon}
                                        style={{ display: "inline-flex", color: isPageActive ? "#0F6EB8" : "#545454" }}
                                    />
                                ),
                                className: isPageActive ? "sidebar-subitem-active" : undefined,
                                label: (
                                    <Link href={page.path || "#"}>
                                        <span style={{ marginLeft: "5px", fontSize: "16px", fontWeight: "normal", color: isPageActive ? "#0F6EB8" : "#545454" }}>
                                            {page.pageName || page.name || `Trang ${pIndex}`}
                                        </span>
                                    </Link>
                                ),
                                style: {
                                    color: isPageActive ? "#0F6EB8" : "black",
                                    backgroundColor: isPageActive ? "rgba(230, 247, 255, 0.77)" : "transparent",
                                    borderLeft: isPageActive ? "2px solid rgba(15, 110, 184, 1)" : "none",
                                },
                            };
                        }),

                    label: hasChildren ? (
                        <span
                            style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "#1378C0",
                            }}
                        >
                            {menuName}
                        </span>
                    ) : (
                        <Link href={menu.path || "#"} style={{ fontWeight: "500" }}>
                            {menuName}
                        </Link>
                    ),
                    style: { color: "#1378C0" },
                };
            });
    }, [menuItems, pathname, collapse, skeletonItems]);

    return (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        itemActiveBg: "rgba(230, 247, 255, 0.77)",
                    },
                },
            }}
        >
            <Menu
                className={`${collapse ? "collapsed" : ""}`}
                style={{
                    borderInlineEnd: "none",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "white",
                }}
                mode="inline"
                inlineCollapsed={collapse}
                selectedKeys={selectedKey ? [selectedKey] : []}
                defaultOpenKeys={defaultOpenKeys}
                items={items}
            />
        </ConfigProvider>
    );
};

export default SideBar;
