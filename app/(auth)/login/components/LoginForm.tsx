"use client";

import { useState } from "react";
import Image from "next/image";
import { loginAction } from "@/app/(app)/actions/authAction";
import { useRouter } from "next/navigation";
import { log } from "console";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ account: "", password: "", general: "" });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let hasError = false;
        const newErrors = { account: "", password: "", general: "" };

        if (!account.trim()) {
            newErrors.account = "Vui lòng nhập tên đăng nhập";
            hasError = true;
        }

        if (!password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
            hasError = true;
        }

        setErrors(newErrors);

        if (!hasError) {
            setIsLoading(true);
            try {
                const result = await loginAction({ account, password });
                if (result.success) {
                    // Chuyển hướng khi đăng nhập thành công
                    router.push("/home"); // Thay bằng route trang chủ thực tế của bạn
                } else {
                    console.log("Đăng nhập thất bại", result);
                    setErrors({ ...newErrors, general: result.error || "Đăng nhập thất bại" });
                }
            } catch (err) {
                setErrors({ ...newErrors, general: "Lỗi kết nối. Vui lòng thử lại sau." });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full lg:w-1/2 h-full min-h-screen bg-[#0F6EB8]">
            <div className="w-full h-full min-h-screen flex items-center justify-center bg-white lg:rounded-bl-[120px] p-6 sm:p-12">
                <div className="w-full max-w-md space-y-10">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden justify-center mb-6">
                        <Image
                            src="/logomobile.png"
                            alt="Mobile Logo"
                            width={300}
                            height={60}
                            className="object-contain"
                            priority
                        />
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-2xl leading-none font-medium font-roboto text-gray-900">
                            Đăng nhập tài khoản
                        </h1>
                    </div>

                    <form className="space-y-5 w-full" onSubmit={handleSubmit}>
                        {errors.general && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 text-center">
                                {errors.general}
                            </div>
                        )}

                        {/* Tên đăng nhập */}
                        <div className="space-y-2 text-left">
                            <label className="text-[16px] font-roboto font-regular text-gray-700 block leading-none text-[#262626]">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                name="account"
                                placeholder="Nhập vào tên đăng nhập"
                                value={account}
                                onChange={(e) => {
                                    setAccount(e.target.value);
                                    if (errors.account) setErrors({ ...errors, account: "" });
                                }}
                                className={`w-full px-4 py-3 bg-[#f8f9fa] border border-gray-200/60 focus:ring-[#0F6EB8]/20 focus:border-[#0F6EB8] rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400`}
                            />
                            {errors.account && (
                                <p className="text-red-500 text-[13px] mt-1">{errors.account}</p>
                            )}
                        </div>

                        {/* Mật khẩu */}
                        <div className="space-y-2 text-left">
                            <label className="text-[16px] font-roboto font-regular text-gray-700 block leading-none text-[#262626]">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập vào mật khẩu"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: "" });
                                    }}
                                    className={`w-full px-4 py-3 bg-[#f8f9fa] border border-gray-200/60 focus:ring-[#0F6EB8]/20 focus:border-[#0F6EB8] rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400 pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-[13px] mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-[#0F6EB8] hover:bg-[#0b5a96] text-white font-medium text-[15px] py-3.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0F6EB8]/50 focus:ring-offset-1 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}