"use client";

import { App } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import React from "react";
import Image from "next/image";
// ==============================
// Toast Item Renderer
// ==============================

function ToastContent({
    message,
    type,
}: {
    message: React.ReactNode;
    type: "success" | "error";
}) {
    const isSuccess = type === "success";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                background: "#FFFFFF",
                borderRadius: 10,
                borderStyle: "solid",
                borderWidth: "0px 0px 1px 3px",
                borderColor: isSuccess ? "#52C41A" : "#ff4d4f",
                padding: "12px 16px",
                minWidth: 300,
                maxWidth: 420,
                minHeight: 42,
                maxHeight: 64,
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.15)",
                opacity: 1,
            }}
        >
            {/* Icon */}
            <Image
                src={isSuccess ? "/icon.svg/check-circle.svg" : "/icon.svg/close-circle.svg"}
                alt={isSuccess ? "Success" : "Error"}
                width={16}
                height={16}
                style={{ flexShrink: 0, marginTop: 2 }}
            />

            {/* Message */}
            <span
                style={{
                    fontFamily: "Roboto, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#374151",
                    lineHeight: "1.5",
                }}
            >
                {message}
            </span>
        </div>
    );
}

// ==============================
// Hook: useToast — consume anywhere inside <App> context
// ==============================

export function useToast() {
    const { message } = App.useApp();

    const showSuccess = (msg: React.ReactNode) => {
        message.open({
            content: <ToastContent message={msg} type="success" />,
            duration: 2,
            className: "custom-toast-notice",
            style: {
                // Remove ant default message icon/background
                padding: 0,
                background: "transparent",
                boxShadow: "none",
            },
            icon: null,
        });
    };

    const showError = (msg: React.ReactNode) => {
        message.open({
            content: <ToastContent message={msg} type="error" />,
            duration: 2,
            className: "custom-toast-notice",
            style: {
                padding: 0,
                background: "transparent",
                boxShadow: "none",
            },
            icon: null,
        });
    };

    return { showSuccess, showError };
}
