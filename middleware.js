import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

/**
 * Middleware to protect routes with JWT authentication.
 * Runs on every request to check authentication status.
 * Redirects unauthenticated users to login page.
 */

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production",
);

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/reset-password"];

// API routes that don't require authentication
const publicApiRoutes = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
];

/**
 * Checks if a path is public (doesn't require auth).
 * @param {string} pathname - Request path
 * @returns {boolean} True if path is public
 */
function isPublicPath(pathname) {
  // Check exact matches
  if (publicRoutes.includes(pathname) || publicApiRoutes.includes(pathname)) {
    return true;
  }

  // Check if path starts with public API routes
  if (pathname.startsWith("/api/auth/")) {
    return publicApiRoutes.some((route) => pathname.startsWith(route));
  }

  // Invite acceptance page is public (handles auth redirect internally)
  if (pathname.startsWith("/invite/")) {
    return true;
  }

  // Static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return true;
  }

  return false;
}

/**
 * Verifies JWT token from cookie.
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} User payload or null
 */
async function verifyAuth(request) {
  const token = request.cookies.get("cartmate_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Main middleware function.
 * Runs on every request to protect authenticated routes.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Verify JWT token
  const user = await verifyAuth(request);

  // If no valid token, redirect to login
  if (!user) {
    // For API routes, return 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // For pages, redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, proceed
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
