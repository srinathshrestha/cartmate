import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * ItemsList Component
 * Handles the shopping list items display, adding, toggling, and deleting.
 * Keeps file size under 150 lines by focusing on item management logic.
 */
export default function ItemsList({
    list,
    setList,
    canEdit,
    isAddingItem,
    setIsAddingItem,
}) {
    const [newItemName, setNewItemName] = useState("");
    const listId = list.id;

    // Handle adding new item
    const handleAddItem = async () => {
        if (!newItemName.trim()) return;

        setIsAddingItem(true);
        try {
            const response = await fetch(`/api/lists/${listId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newItemName.trim(), quantity: "1" }),
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error || "Failed to add item");
                return;
            }

            const data = await response.json();
            setList({
                ...list,
                items: [...list.items, data.item],
            });
            setNewItemName("");
        } catch (error) {
            console.error("Add item error:", error);
            toast.error("Failed to add item");
        } finally {
            setIsAddingItem(false);
        }
    };

    // Handle toggling item completion
    const handleToggleItem = async (itemId, currentStatus) => {
        try {
            const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: !currentStatus }),
            });

            if (!response.ok) {
                toast.error("Failed to update item");
                return;
            }

            setList({
                ...list,
                items: list.items.map((item) =>
                    item.id === itemId ? { ...item, done: !currentStatus } : item,
                ),
            });
        } catch (error) {
            console.error("Toggle item error:", error);
            toast.error("An error occurred");
        }
    };

    // Handle deleting item
    const handleDeleteItem = async (itemId) => {
        if (!confirm("Delete this item?")) return;

        try {
            const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                toast.error("Failed to delete item");
                return;
            }

            setList({
                ...list,
                items: list.items.filter((item) => item.id !== itemId),
            });
            toast.success("Item deleted");
        } catch (error) {
            console.error("Delete item error:", error);
            toast.error("Failed to delete item");
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Add item section */}
            {canEdit && (
                <div className="p-3 sm:p-4 border-b border-border">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add item..."
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                            disabled={isAddingItem}
                        />
                        <Button
                            onClick={handleAddItem}
                            disabled={isAddingItem || !newItemName.trim()}
                            size="icon"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {list.items.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <CardTitle className="mb-2">No items yet</CardTitle>
                            <p className="text-muted-foreground">
                                {canEdit
                                    ? "Add your first item above!"
                                    : "No items in this list yet."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {list.items.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-2 sm:gap-3 p-3 rounded-lg border border-border bg-card ${item.done ? "opacity-60" : ""
                                    }`}
                            >
                                {canEdit && (
                                    <button
                                        onClick={() => handleToggleItem(item.id, item.done)}
                                        className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.done
                                                ? "bg-primary border-primary"
                                                : "border-muted-foreground"
                                            }`}
                                    >
                                        {item.done && (
                                            <Check className="h-4 w-4 text-primary-foreground" />
                                        )}
                                    </button>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm sm:text-base ${item.done ? "line-through" : ""}`}
                                    >
                                        {item.name}
                                    </p>
                                    {item.quantity !== "1" && (
                                        <p className="text-xs text-muted-foreground">
                                            Quantity: {item.quantity}
                                        </p>
                                    )}
                                    {item.notes && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item.notes}
                                        </p>
                                    )}
                                </div>
                                {canEdit && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
