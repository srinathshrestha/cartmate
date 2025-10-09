import { Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * MemberManagement Component
 * Displays and manages list members (remove members).
 * Keeps file size under 150 lines by focusing on member management logic.
 */
export default function MemberManagement({ list, setList }) {
    // Remove member
    const handleRemoveMember = async (memberId, username) => {
        if (!confirm(`Remove ${username} from this list?`)) return;

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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({list.members.length})
                </CardTitle>
                <CardDescription>Manage who has access to this list</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {list.members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="font-medium">
                                        {member.user.username[0].toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{member.user.username}</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {member.role.toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            {member.role !== "CREATOR" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        handleRemoveMember(member.id, member.user.username)
                                    }
                                    className="text-destructive hover:text-destructive flex-shrink-0"
                                >
                                    <Trash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Remove</span>
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
