import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import prisma from "@/lib/db";

/**
 * GET /api/lists/[listId]/mentions?q=search
 * Returns members and items for @-mention autocomplete.
 * User must be a member of the list to access this.
 */
export async function GET(request, { params }) {
  try {
    // Require authentication
    const { user, error } = await requireAuth();
    if (error) return error;

    const { listId } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    // Check if user is a member of this list
    const membership = await prisma.listMember.findFirst({
      where: {
        listId,
        userId: user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this list" },
        { status: 403 },
      );
    }

    // Fetch members (filter by username)
    const members = await prisma.listMember.findMany({
      where: {
        listId,
        user: {
          username: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      take: 5,
    });

    // Fetch items (filter by name)
    const items = await prisma.item.findMany({
      where: {
        listId,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        done: true,
      },
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.user.id,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl,
        type: "user",
      })),
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        done: i.done,
        type: "item",
      })),
    });
  } catch (error) {
    console.error("Fetch mentions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
