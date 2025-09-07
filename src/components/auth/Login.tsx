'use client'
import Image from "next/image"
import logo from "@/assets/login/logo.png"
import seen from "@/assets/login/seen.png"
import unseen from "@/assets/login/unseen.png"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            id: number;
            email: string;
            username: string;
            role: string;
        };
    };
}

const setAuthTokens = (accessToken: string, refreshToken: string, expiresIn: number) => {
  const expirationTime = new Date(Date.now() + expiresIn * 1000);
  
  document.cookie = `accessToken=${accessToken}; path=/; expires=${expirationTime.toUTCString()}; SameSite=Lax`;
  
  const refreshExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `refreshToken=${refreshToken}; path=/; expires=${refreshExpiration.toUTCString()}; SameSite=Lax`;
  
document.cookie = `tokenExpiry=${expirationTime.getTime()}; path=/; expires=${expirationTime.toUTCString()}; SameSite=Lax`;};

const Login = () => {
    const router = useRouter();
    
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const apiEndpoint = `/api-proxy/api/v1/auth/login`;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username:username, password }),
            });

            const result: LoginResponse = await response.json();

            if (response.ok && result.success) {
                console.log("Login Berhasil!", result);
                
                setAuthTokens(
                    result.data.access_token,
                    result.data.refresh_token,
                    result.data.expires_in
                );
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(result.data.user));
                }
                
                router.push('/news'); 
            } else {
                setError(result.message || "Email atau Password salah!");
            }

        } catch (err) {
            console.error("Fetch error:", err);
            setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#4F000D] h-screen overflow-hidden flex">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-y-[5vw] sm:justify-between px-[5vw] sm:px-[10vw] sm:relative w-full">
                <div className="flex flex-col items-center sm:items-start w-full justify-center sm:relative sm:h-screen">
                    <div className="absolute w-[50vw] h-[50vw] sm:w-[25vw] sm:h-[25vw] bg-white rounded-full blur-[200px] sm:blur-[500px] right-0 top-0 sm:-top-[10%]" />
                    <h1 className="_britanica_black text-white text-[clamp(7vw,7vw,7vw)] text-nowrap sm:text-[clamp(4vw,4vw,10vw)]">
                        Welcome Back
                    </h1>
                    <p className="font_britanica_regular sm:text-start text-center text-white text-[clamp(4vw,4vw,4vw)] sm:text-[clamp(1vw,1.5vw,4vw)]">
                        Accessing the secure portal for HAS Attorneys at Law. Thank you for your dedication in maintaining our digital presence.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col items-start w-full py-12 justify-center sm:py-sm px-[3vw] rounded-2xl bg-white gap-y-[3vw]">
                    <Image src={logo} alt="logo" className="w-[30vw] sm:w-[15vw]" />
                    <div>
                        <h2 className="font_britanica_black text-[clamp(5vw,5vw,5vw)] sm:text-[clamp(2vw,2.5vw,5vw)]">Admin Login</h2>
                        <p className="font_britanica_bold text-[clamp(3vw,3.8vw,4vw)] sm:text-[clamp(1vw,1.5vw,4vw)]">This page is for authorized users only. Please maintain the confidentiality of your access</p>
                    </div>

                    <div className="w-full">
                        <label htmlFor="username" className="text-[clamp(4vw,4vw,4vw)] sm:text-[clamp(1vw,1.5vw,4vw)] w-full font_britanica_bold">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border-2 placeholder:text-[clamp(4vw,4vw,4vw)] sm:placeholder:text-[clamp(1.5vw,1.5vw,4vw)] font_britanica_regular placeholder:text-[#DBDBDB] text-black rounded-xl pl-[1vw] sm:py-[0.5vw] py-[1.5vw] outline-none"
                            placeholder="Enter Username or Email"
                            required
                        />
                    </div>
                    
                    <div className="w-full relative">
                        <label htmlFor="password" className="text-[clamp(4vw,4vw,4vw)] sm:text-[clamp(1vw,1.5vw,4vw)] font_britanica_bold">
                            Password
                        </label>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 placeholder:text-[clamp(4vw,4vw,4vw)] sm:placeholder:text-[clamp(1.5vw,1.5vw,4vw)] font_britanica_regular placeholder:text-[#DBDBDB] text-black rounded-xl pl-[1vw] py-[1.5vw] sm:py-[0.5vw] pr-12 outline-none"
                            placeholder="Enter Password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2/5 inset-y-0 right-0 grid place-content-center px-2 text-[#DBDBDB] cursor-pointer"
                        >
                            {showPassword ? (
                                <Image src={seen} alt="seen" className="w-[25px]" />
                            ) : (
                                <Image src={unseen} alt="unseen" className="w-[25px]" />
                            )}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-center text-red-600 w-full">
                            {error}
                        </p>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="font_britanica_regular text-[clamp(3vw,3.8vw,4vw)] sm:text-[clamp(1vw,1.5vw,4vw)] text-white bg-[#A0001B] px-[3vw] py-[1.5vw] sm:py-[0.5vw] rounded-3xl hover:bg-[#780014] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login;