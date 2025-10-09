"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChatPanel from "@/components/list/ChatPanel";
import ItemsList from "@/components/list/ItemsList";
import ListHeader from "@/components/list/ListHeader";
import MembersPanel from "@/components/list/MembersPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

/**
 * List collaboration page with responsive 3-panel layout.
 * Mobile: Floating panels with overlay
 * Desktop: Side-by-side collapsible panels
 */
export default function ListPage() {
    const router = useRouter();
    const params = useParams();
    const listId = params.listId;

    const [list, setList] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Panel state - on mobile, panels are overlays
    const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
    const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

    // Item state (managed by ItemsList component)
    const [isAddingItem, setIsAddingItem] = useState(false);

    // Fetch list data
    useEffect(() => {
        fetchListData();
    }, [listId]);

    const fetchListData = async () => {
        try {
            const userRes = await fetch("/api/auth/me");
            if (!userRes.ok) {
                router.push("/login");
                return;
            }
            const userData = await userRes.json();
            setUser(userData.user);

            const listRes = await fetch(`/api/lists/${listId}`);
            if (!listRes.ok) {
                toast.error("List not found");
                router.push("/dashboard");
                return;
            }
            const listData = await listRes.json();
            setList(listData.list);
        } catch (error) {
            console.error("Error fetching list:", error);
            toast.error("Failed to load list");
        } finally {
            setIsLoading(false);
        }
    };

    // Get current member info
    const currentMember = list?.members?.find(
        (member) => member.userId === user?.id,
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading list...</p>
            </div>
        );
    }

    if (!list) {
        return null;
    }
    const canEdit =
        currentMember?.role === "CREATOR" || currentMember?.role === "EDITOR";
    const isCreator = currentMember?.role === "CREATOR";

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <ListHeader
                list={list}
                isMembersPanelOpen={isMembersPanelOpen}
                isChatPanelOpen={isChatPanelOpen}
                setIsMembersPanelOpen={setIsMembersPanelOpen}
                setIsChatPanelOpen={setIsChatPanelOpen}
                isCreator={isCreator}
                currentMember={currentMember}
            />

            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Desktop: Left Panel - Members (togglable) */}
                {isMembersPanelOpen && (
                    <MembersPanel
                        list={list}
                        setList={setList}
                        isMembersPanelOpen={isMembersPanelOpen}
                        setIsMembersPanelOpen={setIsMembersPanelOpen}
                        currentMember={currentMember}
                    />
                )}

                {/* Center Panel: Items */}
                <ItemsList
                    list={list}
                    setList={setList}
                    canEdit={canEdit}
                    isAddingItem={isAddingItem}
                    setIsAddingItem={setIsAddingItem}
                />

                {/* Desktop: Right Panel - Chat (togglable) */}
                {isChatPanelOpen && (
                    <ChatPanel
                        list={list}
                        setList={setList}
                        isChatPanelOpen={isChatPanelOpen}
                        setIsChatPanelOpen={setIsChatPanelOpen}
                    />
                )}

                {/* Mobile: Members Panel Overlay */}
                {isMembersPanelOpen && (
                    <MembersPanel
                        list={list}
                        setList={setList}
                        isMembersPanelOpen={isMembersPanelOpen}
                        setIsMembersPanelOpen={setIsMembersPanelOpen}
                        currentMember={currentMember}
                        isMobile={true}
                    />
                )}

                {/* Mobile: Chat Panel Overlay */}
                {isChatPanelOpen && (
                    <ChatPanel
                        list={list}
                        setList={setList}
                        isChatPanelOpen={isChatPanelOpen}
                        setIsChatPanelOpen={setIsChatPanelOpen}
                        isMobile={true}
                    />
                )}
            </div>
        </div>
    );
}
