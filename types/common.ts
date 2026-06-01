import { ColumnType } from "antd/es/table";
import { Control, ControllerRenderProps, FieldValues, Path } from "react-hook-form";

export type BaseProps = {
    className?: string;
    style?: React.CSSProperties;
};

export type WithChildren = {
    children?: React.ReactNode;
};

export type ModalProps<T = object> = {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: T) => void;
    children?: T;
    onOpenChange?: (open: boolean) => void;
    table?: string;
    onSuccess?: () => void;
    setOpenModal?: () => void;
}

export type ColumnTableProps = {
    onAdd?: (record: any) => void;
    onEdit?: (record: any) => void;
    onView?: (record: any) => void;
    onDelete?: (record: any) => void;
    onUpdate?: (record: any) => void;
    onLock?: (record: any) => void;
    onUnlock?: (record: any) => void;
    onPause?: (record: any) => void;
    onConfirmDone?: (record: any) => void;
    onConfirmStart?: (record: any) => void;
    onApproval?: (record: any) => void;
    onReset?: (record: any) => void;
};
export type UserInfoType = {
    account: string;
    staffId: string;
    name: string;
    phoneNumber: string;
    role: string;
    avatar: string;
};

export type RoleId = number | string;
export type MenuState = {
    main?: string;
    sub?: string | null;
}
export type MenuItemType = {
    name: string;
    state: MenuState;
    link: string;
    icon?: React.ReactNode;
    iconSelected?: React.ReactNode;
    content?: string;
    roleRequired?: RoleId | RoleId[];
};
export type RouteType = {
    path: string;
    element: React.ReactNode;
    state?: string;
    roleRequired?: RoleId | RoleId[];
};
export type ControllerProps<TFieldValues extends FieldValues> = {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    label: string;
    render: (
        field: ControllerRenderProps<any>
    ) => React.ReactNode;
    rules?: object;
    style?: React.CSSProperties;
    required?: boolean;
    wrapperCol?: object;
    labelCol?: object;
};
export type FieldControllerProps<TFieldValues extends FieldValues> = {
    name: Path<TFieldValues>;
    label: string;
    render: (
        field: ControllerRenderProps<any>
    ) => React.ReactNode;
    rules?: object;
    style?: React.CSSProperties;
    required?: boolean;
    wrapperCol?: object;
    labelCol?: object;
};


export type ColumnMeta<T> = {
    searchable?: boolean;
    sortable?: boolean | {
        compare?: (a: T, b: T) => number;
    };
    filterable?: {
        options: { label: string; value: string | number }[];
        multiple?: boolean;
    };

    tableName?: string;
};
export type ColumnTypeCustom<T> = ColumnType<T> & ColumnMeta<T>;
export type Nullable<T> = T | null;

export type ApiError = {
    message: string;
    statusCode: number;
    type?: string;
};
