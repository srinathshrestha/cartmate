"use client";

import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import InviteManagement from "@/components/list-settings/InviteManagement";
import MemberManagement from "@/components/list-settings/MemberManagement";
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
 * List settings page (Creator only).
 * Manage members, create/delete invites, configure list settings.
 */
export default function ListSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const listId = params.listId;

    const [list, setList] = useState(null);
    const [user, setUser] = useState(null);
    const [invites, setInvites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Invite creation state
    const [isCreatingInvite, setIsCreatingInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        expiresInHours: 24,
        maxUses: null,
    });

    // Fetch data
    useEffect(() => {
        fetchData();
    }, [listId]);

    const fetchData = async () => {
        try {
            // Fetch current user
            const userRes = await fetch("/api/auth/me");
            if (!userRes.ok) {
                router.push("/login");
                return;
            }
            const userData = await userRes.json();
            setUser(userData.user);

            // Fetch list details
            const listRes = await fetch(`/api/lists/${listId}`);
            if (!listRes.ok) {
                toast.error("List not found");
                router.push("/dashboard");
                return;
            }
            const listData = await listRes.json();

            // Check if user is creator
            const currentMember = listData.list.members.find(
                (m) => m.user.id === userData.user.id,
            );
            if (currentMember?.role !== "CREATOR") {
                toast.error("Only the creator can access settings");
                router.push(`/lists/${listId}`);
                return;
            }

            setList(listData.list);

            // Fetch active invites
            const invitesRes = await fetch(`/api/lists/${listId}/invites`);
            if (invitesRes.ok) {
                const invitesData = await invitesRes.json();
                setInvites(invitesData.invites);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

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

    // Delete invite
    const handleDeleteInvite = async (inviteId) => {
        if (!confirm("Delete this invite link permanently?")) return;

        try {
            const response = await fetch(`/api/lists/${listId}/invites/${inviteId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                toast.error("Failed to delete invite");
                return;
            }

            // Remove from local state
            setInvites(invites.filter((inv) => inv.id !== inviteId));
            toast.success("Invite link deleted");
        } catch (error) {
            console.error("Delete invite error:", error);
            toast.error("An error occurred");
        }
    };

    // Remove member
    const handleRemoveMember = async (memberId, username) => {
        if (!confirm(`Remove ${username} from this list?`)) return;

        try {
            const response = await fetch(`/api/lists/${listId}/members/${memberId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                toast.error("Failed to remove member");
                return;
            }

            // Update local state
            setList({
                ...list,
                members: list.members.filter((m) => m.id !== memberId),
            });

            toast.success(`${username} removed from list`);
        } catch (error) {
            console.error("Remove member error:", error);
            toast.error("An error occurred");
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Check if invite is expired
    const isExpired = (expiresAt) => {
        return new Date(expiresAt) < new Date();
    };

    // Check if invite is at capacity
    const isAtCapacity = (invite) => {
        return invite.maxUses && invite.usedCount >= invite.maxUses;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading settings...</p>
            </div>
        );
    }

    if (!list) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header - Mobile optimized */}
            <header className="border-b border-border bg-card/50">
                <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Link href={`/lists/${listId}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <h1 className="text-lg sm:text-2xl font-bold truncate">
                            List Settings
                        </h1>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
                <div className="space-y-6">
                    {/* List Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>List Information</CardTitle>
                            <CardDescription>Basic details about your list</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">List name</span>
                                <span className="font-medium">{list.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total members
                                </span>
                                <span className="font-medium">{list.members.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total items
                                </span>
                                <span className="font-medium">{list.items.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Created</span>
                                <span className="font-medium">
                                    {formatDate(list.createdAt)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Members Management */}
                    <MemberManagement list={list} setList={setList} />

                    {/* Invite Management */}
                    <InviteManagement
                        listId={listId}
                        invites={invites}
                        setInvites={setInvites}
                    />
                </div>
            </main>
        </div>
    );
}
