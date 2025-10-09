import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

/**
 * UploadThing core configuration for v7+.
 * Handles avatar uploads with JWT authentication for the initial upload request.
 * The onUploadComplete callback is verified by UploadThing's signature system.
 */

const f = createUploadthing({
    // Error formatter for better debugging
    errorFormatter: (err) => {
        console.log("UploadThing error:", err);
        return { message: err.message };
    },
});

// Debug logging
console.log("UploadThing core.js loaded");
console.log("UPLOADTHING_TOKEN exists:", !!process.env.UPLOADTHING_TOKEN);
console.log("UPLOADTHING_SECRET exists:", !!process.env.UPLOADTHING_SECRET);

// Define upload routes with custom JWT authentication
export const ourFileRouter = {
    // Avatar uploader - allows images up to 1MB
    avatarUploader: f({
        image: {
            maxFileSize: "1MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req, event }) => {
            console.log("UploadThing middleware: Starting authentication");
            console.log("UploadThing middleware: Event:", event);

            try {
                // Get auth token from cookies (must await in Next.js 15)
                const cookieStore = await cookies();
                const token = cookieStore.get("cartmate_token"); // Correct cookie name

                console.log("UploadThing middleware: Token exists?", !!token);

                if (!token) {
                    console.log("UploadThing middleware: No cartmate_token cookie found");
                    throw new UploadThingError("Unauthorized - No token");
                }

                console.log("UploadThing middleware: Authenticating user...");

                // Verify JWT token
                const userPayload = await verifyToken(token.value);
                console.log("UploadThing middleware: ✓ User authenticated");
                console.log("UploadThing middleware: User ID:", userPayload.id);
                console.log("UploadThing middleware: Username:", userPayload.username);

                if (!userPayload || !userPayload.id) {
                    console.log("UploadThing middleware: Invalid token payload");
                    throw new UploadThingError("Unauthorized - Invalid token");
                }

                // Return metadata to be available in onUploadComplete
                // This will be passed to the callback
                return { userId: userPayload.id };
            } catch (error) {
                console.error("UploadThing middleware error:", error);
                console.error("UploadThing middleware error message:", error.message);
                throw new UploadThingError(`Authentication failed: ${error.message}`);
            }
        })
        .onUploadComplete(({ metadata, file }) => {
            // This callback is triggered by UploadThing's servers after successful upload
            // Note: This runs on the server but can't use cookies-based auth
            // The client will handle updating the user profile with the file URL
            console.log("=====================================");
            console.log("UploadThing: onUploadComplete callback triggered");
            console.log("- User ID:", metadata.userId);
            console.log("- File URL:", file.url);
            console.log("- File name:", file.name);
            console.log("- File size:", file.size);
            console.log("- File key:", file.key);
            console.log("=====================================");

            // Return data to client
            // The client-side code will use this to update the profile
            return {
                url: file.url,
                userId: metadata.userId,
            };
        }),
};
