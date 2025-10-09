import { Camera } from "lucide-react";
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
import { useUploadThing } from "@/lib/uploadthing";

/**
 * AvatarUpload Component
 * Handles user avatar image upload functionality.
 * Keeps file size under 150 lines by focusing on upload logic.
 */
export default function AvatarUpload({ user, onUpdate }) {
    const [isUploading, setIsUploading] = useState(false);
    const { startUpload } = useUploadThing("avatarUploader");

    // Handle avatar upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
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
        try {
            const uploadResult = await startUpload([file]);

            if (!uploadResult || uploadResult.length === 0) {
                throw new Error("Upload failed");
            }

            const uploadedUrl = uploadResult[0].url;

            // Update user profile with new avatar URL
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: uploadedUrl }),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            const data = await response.json();
            onUpdate(data.user);
            toast.success("Avatar uploaded successfully!");
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast.error("Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    };

    return (
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
                            disabled={isUploading}
                        />
                        <label htmlFor="avatar-upload">
                            <Button variant="outline" disabled={isUploading} asChild>
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
    );
}
