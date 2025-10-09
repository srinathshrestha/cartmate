import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

/**
 * UploadThing React helpers for v7+.
 * Provides hooks and utilities for file uploads.
 * Re-exported with proper configuration for type safety.
 *
 * @typedef {import("../app/api/uploadthing/core").ourFileRouter} OurFileRouter
 */

// Generate typed helpers for your file router
// Must specify the URL where the router is mounted
export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: "/api/uploadthing",
});

// Generate pre-built components (optional, for convenience)
export const UploadButton = generateUploadButton({
  url: "/api/uploadthing",
});
export const UploadDropzone = generateUploadDropzone({
  url: "/api/uploadthing",
});
