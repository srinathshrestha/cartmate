import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * PasswordChange Component
 * Handles password change functionality.
 * Keeps file size under 150 lines by focusing on password logic.
 */
export default function PasswordChange({ disabled = false }) {
    const [isSaving, setIsSaving] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Handle password change
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch("/api/profile/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to change password");
                return;
            }

            // Clear password fields
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            toast.success("Password changed successfully!");
        } catch (error) {
            console.error("Change password error:", error);
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    Update your password to keep your account secure
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Current password */}
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                            <Lock className="h-4 w-4 inline mr-2" />
                            Current Password
                        </Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                                setPasswordData({
                                    ...passwordData,
                                    currentPassword: e.target.value,
                                })
                            }
                            required
                            disabled={isSaving || disabled}
                        />
                    </div>

                    {/* New password */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                                setPasswordData({
                                    ...passwordData,
                                    newPassword: e.target.value,
                                })
                            }
                            required
                            disabled={isSaving || disabled}
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum 8 characters with letters and numbers
                        </p>
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                                setPasswordData({
                                    ...passwordData,
                                    confirmPassword: e.target.value,
                                })
                            }
                            required
                            disabled={isSaving || disabled}
                        />
                    </div>

                    <Button type="submit" disabled={isSaving || disabled}>
                        {isSaving ? "Changing..." : "Change Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
