"use client";

import React from "react";
import { ConfigProvider } from "antd";

interface ModalThemeProviderProps {
    children: React.ReactNode;
}

/**
 * A wrapper component that provides a sanitized theme for forms inside modals.
 * It removes default blue focus outlines and enforces standard neutral hover states.
 */
export default function ModalThemeProvider({ children }: ModalThemeProviderProps) {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                        colorPrimary: "#d9d9d9",
                        colorPrimaryHover: "#d9d9d9",
                        controlOutline: "transparent",
                        colorText: "#484848",
                        colorTextDisabled: "#484848",
                    },
                    InputNumber: {
                        colorPrimary: "#d9d9d9",
                        colorPrimaryHover: "#d9d9d9",
                        controlOutline: "transparent",
                        colorText: "#484848",
                        colorTextDisabled: "#484848",
                    },
                    Select: {
                        colorPrimary: "#d9d9d9",
                        colorPrimaryHover: "#d9d9d9",
                        controlOutline: "transparent",
                        colorText: "#484848",
                        colorTextDisabled: "#484848",
                    },
                    Button: {
                        controlOutline: "transparent",
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
}
