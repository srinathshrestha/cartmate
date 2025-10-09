import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/lib/auth/jwt";

/**
 * UploadThing core configuration for v7+.
 * Handles avatar uploads with proper JWT authentication.
 * Uses environment variables for UploadThing configuration.
 */

const f = createUploadthing();

// Define upload routes with JWT authentication
export const ourFileRouter = {
    // Avatar uploader - allows images up to 1MB
    avatarUploader: f({
        image: {
            maxFileSize: "1MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req }) => {
            try {
                // Get current user using our JWT authentication system
                const user = await getCurrentUser();

                if (!user || !user.id) {
                    throw new UploadThingError("Unauthorized - Please log in");
                }

                console.log("UploadThing: User authenticated successfully", user.id);

                // Return metadata to be available in onUploadComplete
                return { userId: user.id };
            } catch (error) {
                console.error("UploadThing authentication error:", error.message);
                throw new UploadThingError("Authentication failed");
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This runs after successful upload on the server
            console.log("Avatar upload complete for user:", metadata.userId);
            console.log("File URL:", file.url);
            console.log("File name:", file.name);
            console.log("File size:", file.size);

            // Return data to client
            return {
                url: file.url,
                userId: metadata.userId,
            };
        }),
};
