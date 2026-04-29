'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    DownOutlined,
    DatabaseOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge, Popover } from 'antd';
import type { MenuProps } from 'antd';

const { Header, Sider, Content, Footer } = Layout;

// Define Menu Items using TypeScript array of objects
type MenuItem = Required<MenuProps>['items'][number];
import SideBar from './SideBar';

const mapToAntdMenuItems = (apiItems: any, parentKey = 'menu'): MenuItem[] => {
    // Đảm bảo apiItems là mảng. Nếu API trả về object có chứa thuộc tính data là mảng thì lấy thuộc tính đó.
    const itemsArray = Array.isArray(apiItems) ? apiItems : (apiItems?.data || []);
    if (!Array.isArray(itemsArray)) return [];

    return itemsArray.map((item, index) => {
        // Cố gắng tìm tên menu từ các field phổ biến
        const labelText = item.name || item.title || item.label || item.menuName || item.displayName || item.description || `Menu ${index}`;

        // Cố gắng tìm đường dẫn từ các field phổ biến
        const url = item.url || item.path || item.href || item.menuUrl || item.link || item.route;

        // Cố gắng tìm danh sách menu con
        const children = item.children || item.childList || item.subMenus || item.items;

        // Tạo key duy nhất để React không báo lỗi trùng lặp
        const uniqueKey = item.id || item.code || item.key || item.menuId || url || `${parentKey}-${index}`;

        if (children && Array.isArray(children) && children.length > 0) {
            return {
                type: 'group',
                key: uniqueKey,
                label: <span style={{ color: '#076EB8', lineHeight: 1, fontWeight: 500, fontFamily: 'roboto', fontStyle: "medium", fontSize: "16px" }}>{labelText}</span>,
                children: mapToAntdMenuItems(children, uniqueKey).map((child: any) => ({
                    ...child,
                    type: undefined
                })),
            } as MenuItem;
        }

        return {
            key: uniqueKey,
            icon: <DatabaseOutlined />,
            style: { color: '#545454', lineHeight: 1, fontWeight: 400, fontFamily: 'roboto', fontStyle: "regular", fontSize: "16px" },
            label: url ? <Link href={url}>{labelText}</Link> : labelText,
        } as MenuItem;
    });
};

const userMenuItems: MenuProps['items'] = [
    {
        key: 'profile',
        label: 'Hồ sơ cá nhân',
    },
    {
        key: 'logout',
        label: 'Đăng xuất',
        danger: true,
    },
];

interface AppLayoutProps {
    children?: React.ReactNode;
    menuData?: any[];
}

export default function AppLayoutComponents({ children, menuData = [] }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const dynamicMenuItems = useMemo(() => mapToAntdMenuItems(menuData), [menuData]);

    console.log(menuData);

    return (
        <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <style>{`
                @media (max-width: 768px) {
                    .mobile-title {
                        display: none !important;
                    }
                }
            `}</style>
            {/* Header */}
            <Header
                style={{
                    padding: 0,
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e8e8e8',
                    height: '64px',
                    zIndex: 10,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', flex: 1, minWidth: 0 }}>
                    {/* Toggle Button */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '18px',
                            width: 64,
                            height: 64,
                            flexShrink: 0
                        }}
                    />

                    {/* Logo Area */}
                    <div
                        className="mobile-logo-wrapper"
                        style={{
                            width: 192,
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}
                    >
                        <img
                            src="/logothaco.png"
                            alt="Logo Công ty"
                            style={{ maxHeight: '40px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Title */}
                    <h3 className="mobile-title" style={{ margin: 0, fontWeight: 600, color: '#373838', fontSize: '22px', fontStyle: "normal", paddingLeft: '16px', fontFamily: "Roboto", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        HỆ THỐNG PHẦN MỀM KHO THÔNG MINH
                    </h3>
                </div>

                {/* User Actions */}
                <div className="mobile-header-padding" style={{ display: 'flex', alignItems: 'center', paddingRight: '24px', flexShrink: 0 }}>
                    <Space size="middle">
                        <Popover
                            content={<div style={{ padding: '8px', color: '#545454' }}>Chưa có thông báo</div>}
                            title={<span style={{ fontWeight: 600 }}>Thông báo</span>}
                            trigger="click"
                            placement="bottomRight"
                        >
                            <Badge>
                                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#1890ff', }} />
                            </Badge>
                        </Popover>
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}   >
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
                                <span className="mobile-user-name" style={{ fontWeight: 400, fontSize: '16px', color: '#545454', fontFamily: "roboto", lineHeight: 1, fontStyle: "normal", whiteSpace: 'nowrap' }}>Nha, Shane</span>
                                <DownOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                            </Space>
                        </Dropdown>
                    </Space>
                </div>
            </Header>

            <Layout style={{ height: 'calc(100vh - 64px)' }}>
                {/* Sidebar */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    collapsedWidth={0}
                    width={256}
                    breakpoint="md"
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                    theme="light"
                    style={{
                        overflow: 'auto',
                        height: '100%',
                    }}
                >
                    <SideBar collapse={collapsed} menuItems={menuData} />
                </Sider>

                {/* Main Content */}
                <Layout style={{ background: '#f8f9fa', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <Content
                        className="mobile-content-padding"
                        style={{
                            padding: 24,
                            margin: 0,
                            background: '#f1f5f9',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%'
                        }}
                    >

                        {children}
                    </Content>

                    {/* Footer */}
                    <Footer style={{ textAlign: 'left', fontFamily: 'roboto', fontStyle: "regular", padding: '12px 24px', color: '#5f5d5d', fontWeight: 400, background: 'white' }}>
                        Bản quyền thuộc về THACO Chu Lai © 2026
                    </Footer>
                </Layout>
            </Layout>
        </Layout >
    );
}
