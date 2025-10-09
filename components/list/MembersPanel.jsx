import { Crown, Eye, Shield, User, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * MembersPanel Component
 * Displays list members with their roles and handles member removal.
 * Keeps file size under 150 lines by focusing on member display logic.
 */
export default function MembersPanel({
    list,
    setList,
    isMembersPanelOpen,
    setIsMembersPanelOpen,
    currentMember,
    isMobile = false,
}) {
    // Handle removing member (creator only)
    const handleRemoveMember = async (memberId) => {
        if (currentMember.role !== "CREATOR") return;

        if (!confirm("Remove this member from the list?")) return;

        try {
            const response = await fetch(
                `/api/lists/${list.id}/members/${memberId}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                toast.error("Failed to remove member");
                return;
            }

            setList({
                ...list,
                members: list.members.filter((member) => member.id !== memberId),
            });
            toast.success("Member removed");
        } catch (error) {
            console.error("Remove member error:", error);
            toast.error("Failed to remove member");
        }
    };

    // Get role icon and color
    const getRoleIcon = (role) => {
        switch (role) {
            case "CREATOR":
                return <Crown className="h-4 w-4 text-yellow-600" />;
            case "EDITOR":
                return <Shield className="h-4 w-4 text-blue-600" />;
            case "VIEWER":
                return <Eye className="h-4 w-4 text-gray-600" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case "CREATOR":
                return "Creator";
            case "EDITOR":
                return "Editor";
            case "VIEWER":
                return "Viewer";
            default:
                return "Member";
        }
    };

    const panelContent = (
        <>
            <div className="p-4">
                <h2 className="font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({list.members.length})
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {list.members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                        >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                {member.user.avatarUrl ? (
                                    <img
                                        src={member.user.avatarUrl}
                                        alt={member.user.username}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="font-medium">
                                        {member.user.username[0].toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">
                                        {member.user.username}
                                    </span>
                                    {getRoleIcon(member.role)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {getRoleLabel(member.role)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Remove member button (creator only, not for self) */}
                            {currentMember?.role === "CREATOR" &&
                                member.userId !== currentMember.userId && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <div className="md:hidden fixed inset-0 z-50 bg-background">
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Members
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMembersPanelOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">{panelContent}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden md:flex md:w-64 overflow-y-auto bg-card/50 flex-col">
            {panelContent}
        </div>
    );
}
