/**
 * UploadThing route handlers for Next.js App Router.
 * This file exports the HTTP handlers for the UploadThing API.
 * It connects the file router defined in core.js to the Next.js routing system.
 * 
 * The UPLOADTHING_SECRET is used to verify webhook callbacks from UploadThing.
 */

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Log when route handlers are initialized
console.log("UploadThing route handlers initialized at /api/uploadthing");
console.log("UploadThing using token:", process.env.UPLOADTHING_TOKEN?.substring(0, 20) + "...");
console.log("UploadThing using secret:", process.env.UPLOADTHING_SECRET?.substring(0, 10) + "...");

// Create and export route handlers with proper configuration
// The UPLOADTHING_SECRET and UPLOADTHING_TOKEN env vars are automatically used
export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
    config: {
        // Configure callback URL handling
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/uploadthing`,
    },
});
