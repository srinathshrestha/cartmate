"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AccountInfo from "@/components/profile/AccountInfo";
import AvatarUpload from "@/components/profile/AvatarUpload";
import DeleteAccount from "@/components/profile/DeleteAccount";
import EmailVerification from "@/components/profile/EmailVerification";
import PasswordChange from "@/components/profile/PasswordChange";
import ProfileForm from "@/components/profile/ProfileForm";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * Profile page component.
 * Allows users to view and edit their profile, upload avatar, verify email, and delete account.
 */
export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadBlocked, setIsUploadBlocked] = useState(false);

    // Fetch user data on mount
    useEffect(() => {
        fetchUser();
    }, []);

    // Prevent navigation during upload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isUploadBlocked) {
                e.preventDefault();
                e.returnValue = "Upload in progress. Are you sure you want to leave?";
                return e.returnValue;
            }
        };

        if (isUploadBlocked) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isUploadBlocked]);

    const fetchUser = async () => {
        try {
            const response = await fetch("/api/auth/me");
            if (!response.ok) {
                router.push("/login");
                return;
            }
            const data = await response.json();
            setUser(data.user);
        } catch (error) {
            console.error("Error fetching user:", error);
            toast.error("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle user data updates from child components
    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    // Handle upload state from AvatarUpload component
    const handleUploadStateChange = (blocked) => {
        setIsUploadBlocked(blocked);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border">
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" disabled={isUploadBlocked}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg sm:text-2xl font-bold">Profile Settings</h1>
                        {isUploadBlocked && (
                            <div className="flex items-center gap-2 text-orange-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                <span className="text-sm">Upload in progress...</span>
                            </div>
                        )}
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main content */}
            <main className={`container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl ${isUploadBlocked ? 'pointer-events-none opacity-50' : ''}`}>
                <div className="space-y-6">
                    {/* Email Verification Alert */}
                    <EmailVerification user={user} onUpdate={handleUserUpdate} />

                    {/* Avatar Upload */}
                    <AvatarUpload
                        user={user}
                        onUpdate={handleUserUpdate}
                        onUploadStateChange={handleUploadStateChange}
                        disabled={isUploadBlocked}
                    />

                    {/* Profile Information */}
                    <ProfileForm
                        user={user}
                        onUpdate={handleUserUpdate}
                        disabled={isUploadBlocked}
                    />

                    {/* Change Password */}
                    <PasswordChange disabled={isUploadBlocked} />

                    {/* Delete Account */}
                    <DeleteAccount disabled={isUploadBlocked} />

                    {/* Account Information */}
                    <AccountInfo user={user} disabled={isUploadBlocked} />
                </div>
            </main>
        </div>
    );
}
