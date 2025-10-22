import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * EmailVerification Component
 * Handles email verification with OTP dialog.
 * Keeps file size under 150 lines by focusing on verification logic.
 */
export default function EmailVerification({ user, onUpdate }) {
    const [otpCode, setOtpCode] = useState("");
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [showOTPDialog, setShowOTPDialog] = useState(false);

    // Send OTP for email verification
    const handleSendOTP = async () => {
        setIsSendingOTP(true);
        try {
            // Use pendingEmail if available, otherwise use current email
            const emailToVerify = user.pendingEmail || user.email;

            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailToVerify, userId: user.id }),
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error || "Failed to send verification code");
                return;
            }

            setShowOTPDialog(true);
            toast.success("Verification code sent to your email!");
        } catch (error) {
            console.error("Send OTP error:", error);
            toast.error("Failed to send verification code");
        } finally {
            setIsSendingOTP(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsVerifyingOTP(true);

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, code: otpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Invalid verification code");
                return;
            }

            onUpdate({
                ...user,
                isEmailVerified: true,
                email: user.pendingEmail || user.email,
                pendingEmail: null,
                emailVerificationSentAt: null
            });
            setShowOTPDialog(false);
            setOtpCode("");
            toast.success("Email verified successfully!");
        } catch (error) {
            console.error("Verify OTP error:", error);
            toast.error("Verification failed");
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    // Only show if email is not verified
    if (user?.isEmailVerified) {
        return null;
    }

    return (
        <>
            {/* Email Verification Alert */}
            <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                                Email Not Verified
                            </h3>
                            <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                                Please verify your email to access all features
                            </p>
                            <Button
                                size="sm"
                                onClick={handleSendOTP}
                                disabled={isSendingOTP}
                                className="mt-3"
                            >
                                {isSendingOTP ? "Sending..." : "Verify Email"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* OTP Verification Dialog */}
            <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
                <DialogContent>
                    <form onSubmit={handleVerifyOTP}>
                        <DialogHeader>
                            <DialogTitle>Verify Your Email</DialogTitle>
                            <DialogDescription>
                                Enter the 6-digit code sent to {user?.email}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="000000"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
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
                                onClick={handleSendOTP}
                                disabled={isSendingOTP}
                            >
                                {isSendingOTP ? "Sending..." : "Resend Code"}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isVerifyingOTP || otpCode.length !== 6}
                            >
                                {isVerifyingOTP ? "Verifying..." : "Verify"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
