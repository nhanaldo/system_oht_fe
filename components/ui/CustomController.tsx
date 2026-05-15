import { Control, Controller, ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { Form } from "antd";

type ColConfig = {
    style?: React.CSSProperties;
    [key: string]: unknown;
};

type ControllerProps<TFieldValues extends FieldValues> = {
    name: Path<TFieldValues>;
    control: Control<TFieldValues>;
    label: string;
    render: (
        field: ControllerRenderProps<TFieldValues>
    ) => React.ReactNode;
    rules?: Record<string, unknown>;
    style?: React.CSSProperties;
    required?: boolean;
    wrapperCol?: ColConfig;
    labelCol?: ColConfig;
    layout?: "horizontal" | "vertical";
};

export default function FormItemController<TFieldValues extends FieldValues = FieldValues>({
    name,
    label,
    control,
    render,
    rules,
    style,
    required,
    wrapperCol,
    labelCol,// giá trị truyền vào khi sử dụng component (cột tiêu đề) 
    layout
}: ControllerProps<TFieldValues>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            // chứa các hàm cần thiết để điều khiển input (value, onChange, onBlur), trong khi fieldState chứa thông tin xem input đó có đang bị lỗi hay không
            render={({ field, fieldState }) => {
                const { ref, ...restField } = field; // bỏ ref để tránh warning

                // cột tiêu đề 
                const defaultLabelCol = {
                    style: {
                        minWidth: 200,
                        height: 40,
                        textAlign: "left" as const,
                        display: "flex",
                        alignItems: "center",
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#484848",
                    },
                };

                const finalLabelCol = labelCol || defaultLabelCol;

                const fontSize = finalLabelCol?.style?.fontSize || 14;
                const color = finalLabelCol?.style?.color || "#484848";
                return (
                    <Form.Item
                        colon={false}
                        layout={layout || "horizontal"}
                        label={
                            <span style={{ fontSize, color: color }}>
                                {label}
                                {required && (
                                    <span style={{ color: "#ff4d4f", marginLeft: 6 }} aria-hidden>
                                        *
                                    </span>
                                )}
                            </span>
                        }
                        wrapperCol={wrapperCol || { style: { paddingLeft: 20 } }}
                        labelCol={finalLabelCol}
                        required={false}
                        validateStatus={fieldState.error ? "error" : undefined}
                        help={null}
                        style={style}
                        className="relative mb-0"
                    >
                        {/* chứa ô input  */}
                        {render(restField as ControllerRenderProps<TFieldValues>)}
                        {fieldState.error && (
                            <div className="absolute top-full left-5 text-[#ff4d4f] h-[14px] leading-[14px] text-[12px] mt-1 font-normal">
                                {fieldState.error.message}
                            </div>
                        )}
                    </Form.Item>
                );
            }}
        />
    );
}
