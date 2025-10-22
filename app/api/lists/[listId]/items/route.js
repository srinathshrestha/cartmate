import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";
import { createItemSchema } from "@/lib/validations/item";

/**
 * GET /api/lists/[listId]/items
 * Fetches all items for a list.
 * Returns items ordered by done status and creation date.
 */
export async function GET(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId } = await params;

    // Require list membership
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
    );
    if (membershipError) return membershipError;

    // Fetch all items for the list
    const items = await prisma.item.findMany({
      where: { listId },
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
      orderBy: [
        // Order by status (PURCHASED first), then by priority (URGENT first), then by creation date
        { status: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/lists/[listId]/items
 * Creates a new item in the list.
 * Requires EDITOR or CREATOR role.
 */
export async function POST(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId } = await params;

    // Require EDITOR or CREATOR role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR", "EDITOR"],
    );
    if (membershipError) return membershipError;

    // Parse and validate request body
    const body = await request.json();
    const validation = createItemSchema.safeParse(body);

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
    } = validation.data;

    // Create item
    const item = await prisma.item.create({
      data: {
        listId,
        name,
        quantity: quantity || "1",
        unit: unit || "PIECE",
        quantityNumber,
        customUnit,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        tags: tags || [],
        category,
        notes,
        dueAt,
        assignedToId,
        priceCents,
        currency,
        storeName,
        storeAisle,
        metadata,
        createdById: user.id,
      },
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
    // await publishItemUpdate(listId, { type: "item:created", item });

    return NextResponse.json(
      {
        message: "Item added successfully",
        item,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
