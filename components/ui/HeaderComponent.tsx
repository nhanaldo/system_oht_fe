"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Badge, Popover, App, Popconfirm } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    DownOutlined,
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { logoutAction } from '@/app/(app)/actions/authAction';

const { Header } = Layout;

interface HeaderComponentProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    username: string;
}

export default function HeaderComponent({ collapsed, setCollapsed, username }: HeaderComponentProps) {
    const [avatarData, setAvatarData] = useState<string>("");
    const { modal } = App.useApp();
    const router = useRouter();

    useEffect(() => {
        const storedAvatar = localStorage.getItem("avatarUrl");
        if (storedAvatar) {
            setAvatarData(storedAvatar);
        }
    }, []);

    const handleLogout = async () => {
        localStorage.removeItem("avatarUrl");
        await logoutAction();
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: <span style={{ color: '#1378C0' }}>Hồ sơ cá nhân</span>,
            icon: <UserOutlined style={{ color: '#1378C0' }} />,
            onClick: () => router.push('/infoUser'),
        },
        {
            key: 'logout',
            label: (
                <Popconfirm
                    title="Thông báo"
                    description="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
                    onConfirm={handleLogout}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    placement="left"
                    okButtonProps={{
                        style: {
                            backgroundColor: '#1378C0',
                            borderColor: '#1378C0',
                        }
                    }}
                >
                    <span style={{ display: 'block', width: '100%', color: '#1378C0' }}>Đăng xuất</span>
                </Popconfirm>
            ),
            icon: <LogoutOutlined style={{ color: '#1378C0' }} />,
        },
    ];

    return (
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
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', flex: 1, minWidth: 0 }}>
                {/* Toggle Button */}
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined style={{ color: '#000000' }} /> : <MenuFoldOutlined style={{ color: '#000000' }} />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '18px',
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        color: '#000000'
                    }}
                />

                {/* Logo Area */}
                <Link href="/home">
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
                </Link>
                {/* text-overflow xử lý chữ thành ... khi thu nhỏ màn hình 
                whiteSpace: 'nowrap' không xuống dòng
                overflow: 'hidden' không tràn chữ */}
                {/* Title */}
                <h3 className="mobile-title" style={{ margin: 0, fontWeight: 600, color: '#373838', fontSize: '22px', fontStyle: "normal", paddingLeft: '25px', fontFamily: "Roboto", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                            <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#1378C0', }} />
                        </Badge>
                    </Popover>
                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                        <Space style={{ cursor: 'pointer' }}>
                            {avatarData ? (
                                <Avatar src={avatarData} />
                            ) : (
                                <Avatar style={{ backgroundColor: '#0F6EB8', color: '#fff', fontWeight: 500, marginRight: '7px' }}>
                                    {username?.charAt(0)?.toUpperCase() || 'A'}
                                </Avatar>
                            )}
                            <span className="mobile-user-name" style={{ fontWeight: 400, fontSize: '16px', color: '#545454', fontFamily: "roboto", lineHeight: 1, fontStyle: "normal", whiteSpace: 'nowrap' }}>{username}</span>
                            <DownOutlined style={{ fontSize: '12px', color: '#292D32' }} />
                        </Space>
                    </Dropdown>
                </Space>
            </div>
        </Header>
    );
}
