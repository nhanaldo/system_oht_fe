'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from 'antd';
import SideBar from './SideBar';
import HeaderComponent from '@/components/ui/HeaderComponent';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const { Header, Sider, Content, Footer } = Layout;

interface AppLayoutProps {
    children?: React.ReactNode;
    menuData?: any[];
    username?: string;
    isAdmin?: boolean;
}

export default function AppLayoutComponents({ children, menuData = [], username = 'Admin', isAdmin = false }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <style>{`
                @media (max-width: 768px) {
                    .mobile-title {
                        display: none !important;
                    }
                }
                /* Tùy chỉnh OverlayScrollbars để thanh cuộn lơ lửng */
                .os-theme-dark.os-theme-hover {
                    --os-handle-bg: rgba(0, 0, 0, 0.2);
                    --os-handle-bg-hover: rgba(0, 0, 0, 0.3);
                    --os-handle-bg-active: rgba(0, 0, 0, 0.4);
                }
            `}</style>
            {/* Header */}
            <HeaderComponent
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                username={username}
            />

            <Layout style={{ height: 'calc(100vh - 64px)' }}>
                {/* Sidebar */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    collapsedWidth={0}
                    width={280}
                    breakpoint="md"
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                    theme="light"
                    style={{
                        height: '100%',
                        overflow: 'hidden',
                        background: '#ffffff'
                    }}
                >
                    <OverlayScrollbarsComponent
                        defer
                        options={{
                            scrollbars: {
                                autoHide: 'leave',
                                autoHideDelay: 500,
                            },
                        }}
                        style={{ maxHeight: '100%' }}
                    >
                        <SideBar collapse={collapsed} menuItems={menuData} isAdmin={isAdmin} />
                    </OverlayScrollbarsComponent>
                </Sider>

                {/* Main Content */}
                <Layout style={{ background: '#f8f9fa', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <Content
                        className="mobile-content-padding"
                        style={{
                            padding: 25,
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
