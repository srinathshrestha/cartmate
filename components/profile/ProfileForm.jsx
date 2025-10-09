import { CheckCircle, Mail, User } from "lucide-react";
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
 * ProfileForm Component
 * Handles user profile information editing (username and email).
 * Keeps file size under 150 lines by focusing on core functionality.
 */
export default function ProfileForm({ user, onUpdate }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
    });

    // Handle profile update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
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

    return (
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
                            disabled={isSaving}
                        />
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email
                            {user?.isEmailVerified && (
                                <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" />
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
                            disabled={isSaving}
                        />
                    </div>

                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
