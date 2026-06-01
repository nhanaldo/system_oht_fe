"use client";

import React, { forwardRef } from "react";
import { Input } from "antd";
import type { InputProps } from "antd";

interface CustomInputProps extends InputProps {
    // Extend with custom props if needed in the future
}

const CustomInput = forwardRef<any, CustomInputProps>(({ className, ...props }, ref) => {
    return (
        <Input
            ref={ref}
            className={`w-full rounded-md border-gray-300 hover:border-[#076EB8] focus:border-[#076EB8] transition-colors ${className || ""}`}
            {...props}
        />
    );
});

CustomInput.displayName = "CustomInput";

export default CustomInput;
