import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";
import { updateItemSchema } from "@/lib/validations/item";

/**
 * PATCH /api/lists/[listId]/items/[itemId]
 * Updates an existing item.
 * Requires EDITOR or CREATOR role.
 */
export async function PATCH(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId, itemId } = await params;

    // Require EDITOR or CREATOR role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR", "EDITOR"],
    );
    if (membershipError) return membershipError;

    // Check if item exists in this list
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.listId !== listId) {
      return NextResponse.json(
        { error: "Item does not belong to this list" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      name,
      quantity,
      unit,
      quantityNumber,
      customUnit,
      status,
      priority,
      tags,
      category,
      notes,
      dueAt,
      assignedToId,
      priceCents,
      currency,
      storeName,
      storeAisle,
      metadata,
      done,
    } = validation.data;

    const updateData = {};

    // Handle legacy done field mapping to status
    if (done !== undefined) {
      updateData.status = done ? "PURCHASED" : "TODO";
    }

    // Add new fields if provided
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit !== undefined) updateData.unit = unit;
    if (quantityNumber !== undefined) updateData.quantityNumber = quantityNumber;
    if (customUnit !== undefined) updateData.customUnit = customUnit;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (notes !== undefined) updateData.notes = notes;
    if (dueAt !== undefined) updateData.dueAt = dueAt;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (priceCents !== undefined) updateData.priceCents = priceCents;
    if (currency !== undefined) updateData.currency = currency;
    if (storeName !== undefined) updateData.storeName = storeName;
    if (storeAisle !== undefined) updateData.storeAisle = storeAisle;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Update item
    const item = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        purchasedBy: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            subItems: true,
            attachments: true,
          },
        },
      },
    });

    // TODO: Publish to Redis for real-time sync
    // await publishItemUpdate(listId, { type: "item:updated", item });

    return NextResponse.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/lists/[listId]/items/[itemId]
 * Deletes an item from the list.
 * Requires EDITOR or CREATOR role.
 */
export async function DELETE(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId, itemId } = await params;

    // Require EDITOR or CREATOR role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR", "EDITOR"],
    );
    if (membershipError) return membershipError;

    // Check if item exists in this list
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.listId !== listId) {
      return NextResponse.json(
        { error: "Item does not belong to this list" },
        { status: 403 },
      );
    }

    // Delete item
    await prisma.item.delete({
      where: { id: itemId },
    });

    // TODO: Publish to Redis for real-time sync
    // await publishItemUpdate(listId, { type: "item:deleted", itemId });

    return NextResponse.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
