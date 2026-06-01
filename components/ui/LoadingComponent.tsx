import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from "antd";
const LoadingComponent = ({
    color = "#07539d",
    size = "3rem",
    width = "auto",
    height = "auto",
}) => {
    const wrapperStyle = {
        width,
        height
    };

    const iconStyle = {
        color,
        fontSize: size,
    };

    return (
        <div style={wrapperStyle} className="flex justify-center items-center ">
            <Spin indicator={<LoadingOutlined style={iconStyle} spin />} />{" "}
        </div>
    );
};
export default LoadingComponent;
