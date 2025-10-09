"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginForm() {
    const router = useRouter();
    const [searchParams] = useState(() => {
        // This will only run on the client side
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get("redirect");
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show error message
                toast.error(data.error || "Login failed");
                return;
            }

            // Success - redirect to original destination or dashboard
            toast.success("Login successful!");
            router.push(searchParams || "/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your Cartmate account to continue
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Email field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/reset-password"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        {/* Login button */}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>

                        {/* Link to register */}
                        <p className="text-sm text-center text-muted-foreground">
                            Don't have an account?{" "}
                            <Link
                                href={
                                    searchParams
                                        ? `/register?redirect=${encodeURIComponent(searchParams)}`
                                        : "/register"
                                }
                                className="text-primary hover:underline font-medium"
                            >
                                Create one
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

// Main component that wraps LoginForm in Suspense to handle useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                        <CardDescription>
                            Sign in to your Cartmate account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-10 bg-muted animate-pulse rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-10 bg-muted animate-pulse rounded"></div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="h-10 bg-muted animate-pulse rounded w-full"></div>
                    </CardFooter>
                </Card>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
