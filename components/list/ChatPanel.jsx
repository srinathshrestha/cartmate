import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import MentionInput from "@/components/chat/MentionInput";
import { Button } from "@/components/ui/button";

/**
 * ChatPanel Component
 * Handles the chat/messaging functionality for the list.
 * Keeps file size under 150 lines by focusing on chat logic.
 */
export default function ChatPanel({
    list,
    setList,
    isChatPanelOpen,
    setIsChatPanelOpen,
    isMobile = false,
}) {
    const [newMessage, setNewMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    // Handle sending message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSendingMessage(true);
        try {
            const response = await fetch(`/api/lists/${list.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: newMessage.trim(),
                    mentionsUsers: [],
                    mentionsItems: [],
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error || "Failed to send message");
                return;
            }

            const responseData = await response.json();
            setList({
                ...list,
                messages: [responseData.data, ...list.messages],
            });

            setNewMessage("");
        } catch (error) {
            console.error("Send message error:", error);
            toast.error("An error occurred");
        } finally {
            setIsSendingMessage(false);
        }
    };

    const panelContent = (
        <>
            <div className="p-4">
                <h2 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat
                </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {list.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No messages yet. Start the conversation!
                    </p>
                ) : (
                    list.messages.map((message) => (
                        <div key={message.id} className="flex gap-2">
                            {/* Avatar */}
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0 overflow-hidden">
                                {message.sender.avatarUrl ? (
                                    <img
                                        src={message.sender.avatarUrl}
                                        alt={message.sender.username}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <span>{message.sender.username[0].toUpperCase()}</span>
                                )}
                            </div>
                            {/* Message content */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-medium">
                                        {message.sender.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message input with @-mention support */}
            <div className="p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <MentionInput
                        placeholder="Type a message... (use @ to mention)"
                        value={newMessage}
                        onChange={setNewMessage}
                        disabled={isSendingMessage}
                        listId={list.id}
                    />
                    <Button type="submit" size="icon" disabled={isSendingMessage}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Chat
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsChatPanelOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 flex flex-col min-h-0">{panelContent}</div>
            </div>
        );
    }

    return (
        <div className="hidden md:flex md:w-96 flex-col bg-card/50">
            {panelContent}
        </div>
    );
}
