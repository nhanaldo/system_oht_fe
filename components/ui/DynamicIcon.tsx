"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import { AiOutlineDatabase } from 'react-icons/ai';

// Mapping prefixes to their dynamic import functions
const iconSetLoaders: Record<string, () => Promise<any>> = {
    'Fa': () => import('react-icons/fa'),
    'Md': () => import('react-icons/md'),
    'Io': () => import('react-icons/io5'),
    'Lu': () => import('react-icons/lu'),
    'Bs': () => import('react-icons/bs'),
    'Hi': () => import('react-icons/hi2'),
    'Ai': () => import('react-icons/ai'),
    'Ri': () => import('react-icons/ri'),
    'Fi': () => import('react-icons/fi'),
    'Gi': () => import('react-icons/gi'),
};

interface DynamicIconProps {
    iconName?: string;
    style?: React.CSSProperties;
    className?: string;
}

// Cache for loaded icon sets to avoid redundant imports
const loadedSets: Record<string, any> = {};

export const DynamicIcon = ({ iconName, style, className }: DynamicIconProps) => {
    const [IconComponent, setIconComponent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const prefix = useMemo(() => iconName ? iconName.slice(0, 2) : '', [iconName]);

    useEffect(() => {
        if (!iconName) {
            setIconComponent(null);
            return;
        }

        const loadIcon = async () => {
            const loader = iconSetLoaders[prefix];
            if (!loader) {
                setIconComponent(null);
                return;
            }

            try {
                setIsLoading(true);
                // Check cache first
                if (!loadedSets[prefix]) {
                    loadedSets[prefix] = await loader();
                }

                const Icon = loadedSets[prefix][iconName];
                setIconComponent(() => Icon || null);
            } catch (error) {
                console.error(`Failed to load icon: ${iconName}`, error);
                setIconComponent(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadIcon();
    }, [iconName, prefix]);

    if (!iconName || (!IconComponent && !isLoading)) {
        return <AiOutlineDatabase size={21} className={className} style={{ ...style }} />;
    }

    if (isLoading) {
        return <div className={className} style={{ width: '18px', height: '18px', backgroundColor: '#f0f0f0', borderRadius: '2px', ...style }} />;
    }

    if (IconComponent) {
        return <IconComponent size={21} className={className} style={{ ...style }} />;
    }

    return <AiOutlineDatabase size={21} className={className} style={{ ...style }} />;
};

export default DynamicIcon;
