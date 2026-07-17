'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout } from 'antd';
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSiderWidth(280); // Khi hiển thị dạng overlay, bề rộng thoải mái hơn
                setIsMobile(true);
            } else {
                setSiderWidth(280);
                setIsMobile(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (collapsed) {
            document.body.classList.remove('sidebar-expanded');
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
            document.body.classList.add('sidebar-expanded');
        }
        // phát sự kiện giả lập resize sau khi side bar đóng mở 
        // 
        // const timer = setTimeout(() => {
        //     window.dispatchEvent(new Event('resize'));
        // }, 300);
        // return () => clearTimeout(timer);
    }, [collapsed]);

    const pathname = usePathname();
    const isViewMode = pathname?.endsWith('/view');

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

    if (isViewMode) {
        return (
            <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <Content style={{ padding: 0, margin: 0, background: '#f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                        {children}
                </Content>
            </Layout>
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

            <Layout style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
                {/* Backdrop mờ khi mở Sidebar trên mobile */}
                {isMobile && !collapsed && (
                    <div
                        className="absolute inset-0 bg-black/40 z-[98]"
                        onClick={() => setCollapsed(true)}
                    />
                )}

                {/* Sidebar */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    collapsedWidth={0}
                    width={siderWidth}
                    breakpoint="lg"
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                    theme="light"
                    style={{
                        height: '100%',
                        overflow: 'hidden',
                        background: '#ffffff',
                        position: isMobile ? 'absolute' : 'relative',
                        zIndex: isMobile ? 99 : 1,
                        left: 0,
                        top: 0,
                        bottom: 0,
                        boxShadow: isMobile && !collapsed ? '4px 0 10px rgba(0,0,0,0.1)' : 'none'
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
                        {/* //Tự động đóng Sidebar khi nhấn chọn Menu (Mobile) */}
                        {/* <SideBar collapse={collapsed} menuItems={menuData} isAdmin={isAdmin} onMenuClick={() => { if (isMobile) setCollapsed(true); }} /> */}
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
