'use client';

import React, { useState, useEffect } from 'react';
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
    const [mounted, setMounted] = useState(false);
    const [siderWidth, setSiderWidth] = useState(280);

    useEffect(() => {
        setMounted(true);

        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSiderWidth(200);
            } else {
                setSiderWidth(280);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) {
        return (
            <div style={{ height: '100vh', width: '100vw', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <img src="/logothaco.png" alt="THACO Logo" style={{ maxHeight: '40px', objectFit: 'contain' }} />
                    <div style={{ color: '#076eb8', fontFamily: 'Roboto, sans-serif', fontWeight: 500, fontSize: '14px' }}>
                        Đang tải hệ thống...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>

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
                    width={siderWidth}
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
