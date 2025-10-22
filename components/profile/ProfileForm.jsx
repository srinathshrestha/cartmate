import { CheckCircle, Mail, User, AlertCircle } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ProfileForm Component
 * Handles user profile information editing (username and email).
 * Keeps file size under 150 lines by focusing on core functionality.
 */
export default function ProfileForm({ user, onUpdate, disabled = false }) {
    const [isSaving, setIsSaving] = useState(false);
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
    });

    // Handle profile update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        // Check if email is being changed
        const isEmailChange = formData.email !== (user?.email || "");

        if (isEmailChange) {
            // Start email verification process
            setPendingEmail(formData.email);
            await handleSendVerification();
            return;
        }

        // No email change, update directly
        setIsSaving(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to update profile");
                return;
            }

            onUpdate(data.user);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle sending verification email
    const handleSendVerification = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: pendingEmail,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to send verification email");
                return;
            }

            setShowVerificationDialog(true);
            toast.success("Verification code sent to your new email!");
        } catch (error) {
            console.error("Send verification error:", error);
            toast.error("Failed to send verification email");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle OTP verification
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    code: verificationCode,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Invalid verification code");
                return;
            }

            // Update user data after successful verification
            onUpdate({ ...user, isEmailVerified: true, email: pendingEmail, pendingEmail: null });
            setShowVerificationDialog(false);
            setVerificationCode("");
            setPendingEmail("");
            toast.success("Email verified successfully!");
        } catch (error) {
            console.error("Verify email error:", error);
            toast.error("Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                    Update your username and email address
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {/* Username field */}
                    <div className="space-y-2">
                        <Label htmlFor="username">
                            <User className="h-4 w-4 inline mr-2" />
                            Username
                        </Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            required
                                disabled={isSaving || disabled}
                        />
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                            Email
                            {user?.isEmailVerified && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                {user?.pendingEmail && (
                                    <div className="flex items-center gap-1 text-orange-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-xs">Verification pending</span>
                                    </div>
                            )}
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                                disabled={isSaving || disabled}
                                className={user?.pendingEmail ? "border-orange-300" : ""}
                        />
                            {user?.pendingEmail && (
                                <p className="text-xs text-orange-600">
                                    A verification code has been sent to {user.pendingEmail}. Please verify to complete the email change.
                                </p>
                            )}
                            {formData.email !== (user?.email || "") && formData.email !== user?.pendingEmail && (
                                <p className="text-xs text-blue-600">
                                    Changing email will require verification before the change takes effect.
                                </p>
                            )}
                    </div>

                        <Button type="submit" disabled={isSaving || disabled}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>

            {/* Email Verification Dialog */}
            <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
                <DialogContent>
                    <form onSubmit={handleVerifyEmail}>
                        <DialogHeader>
                            <DialogTitle>Verify Your New Email</DialogTitle>
                            <DialogDescription>
                                Enter the 6-digit code sent to {pendingEmail}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                                required
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendVerification}
                                disabled={isSaving}
                            >
                                {isSaving ? "Sending..." : "Resend Code"}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isVerifying || verificationCode.length !== 6}
                            >
                                {isVerifying ? "Verifying..." : "Verify Email"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
