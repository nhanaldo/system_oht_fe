"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ConfigProvider } from 'antd';
import DynamicIcon from '@/components/ui/DynamicIcon';

interface MenuTreeItem {
    id: string;
    name: string;
    code?: string;
    icon?: string;
    parent_id?: string | null;
    path?: string;
    level?: number;
    order_number?: number;
    children?: MenuTreeItem[];
}

interface SideBarProps {
    collapse: boolean;
    pathname?: string;
    menuItems?: MenuTreeItem[];
    isAdmin?: boolean;
}

const IconRenderer = ({ iconName, style, className }: { iconName?: string; style?: React.CSSProperties; className?: string }) => {
    return <DynamicIcon iconName={iconName} style={style} className={className} />;
};

const SideBar = ({ collapse, pathname: propPathname, menuItems, isAdmin = false }: SideBarProps) => {
    const currentPathname = usePathname();
    const pathname = propPathname || currentPathname;

    // ===== Chuẩn hóa menuItems tránh lỗi khi API trả về một object envelope thay vì array trực tiếp =====
    const normalizedMenuItems = useMemo<MenuTreeItem[]>(() => {
        if (!menuItems) return [];
        return Array.isArray(menuItems)
            ? menuItems
            : (menuItems as any).elements || (menuItems as any).rows || (menuItems as any).data || [];
    }, [menuItems]);

    // ===== Tìm selected key từ pathname =====
    const selectedKey = useMemo(() => {
        const findActive = (items: MenuTreeItem[]): string => {
            if (!Array.isArray(items)) return '';
            for (const item of items) {
                if (item.path && pathname?.startsWith(item.path) && item.path !== '/') {
                    // Kiểm tra children trước để ưu tiên item con cụ thể hơn
                    if (item.children?.length) {
                        const childKey = findActive(item.children);
                        if (childKey) return childKey;
                    }
                    return item.path;
                }
                if (item.children?.length) {
                    const childKey = findActive(item.children);
                    if (childKey) return childKey;
                }
            }
            return '';
        };
        return findActive(normalizedMenuItems);
    }, [normalizedMenuItems, pathname]);

    // ===== Mở tất cả menu cha khi không collapse =====
    const defaultOpenKeys = useMemo(() => {
        if (collapse) return [];
        const collectParentKeys = (items: MenuTreeItem[]): string[] => {
            if (!Array.isArray(items)) return [];
            return items.flatMap(item => {
                if (item.children?.length) {
                    return [item.id, ...collectParentKeys(item.children)];
                }
                return [];
            });
        };
        return collectParentKeys(normalizedMenuItems);
    }, [normalizedMenuItems, collapse]);

    // ===== Skeleton loading =====
    const skeletonItems = useMemo(() =>
        Array.from({ length: 8 }).map((_, index) => ({
            key: `skeleton-${index}`,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#f0f0f0' }} className="animate-pulse" />
                    <div style={{ height: '16px', width: '70%', backgroundColor: '#f0f0f0', borderRadius: '4px' }} className="animate-pulse" />
                </div>
            ),
            disabled: true,
            style: { cursor: 'default' },
        })), []);

    // ===== Chuyển đổi menu-tree thành cấu trúc Ant Design =====
    const buildMenuItems = useMemo(() => {
        const convert = (items: MenuTreeItem[]): any[] => {
            if (!Array.isArray(items)) return [];
            return [...items]
                .sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0))
                .map(item => {
                    const isActive = item.path
                        ? item.path !== '/' && pathname?.startsWith(item.path)
                        : false;
                    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

                    if (hasChildren) {
                        // Menu cha (có children) — hiển thị dạng SubMenu
                        return {
                            key: item.id,
                            icon: (
                                <IconRenderer
                                    iconName={item.icon}
                                    style={{ color: '#1378C0', fontSize: '16px' }}
                                />
                            ),
                            label: (
                                <span style={{ fontSize: '16px', fontWeight: 500, color: '#1378C0' }}>
                                    {item.name}
                                </span>
                            ),
                            children: convert(item.children!),
                            style: { color: '#1378C0' },
                        };
                    }

                    // Menu lá (không có children) — hiển thị dạng item bình thường
                    return {
                        key: item.path || item.id,
                        icon: (
                            <IconRenderer
                                iconName={item.icon}
                                style={{
                                    color: isActive ? '#076EB8' : '#545454',
                                    fontSize: '16px',
                                    display: 'inline-flex',
                                }}
                            />
                        ),
                        label: (
                            <Link href={item.path || '#'}>
                                <span style={{
                                    marginLeft: '4px',
                                    fontSize: '16px',
                                    fontWeight: 'regular',
                                    fontFamily: 'roboto',
                                    color: isActive ? '#076EB8' : '#545454',
                                }}>
                                    {item.name}
                                </span>
                            </Link>
                        ),
                        style: {
                            backgroundColor: isActive ? 'rgba(230, 247, 255, 0.8)' : 'transparent',
                            borderLeft: isActive ? '2px solid #076EB8' : 'none',
                            color: isActive ? '#076EB8' : '#545454',
                        },
                    };
                });
        };

        if (!normalizedMenuItems || normalizedMenuItems.length === 0) return skeletonItems;
        return convert(normalizedMenuItems);
    }, [normalizedMenuItems, pathname, collapse, skeletonItems]);

    return (
        <ConfigProvider
            theme={{
                components: {
                    Menu: {
                        itemActiveBg: 'rgba(230, 247, 255, 0.8)',
                        subMenuItemBg: '#ffffff',
                    },
                },
            }}
        >
            {/* Badge phân biệt admin / user */}
            {!collapse && (
                <div style={{
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>

                </div>
            )}
            <Menu
                className={collapse ? 'collapsed' : ''}
                style={{
                    borderInlineEnd: 'none',
                    width: '100%',
                    backgroundColor: 'white',
                }}
                mode="inline"
                inlineCollapsed={collapse}
                selectedKeys={selectedKey ? [selectedKey] : []}
                defaultOpenKeys={defaultOpenKeys}
                items={buildMenuItems}
            />
        </ConfigProvider>
    );
};

export default SideBar;
