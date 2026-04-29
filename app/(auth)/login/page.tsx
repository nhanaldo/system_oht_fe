import LoginForm from "./components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="flex flex-row min-h-screen w-full bg-gray-100">
            <div className="hidden lg:block w-1/2 bg-white">
                <div className="flex h-full w-full justify-center items-center rounded-tr-[120px] bg-[#0F6EB8]">
                    <Image
                        src="/logocongty.png"
                        alt="Logo"
                        width={500}
                        height={0}
                        sizes="100vw"
                        className="w-[500px] h-auto"
                    />
                </div>
            </div>
            <LoginForm />
        </div>
    );
}