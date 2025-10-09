import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import prisma from "@/lib/db";
import { createListSchema } from "@/lib/validations/list";

/**
 * GET /api/lists
 * Fetches all lists for the authenticated user (created + joined).
 * Returns list with member count and last updated timestamp.
 */
export async function GET() {
  try {
    // Require authentication
    const { user, error } = await requireAuth();
    if (error) return error;

    // Fetch all lists where user is a member
    const lists = await prisma.list.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform data for frontend
    const formattedLists = lists.map((list) => ({
      id: list.id,
      name: list.name,
      creatorId: list.creatorId,
      creator: list.creator,
      memberCount: list.members.length,
      itemCount: list._count.items,
      messageCount: list._count.messages,
      members: list.members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      })),
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));

    return NextResponse.json({ lists: formattedLists });
  } catch (error) {
    console.error("Get lists error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/lists
 * Creates a new shopping list.
 * Automatically adds creator as a member with CREATOR role.
 */
export async function POST(request) {
  try {
    // Require authentication
    const { user, error } = await requireAuth();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validation = createListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name } = validation.data;

    // Create list with creator as first member
    const list = await prisma.list.create({
      data: {
        name,
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "CREATOR",
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "List created successfully",
        list,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
