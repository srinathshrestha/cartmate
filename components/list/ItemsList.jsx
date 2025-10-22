import { Check, Plus, Trash2, Clock, User, Tag, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ItemDetailDrawer from "./ItemDetailDrawer";

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
    const [newItemQuantity, setNewItemQuantity] = useState("1");
    const [newItemUnit, setNewItemUnit] = useState("PIECE");
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const listId = list.id;

    // Handle adding new item
    const handleAddItem = async () => {
        if (!newItemName.trim()) return;

        setIsAddingItem(true);
        try {
            const response = await fetch(`/api/lists/${listId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newItemName.trim(),
                    quantity: newItemQuantity,
                    unit: newItemUnit,
                }),
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
            setNewItemQuantity("1");
            setNewItemUnit("PIECE");
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
                body: JSON.stringify({
                    status: currentStatus ? "TODO" : "PURCHASED",
                    done: !currentStatus // Keep for backward compatibility
                }),
            });

            if (!response.ok) {
                toast.error("Failed to update item");
                return;
            }

            setList({
                ...list,
                items: list.items.map((item) =>
                    item.id === itemId ? {
                        ...item,
                        status: currentStatus ? "TODO" : "PURCHASED",
                        done: !currentStatus // Keep for backward compatibility
                    } : item,
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

    // Handle opening item detail drawer
    const handleItemClick = (item) => {
        if (canEdit) {
            setSelectedItem(item);
            setIsDrawerOpen(true);
        }
    };

    // Handle item update from drawer
    const handleItemUpdate = (updatedItem) => {
        setList({
            ...list,
            items: list.items.map((item) =>
                item.id === updatedItem.id ? updatedItem : item,
            ),
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Add item section */}
            {canEdit && (
                <div className="p-3 sm:p-4 border-b border-border">
                    <div className="space-y-3">
                        <Input
                            placeholder="Add item..."
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                            disabled={isAddingItem}
                        />
                        <div className="flex gap-2">
                            <Input
                                placeholder="Quantity"
                                value={newItemQuantity}
                                onChange={(e) => setNewItemQuantity(e.target.value)}
                                disabled={isAddingItem}
                                className="flex-1"
                            />
                            <select
                                value={newItemUnit}
                                onChange={(e) => setNewItemUnit(e.target.value)}
                                disabled={isAddingItem}
                                className="px-3 py-2 border border-input bg-background rounded-md text-sm flex-1"
                            >
                                <option value="PIECE">Piece</option>
                                <option value="PACK">Pack</option>
                                <option value="DOZEN">Dozen</option>
                                <option value="G">Grams</option>
                                <option value="KG">Kilograms</option>
                                <option value="OZ">Ounces</option>
                                <option value="ML">Milliliters</option>
                                <option value="L">Liters</option>
                                <option value="CUSTOM">Custom</option>
                            </select>
                            <Button
                                onClick={handleAddItem}
                                disabled={isAddingItem || !newItemName.trim()}
                                size="icon"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
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
                                className={`flex items-start gap-2 sm:gap-3 p-3 rounded-lg border border-border bg-card ${item.status === "PURCHASED" ? "opacity-60" : ""
                                    } ${canEdit ? "cursor-pointer hover:bg-accent/50" : ""}`}
                                onClick={() => handleItemClick(item)}
                            >
                                {canEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleItem(item.id, item.status === "PURCHASED");
                                        }}
                                        className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${item.status === "PURCHASED"
                                                ? "bg-primary border-primary"
                                                : "border-muted-foreground"
                                            }`}
                                    >
                                        {item.status === "PURCHASED" && (
                                            <Check className="h-4 w-4 text-primary-foreground" />
                                        )}
                                    </button>
                                )}
                                <div className="flex-1 min-w-0">
                                    {/* Priority badge */}
                                    {item.priority !== "MEDIUM" && (
                                        <div className="flex items-center gap-1 mb-1">
                                            <AlertTriangle className={`h-3 w-3 ${item.priority === "URGENT" ? "text-red-500" :
                                                item.priority === "HIGH" ? "text-orange-500" :
                                                    item.priority === "LOW" ? "text-blue-500" : "text-gray-500"
                                                }`} />
                                            <span className={`text-xs font-medium ${item.priority === "URGENT" ? "text-red-500" :
                                                item.priority === "HIGH" ? "text-orange-500" :
                                                    item.priority === "LOW" ? "text-blue-500" : "text-gray-500"
                                                }`}>
                                                {item.priority}
                                            </span>
                                        </div>
                                    )}

                                    <p className={`text-sm sm:text-base ${item.status === "PURCHASED" ? "line-through" : ""}`}>
                                        {item.name}
                                    </p>

                                    {/* Quantity and unit */}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <span>{item.quantity}</span>
                                        <span>{item.unit === "CUSTOM" ? item.customUnit : item.unit}</span>
                                    </div>

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            {item.tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
                                                >
                                                    <Tag className="h-2 w-2" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {item.tags.length > 3 && (
                                                <span className="text-xs text-muted-foreground">
                                                    +{item.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Due date */}
                                    {item.dueAt && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                Due: {new Date(item.dueAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Assignee */}
                                    {item.assignedTo && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                {item.assignedTo.username}
                                            </span>
                                        </div>
                                    )}

                                    {/* Notes */}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteItem(item.id);
                                        }}
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

            {/* Item Detail Drawer */}
            <ItemDetailDrawer
                item={selectedItem}
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedItem(null);
                }}
                listMembers={list.members || []}
                onUpdate={handleItemUpdate}
                canEdit={canEdit}
            />
        </div>
    );
}
