"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Badge, Popover, App, Popconfirm, Input } from 'antd';
import {
    BellOutlined,
    DownOutlined,
    LogoutOutlined,
    UserOutlined,
    SearchOutlined,
    HomeOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { logoutAction, setWarehouseIdAction } from '@/app/(app)/actions/authAction';
import { getCurrentAccountProfile } from '@/app/(app)/system/accounts/accountAction';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

const { Header } = Layout;

interface Warehouse {
    id: string;
    name: string;
}

interface HeaderComponentProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    username: string;
}

export default function HeaderComponent({ collapsed, setCollapsed, username }: HeaderComponentProps) {
    const [avatarData, setAvatarData] = useState<string>("");
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
    const [searchText, setSearchText] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSetupMode, setIsSetupMode] = useState(false);
    const { modal } = App.useApp();
    const router = useRouter();

    useEffect(() => {
        const handleSetupMode = (event: any) => {
            if (event.detail !== undefined) {
                setIsSetupMode(event.detail);
            }
        };
        //lắng nghe sự kiện workflow-setup-mode  để cập nhật trạng thái isSetupMode, khi issetup = true thì header sẽ khoá click danh sach
        window.addEventListener('workflow-setup-mode', handleSetupMode);
        return () => {
            window.removeEventListener('workflow-setup-mode', handleSetupMode);
        };
    }, []);

    useEffect(() => {
        const fetchAccountInfo = async () => {
            try {
                const response: any = await getCurrentAccountProfile();
                const data = response?.elements || response?.data || response;
                if (data?.avatar) {
                    setAvatarData(data.avatar);
                }
                if (data?.warehouse_names && data?.warehouse_ids) {
                    const whList = data.warehouse_names.map((name: string, idx: number) => ({
                        id: data.warehouse_ids[idx],
                        name: name
                    }));
                    setWarehouses(whList);

                    // Kiểm tra cookie đã lưu warehouseId chưa
                    const cookies = document.cookie.split('; ');
                    const savedId = cookies.find(row => row.startsWith('selectedWarehouseId='))?.split('=')[1];

                    if (savedId && whList.some((w: Warehouse) => w.id === savedId)) {
                        setSelectedWarehouseId(savedId);
                    } else if (whList.length > 0) {
                        const firstId = whList[0].id;
                        setSelectedWarehouseId(firstId);
                        // Nếu chưa có cookie thì set mặt định là kho đầu tiên
                        if (!savedId) {
                            await setWarehouseIdAction(firstId);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch account info", error);
            }
        };

        fetchAccountInfo();

        const handleAvatarChange = (event: any) => {
            if (event.detail) {
                setAvatarData(event.detail);
            }
        };

        window.addEventListener('avatar-changed', handleAvatarChange);
        return () => {
            window.removeEventListener('avatar-changed', handleAvatarChange);
        };
    }, []);

    const handleLogout = async () => {
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
                    overlayClassName="custom-logout-popconfirm"
                    styles={{ container: { width: 417, height: 157, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' } }}
                    title={<span style={{ fontSize: '16px', fontWeight: 400, marginLeft: "16px", lineHeight: '100%', color: '#001e33' }}>Thông báo</span>}
                    description={<span style={{ fontSize: '14px', marginLeft: "16px", lineHeight: '20px', color: '#485259', display: 'block', marginTop: '4px', }}>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</span>}
                    onConfirm={handleLogout}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    placement="left"
                    icon={<img src="/icon.svg/message.svg" alt="message" style={{ width: 22, height: 22 }} />}

                    okButtonProps={{
                        style: {
                            backgroundColor: '#076eb8',
                            borderColor: '#076eb8',
                            color: '#ffffff',
                            width: '88px',
                            height: '30px',
                            borderRadius: '20px',
                            marginLeft: '20px',
                        }
                    }}
                    cancelButtonProps={{
                        style: {
                            width: '55px',
                            height: '30px',
                            borderColor: '#a1a1a1',
                            color: '#a1a1a1',
                            borderRadius: '20px',
                        }
                    }}
                >
                    <span style={{ display: 'block', width: '100%', color: '#1378C0' }}>Đăng xuất</span>
                </Popconfirm>
            ),
            icon: <LogoutOutlined style={{ color: '#1378C0' }} />,
        },
    ];

    const handleWarehouseSelect = async (wh: Warehouse) => {
        setSelectedWarehouseId(wh.id);
        await setWarehouseIdAction(wh.id);
        setDropdownOpen(false); // Đóng popup sau khi chọn xong
        router.refresh();
    };

    const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

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
                    icon={
                        <img
                            src="/icon.svg/MenuFold.svg"
                            alt="menu-toggle"
                            style={{
                                width: '20px',
                                height: '20px',
                                transform: collapsed ? 'scaleX(-1)' : 'none',
                                transition: 'transform 0.2s ease',
                                display: 'inline-block',
                                verticalAlign: 'middle'
                            }}
                        />
                    }
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '18px',
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                />

                {/* Logo Area */}
                <Link href="/home" style={{ outline: 'none' }}>
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
            <Dropdown
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
                popupRender={() => (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 10px 32px rgba(0,0,0,0.1)',
                        width: "300px",
                        padding: '12px',
                        border: '1px solid #f0f0f0'
                    }}>
                        {/* Search Input */}
                        <div style={{ marginBottom: '12px' }}>
                            <Input
                                placeholder="Tìm kiếm kho theo mã kho, tên kho"
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                style={{
                                    borderRadius: '8px',
                                    height: '40px',
                                    border: '1px solid #d9d9d9'
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '8px 0' }} />

                        {/* Scrollable List with OverlayScrollbars */}
                        <OverlayScrollbarsComponent
                            defer
                            options={{
                                scrollbars: {
                                    autoHide: 'leave',
                                    autoHideDelay: 500,
                                },
                            }}
                            style={{ maxHeight: '280px' }}
                        >
                            <div style={{ paddingRight: '4px' }}>
                                {warehouses.length > 0 ? (
                                    warehouses
                                        .filter(wh => wh.name.toLowerCase().includes(searchText.toLowerCase()))
                                        .map((wh, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleWarehouseSelect(wh)}
                                                style={{
                                                    padding: '12px',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s',
                                                    marginBottom: '4px',
                                                    borderBottom: '1px solid #f9f9f9',
                                                    backgroundColor: selectedWarehouseId === wh.id ? '#f0f7ff' : 'transparent'
                                                }}
                                                className="hover:bg-[#f0f7ff]"
                                            >
                                                <div style={{ fontWeight: 500, color: '#484848', fontSize: '20px' }}>
                                                    {wh.name.split('-')[0].trim()}
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#bfbfbf' }}>Đang tải dữ liệu...</div>
                                )}
                            </div>
                        </OverlayScrollbarsComponent>
                    </div>
                )}
                trigger={['click']}
                placement="bottomRight"
                disabled={warehouses.length === 0 || isSetupMode}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: isSetupMode ? 'not-allowed' : 'pointer',
                        opacity: isSetupMode ? 0.6 : 1,
                        padding: '4px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        transition: 'all 0.3s',
                        height: '46px',
                        justifyContent: 'right'
                    }}
                    title={isSetupMode ? "Không thể đổi kho khi đang thiết lập quy trình" : undefined}
                >
                    <div
                        className="mobile-warehouse-name"
                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right' }}
                    >
                        <span style={{ fontWeight: 500, fontSize: '20px', color: '#484848', lineHeight: '1.2' }}>
                            {selectedWarehouse ? selectedWarehouse.name.split('-')[0].trim() : (warehouses.length > 0 ? "Chọn kho" : "Đang tải...")}
                        </span>
                    </div>
                    <img src="/icon.svg/namewarehouse.svg" alt="warehouse" style={{ width: 25, height: 26 }} />
                </div>
            </Dropdown>
            {/* User Actions */}
            <div className="mobile-header-padding" style={{ display: 'flex', alignItems: 'center', paddingRight: '24px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

                    {/* Hiển thị danh sách kho */}

                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            {avatarData ? (
                                <Avatar src={avatarData} style={{ flexShrink: 0, width: '32px', height: '32px' }} />
                            ) : (
                                <Avatar style={{ flexShrink: 0, width: '32px', height: '32px', backgroundColor: '#0F6EB8', color: '#fff', fontWeight: 500 }}>
                                    {username?.charAt(0)?.toUpperCase() || 'A'}
                                </Avatar>
                            )}
                            <span className="mobile-user-name" style={{ fontWeight: 400, fontSize: '16px', color: '#545454', fontFamily: "roboto", lineHeight: 1, fontStyle: "normal", whiteSpace: 'nowrap' }}>{username}</span>
                            <DownOutlined style={{ fontSize: '12px', color: '#292D32', flexShrink: 0 }} />
                        </div>
                    </Dropdown>
                </div>
            </div>
        </Header >
    );
}
