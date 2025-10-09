import { Clock, Copy, Link2, Plus, Trash2, UserCheck, XCircle } from "lucide-react";
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
 * InviteManagement Component
 * Handles invite creation, display, and management.
 * Keeps file size under 150 lines by focusing on invite logic.
 */
export default function InviteManagement({ listId, invites, setInvites }) {
    const [isCreatingInvite, setIsCreatingInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        expiresInHours: 24,
        maxUses: null,
    });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [inviteToDelete, setInviteToDelete] = useState(null);

    // Create invite
    const handleCreateInvite = async (e) => {
        e.preventDefault();
        setIsCreatingInvite(true);

        try {
            const response = await fetch(`/api/lists/${listId}/invites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(inviteForm),
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error || "Failed to create invite");
                return;
            }

            const data = await response.json();
            setInvites([data.invite, ...invites]);
            toast.success("Invite link created!");

            // Reset form
            setInviteForm({
                expiresInHours: 24,
                maxUses: null,
            });
        } catch (error) {
            console.error("Create invite error:", error);
            toast.error("An error occurred");
        } finally {
            setIsCreatingInvite(false);
        }
    };

    // Copy invite link
    const handleCopyInvite = (token) => {
        const inviteUrl = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(inviteUrl);
        toast.success("Invite link copied to clipboard!");
    };

    // Deactivate invite
    const handleDeactivateInvite = async (inviteId) => {
        if (!confirm("Deactivate this invite link?")) return;

        try {
            const response = await fetch(`/api/lists/${listId}/invites/${inviteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: false }),
            });

            if (!response.ok) {
                toast.error("Failed to deactivate invite");
                return;
            }

            // Update local state
            setInvites(
                invites.map((inv) =>
                    inv.id === inviteId ? { ...inv, isActive: false } : inv,
                ),
            );

            toast.success("Invite link deactivated");
        } catch (error) {
            console.error("Deactivate invite error:", error);
            toast.error("An error occurred");
        }
    };

    // Delete invite - opens confirmation dialog
    const handleDeleteInvite = (inviteId) => {
        setInviteToDelete(inviteId);
        setDeleteConfirmOpen(true);
    };

    // Confirm delete invite
    const confirmDeleteInvite = async () => {
        if (!inviteToDelete) return;

        try {
            const response = await fetch(`/api/lists/${listId}/invites/${inviteToDelete}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                toast.error("Failed to delete invite");
                return;
            }

            // Remove from local state
            setInvites(invites.filter((inv) => inv.id !== inviteToDelete));
            toast.success("Invite link deleted");
        } catch (error) {
            console.error("Delete invite error:", error);
            toast.error("An error occurred");
        } finally {
            setDeleteConfirmOpen(false);
            setInviteToDelete(null);
        }
    };

    // Check if invite is expired
    const isExpired = (expiresAt) => {
        return new Date(expiresAt) < new Date();
    };

    // Check if invite is at capacity
    const isAtCapacity = (invite) => {
        return invite.maxUses && invite.usedCount >= invite.maxUses;
    };

    return (
        <>
            {/* Existing Invites */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Active Invite Links
                    </CardTitle>
                    <CardDescription>
                        Manage existing invite links for this list
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {invites.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No active invites. Create one below!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {invites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className={`p-3 border rounded-lg ${!invite.isActive ||
                                            isExpired(invite.expiresAt) ||
                                            isAtCapacity(invite)
                                            ? "bg-muted/50 opacity-60"
                                            : "bg-background"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium">
                                                    {invite.maxUses
                                                        ? `${invite.usedCount}/${invite.maxUses} used`
                                                        : `${invite.usedCount} used`}
                                                </span>
                                                {!invite.isActive && (
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                        Deactivated
                                                    </span>
                                                )}
                                                {isExpired(invite.expiresAt) && (
                                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                        Expired
                                                    </span>
                                                )}
                                                {isAtCapacity(invite) && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        Full
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <p>
                                                    Expires: {new Date(invite.expiresAt).toLocaleString()}
                                                </p>
                                                <p>Created by: {invite.createdBy?.username || 'Unknown'}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyInvite(invite.token)}
                                                disabled={
                                                    !invite.isActive || isExpired(invite.expiresAt)
                                                }
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeactivateInvite(invite.id)}
                                                disabled={!invite.isActive}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteInvite(invite.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Invite */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create Invite Link
                    </CardTitle>
                    <CardDescription>
                        Generate a shareable link to invite new members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateInvite} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Expiry time */}
                            <div className="space-y-2">
                                <Label htmlFor="expiresInHours">
                                    <Clock className="h-4 w-4 inline mr-2" />
                                    Expires in (hours)
                                </Label>
                                <Input
                                    id="expiresInHours"
                                    type="number"
                                    min="1"
                                    max="168"
                                    value={inviteForm.expiresInHours}
                                    onChange={(e) =>
                                        setInviteForm({
                                            ...inviteForm,
                                            expiresInHours: Number.parseInt(e.target.value),
                                        })
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    1-168 hours (7 days max)
                                </p>
                            </div>

                            {/* Max uses */}
                            <div className="space-y-2">
                                <Label htmlFor="maxUses">
                                    <UserCheck className="h-4 w-4 inline mr-2" />
                                    Max uses (optional)
                                </Label>
                                <Input
                                    id="maxUses"
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                    value={inviteForm.maxUses || ""}
                                    onChange={(e) =>
                                        setInviteForm({
                                            ...inviteForm,
                                            maxUses: e.target.value
                                                ? Number.parseInt(e.target.value)
                                                : null,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    First-come first-serve
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isCreatingInvite}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {isCreatingInvite ? "Creating..." : "Create Invite Link"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Invite Link</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this invite link permanently?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setDeleteConfirmOpen(false);
                                setInviteToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteInvite}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
