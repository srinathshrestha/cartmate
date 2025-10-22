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
import { Eye, EyeOff } from "lucide-react";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function RegisterForm() {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password strength calculation function
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };

  // Get password strength info
  const getPasswordStrengthInfo = (password) => {
    const strength = calculatePasswordStrength(password);
    const strengthLevels = {
      0: { label: "", color: "", bgColor: "" },
      1: { label: "Very Weak", color: "text-red-500", bgColor: "bg-red-500" },
      2: { label: "Weak", color: "text-red-400", bgColor: "bg-red-400" },
      3: { label: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500" },
      4: { label: "Good", color: "text-blue-500", bgColor: "bg-blue-500" },
      5: { label: "Strong", color: "text-green-500", bgColor: "bg-green-500" }
    };
    return strengthLevels[strength];
  };

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

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error message
        if (data.details) {
          // Show validation errors
          const firstError = Object.values(data.details)[0]?.[0];
          toast.error(firstError || data.error);
        } else {
          toast.error(data.error || "Registration failed");
        }
        return;
      }

      // Success - redirect to original destination or dashboard
      toast.success("Account created successfully!");
      router.push(searchParams || "/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your details to get started with Cartmate
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Username field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthInfo(formData.password).bgColor
                          }`}
                        style={{
                          width: `${(calculatePasswordStrength(formData.password) / 5) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthInfo(formData.password).color
                      }`}>
                      {getPasswordStrengthInfo(formData.password).label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters with letters and numbers
                  </p>
                </div>
              )}

              {!formData.password && (
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters with letters and numbers
                </p>
              )}
            </div>

            {/* Confirm password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Register button */}
            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>

            {/* Link to login */}
            <p className="text-sm text-center text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                href={
                  searchParams
                    ? `/login?redirect=${encodeURIComponent(searchParams)}`
                    : "/login"
                }
                className="text-primary hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Main component that wraps RegisterForm in Suspense to handle useSearchParams
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your details to get started with Cartmate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-10 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-10 bg-muted animate-pulse rounded"></div>
            </div>
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
      <RegisterForm />
    </Suspense>
  );
}
