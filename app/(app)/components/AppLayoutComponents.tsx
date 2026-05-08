'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from 'antd';
import SideBar from './SideBar';
import HeaderComponent from '@/components/ui/HeaderComponent';

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
                    width={256}
                    breakpoint="md"
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                    theme="light"
                    style={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        height: '100%',
                    }}
                >
                    <SideBar collapse={collapsed} menuItems={menuData} isAdmin={isAdmin} />
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
