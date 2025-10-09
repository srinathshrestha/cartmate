import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";
import {
  createMessageSchema,
  getMessagesSchema,
} from "@/lib/validations/message";

/**
 * GET /api/lists/[listId]/messages
 * Fetches messages for a list with pagination.
 * Returns up to 50 messages by default.
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const cursor = searchParams.get("cursor"); // Last message ID

    // Build query
    const query = {
      where: { listId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.min(limit, 100), // Max 100 messages per request
    };

    // Add cursor for pagination
    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // Skip the cursor itself
    }

    // Fetch messages
    const messages = await prisma.message.findMany(query);

    // Check if there are more messages
    const hasMore = messages.length === query.take;
    const nextCursor = hasMore ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages: messages.reverse(), // Return in ascending order (oldest first)
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/lists/[listId]/messages
 * Sends a new message in the list chat.
 * Supports @mentions for users and items.
 */
export async function POST(request, { params }) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = createMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { text, mentionsUsers, mentionsItems } = validation.data;

    // Create message
    const message = await prisma.message.create({
      data: {
        listId,
        senderId: user.id,
        text,
        mentionsUsers: mentionsUsers || [],
        mentionsItems: mentionsItems || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // TODO: Publish to Redis for real-time sync
    // await publishMessage(listId, { type: "message:created", message });

    // TODO: Send email notifications for mentions
    // if (mentionsUsers && mentionsUsers.length > 0) {
    //   await sendMentionEmails(mentionsUsers, message, listId);
    // }

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: message,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
