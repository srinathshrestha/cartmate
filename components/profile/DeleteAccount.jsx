import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
 * DeleteAccount Component
 * Handles account deletion with password confirmation.
 * Keeps file size under 150 lines by focusing on delete logic.
 */
export default function DeleteAccount() {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Delete account
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setIsDeleting(true);

        try {
            const response = await fetch("/api/profile", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: deleteConfirmPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to delete account");
                return;
            }

            toast.success("Account deleted successfully");
            router.push("/");
        } catch (error) {
            console.error("Delete account error:", error);
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* Delete Account Card */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <form onSubmit={handleDeleteAccount}>
                        <DialogHeader>
                            <DialogTitle className="text-destructive">
                                Delete Account?
                            </DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. All your data including lists,
                                messages, and memberships will be permanently deleted.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="confirmPassword">Confirm Your Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={deleteConfirmPassword}
                                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="mt-2"
                                required
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setDeleteConfirmPassword("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
