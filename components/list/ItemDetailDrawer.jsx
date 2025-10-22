"use client";

import {
    Calendar,
    Clock,
    DollarSign,
    MapPin,
    Tag,
    User,
    X,
    AlertTriangle,
    CheckCircle,
    Edit,
    Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

/**
 * ItemDetailDrawer Component
 * Allows editing of all item fields in a comprehensive drawer interface.
 * Includes validation, optimistic updates, and error handling.
 */
export default function ItemDetailDrawer({
    item,
    isOpen,
    onClose,
    listMembers = [],
    onUpdate,
    canEdit = true,
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [newTagInput, setNewTagInput] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        quantity: "1",
        unit: "PIECE",
        customUnit: "",
        status: "TODO",
        priority: "MEDIUM",
        tags: [],
        notes: "",
        dueAt: "",
        assignedToId: "",
        priceCents: "",
        currency: "INR",
        storeName: "",
        storeAisle: "",
    });

    // Initialize form data when item changes
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || "",
                quantity: item.quantity || "1",
                unit: item.unit || "PIECE",
                customUnit: item.customUnit || "",
                status: item.status || "TODO",
                priority: item.priority || "MEDIUM",
                tags: item.tags || [],
                notes: item.notes || "",
                dueAt: item.dueAt ? new Date(item.dueAt).toISOString().slice(0, 16) : "",
                assignedToId: item.assignedToId || "",
                priceCents: item.priceCents ? (item.priceCents / 100).toString() : "",
                currency: item.currency || "INR",
                storeName: item.storeName || "",
                storeAisle: item.storeAisle || "",
            });
            setNewTagInput("");
        }
    }, [item]);

    // Handle input changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle tag management
    const handleAddTag = () => {
        if (newTagInput.trim() && !formData.tags.includes(newTagInput.trim())) {
            handleChange("tags", [...formData.tags, newTagInput.trim()]);
            setNewTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        handleChange("tags", formData.tags.filter((tag) => tag !== tagToRemove));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canEdit) return;

        setIsSaving(true);
        try {
            // Prepare update data
            const updateData = {
                name: formData.name.trim(),
                quantity: formData.quantity,
                unit: formData.unit,
                customUnit: formData.unit === "CUSTOM" ? formData.customUnit : undefined,
                status: formData.status,
                priority: formData.priority,
                tags: formData.tags,
                notes: formData.notes.trim() || undefined,
                dueAt: formData.dueAt || undefined,
                assignedToId: formData.assignedToId || undefined,
                priceCents: formData.priceCents ? Math.round(parseFloat(formData.priceCents) * 100) : undefined,
                currency: formData.currency || undefined,
                storeName: formData.storeName.trim() || undefined,
                storeAisle: formData.storeAisle.trim() || undefined,
                done: formData.status === "PURCHASED", // Backward compatibility
            };

            // Update item via API
            const response = await fetch(`/api/lists/${item.listId}/items/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error || "Failed to update item");
                return;
            }

            const data = await response.json();
            onUpdate(data.item);
            onClose();
            toast.success("Item updated successfully!");
        } catch (error) {
            console.error("Update item error:", error);
            toast.error("Failed to update item");
        } finally {
            setIsSaving(false);
        }
    };

    // Don't render if no item or drawer is closed
    if (!item || !isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Edit Item Details
                    </DialogTitle>
                    <DialogDescription>
                        Update all item information including priority, tags, due dates, and more.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Enter item name"
                                    required
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity *</Label>
                                <Input
                                    id="quantity"
                                    value={formData.quantity}
                                    onChange={(e) => handleChange("quantity", e.target.value)}
                                    placeholder="1"
                                    required
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit *</Label>
                                <select
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) => handleChange("unit", e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
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
                            </div>

                            {formData.unit === "CUSTOM" && (
                                <div className="space-y-2">
                                    <Label htmlFor="customUnit">Custom Unit</Label>
                                    <Input
                                        id="customUnit"
                                        value={formData.customUnit}
                                        onChange={(e) => handleChange("customUnit", e.target.value)}
                                        placeholder="e.g., bottles, slices"
                                        disabled={isSaving}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Status & Priority</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="PURCHASED">Purchased</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    value={formData.priority}
                                    onChange={(e) => handleChange("priority", e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Tags</h3>

                        {/* Tag Input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a tag..."
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                disabled={isSaving || formData.tags.length >= 15}
                                maxLength={20}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleAddTag}
                                disabled={isSaving || !newTagInput.trim() || formData.tags.length >= 15}
                            >
                                <Tag className="h-4 w-4" />
                            </Button>
                        </div>

                        {formData.tags.length >= 15 && (
                            <p className="text-xs text-orange-600">Maximum 15 tags allowed</p>
                        )}

                        {/* Tag Display */}
                        {formData.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-destructive"
                                            disabled={isSaving}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No tags added yet.</p>
                        )}
                    </div>

                    {/* Due Date and Assignee */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Planning</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dueAt" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Due Date
                                </Label>
                                <Input
                                    id="dueAt"
                                    type="datetime-local"
                                    value={formData.dueAt}
                                    onChange={(e) => handleChange("dueAt", e.target.value)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignedToId" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Assign To
                                </Label>
                                <select
                                    id="assignedToId"
                                    value={formData.assignedToId}
                                    onChange={(e) => handleChange("assignedToId", e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                                >
                                    <option value="">Unassigned</option>
                                    {listMembers.map((member) => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing and Store Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Pricing & Location</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="priceCents" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Price
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="priceCents"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.priceCents}
                                        onChange={(e) => handleChange("priceCents", e.target.value)}
                                        placeholder="0.00"
                                        disabled={isSaving}
                                        className="flex-1"
                                    />
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => handleChange("currency", e.target.value)}
                                        disabled={isSaving}
                                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="INR">INR</option>
                                        <option value="JPY">JPY</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="storeName" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Store
                                </Label>
                                <Input
                                    id="storeName"
                                    value={formData.storeName}
                                    onChange={(e) => handleChange("storeName", e.target.value)}
                                    placeholder="Store name"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="storeAisle">Store Aisle/Section</Label>
                            <Input
                                id="storeAisle"
                                value={formData.storeAisle}
                                onChange={(e) => handleChange("storeAisle", e.target.value)}
                                placeholder="e.g., Aisle 3, Dairy Section"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Additional notes about this item..."
                            rows={3}
                            disabled={isSaving}
                        />
                    </div>

                    {/* Form Actions */}
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving || !canEdit}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
