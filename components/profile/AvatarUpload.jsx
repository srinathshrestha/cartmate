import { Camera, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useUploadThing } from "@/lib/uploadthing";

/**
 * AvatarUpload Component
 * Handles user avatar image upload functionality.
 * Keeps file size under 150 lines by focusing on upload logic.
 */
export default function AvatarUpload({ user, onUpdate, onUploadStateChange, disabled = false }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const { startUpload } = useUploadThing("avatarUploader", {
        onClientUploadComplete: (res) => {
            console.log("AvatarUpload: Client upload complete callback", res);
            setIsBlocked(false);
            onUploadStateChange?.(false);
        },
        onUploadError: (error) => {
            console.error("AvatarUpload: Upload error callback", error);
            setIsBlocked(false);
            onUploadStateChange?.(false);
        },
        onUploadBegin: (fileName) => {
            console.log("AvatarUpload: Upload beginning for", fileName);
            setIsBlocked(true);
            onUploadStateChange?.(true);
        },
    });

    // Prevent navigation during upload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isBlocked) {
                e.preventDefault();
                e.returnValue = "Upload in progress. Are you sure you want to leave?";
                return e.returnValue;
            }
        };

        if (isBlocked) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isBlocked]);

    // Handle avatar upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        console.log("AvatarUpload: File selected", file?.name, file?.size);
        if (!file) return;

        // Validate file size (1MB)
        if (file.size > 1024 * 1024) {
            toast.error("File size must be less than 1MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("File must be an image");
            return;
        }

        setIsUploading(true);
        console.log("AvatarUpload: Starting upload...");

        try {
            console.log("AvatarUpload: Calling startUpload with file:", file.name);
            const uploadResult = await startUpload([file]);
            console.log("AvatarUpload: Upload result:", uploadResult);

            if (!uploadResult || uploadResult.length === 0) {
                console.error("AvatarUpload: No upload result received");
                throw new Error("Upload failed - no result");
            }

            const uploadedUrl = uploadResult[0].url;
            console.log("AvatarUpload: File uploaded to URL:", uploadedUrl);

            // Update user profile with new avatar URL
            console.log("AvatarUpload: Updating profile with new avatar URL");
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: uploadedUrl }),
            });

            if (!response.ok) {
                console.error("AvatarUpload: Profile update failed:", response.status);
                throw new Error("Failed to update profile");
            }

            const data = await response.json();
            console.log("AvatarUpload: Profile updated successfully");
            onUpdate(data.user);
            toast.success("Avatar uploaded successfully!");
        } catch (error) {
            console.error("AvatarUpload: Error details:", error);
            console.error("AvatarUpload: Error message:", error.message);
            console.error("AvatarUpload: Error stack:", error.stack);
            toast.error(`Failed to upload avatar: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Upload a profile picture (max 1MB)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar preview */}
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold overflow-hidden flex-shrink-0">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                            ) : (
                                <span>{user?.username[0]?.toUpperCase()}</span>
                            )}
                        </div>

                        {/* Upload button */}
                        <div className="flex-1 text-center sm:text-left">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                                id="avatar-upload"
                                disabled={isUploading || disabled}
                            />
                            <label htmlFor="avatar-upload">
                                <Button variant="outline" disabled={isUploading || disabled} asChild>
                                    <span className="cursor-pointer">
                                        <Camera className="h-4 w-4 mr-2" />
                                        {isUploading ? "Uploading..." : "Upload Photo"}
                                    </span>
                                </Button>
                            </label>
                            <p className="text-xs text-muted-foreground mt-2">
                                Max file size: 1MB. JPG, PNG, or GIF.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Lock Overlay */}
            {isBlocked && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-background p-8 rounded-lg shadow-lg border max-w-sm mx-4 text-center">
                        <Upload className="h-12 w-12 mx-auto text-primary mb-4 animate-pulse" />
                        <h3 className="text-lg font-semibold mb-2">Uploading Avatar</h3>
                        <p className="text-muted-foreground mb-4">
                            Please wait while your avatar is being uploaded. Do not close this page.
                        </p>
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
