"use client";

import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Custom 404 Not Found Page
 *
 * Displayed when users navigate to non-existent routes.
 * Provides clear messaging and navigation options to help users return to valid pages.
 *
 * Features:
 * - Clean, user-friendly design
 * - Clear error messaging
 * - Multiple navigation options
 * - Responsive layout
 * - Dark mode support
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          {/* Error icon */}
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
          </div>

          {/* Error title */}
          <CardTitle className="text-center text-3xl">
            404 - Page Not Found
          </CardTitle>

          {/* Error description */}
          <CardDescription className="text-center text-base">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Help text */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              This could happen if:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-disc list-inside">
              <li>The URL was typed incorrectly</li>
              <li>The page has been removed or deleted</li>
              <li>The link you followed is outdated</li>
            </ul>
          </div>

          {/* Navigation buttons */}
          <div className="space-y-3">
            {/* Go to dashboard */}
            <Link href="/dashboard" className="block">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>

            {/* Go back */}
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional help */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-4">
            If you believe this is an error, please contact support or try
            refreshing the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
