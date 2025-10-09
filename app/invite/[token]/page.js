"use client";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Invitation Page Component
 *
 * Handles secure invitation link processing for joining lists.
 * This page:
 * - Validates invitation tokens
 * - Shows list details before joining
 * - Handles authentication requirements
 * - Accepts invitations securely
 * - Provides clear error messages
 */
export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  // State management
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch invite details on mount
  useEffect(() => {
    fetchInviteDetails();
  }, [token]);

  /**
   * Fetches invite and list details from the server.
   * Validates token and checks invite status.
   */
  const fetchInviteDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated first
      const authResponse = await fetch("/api/auth/me");

      if (!authResponse.ok) {
        // Not authenticated - redirect to login with return URL
        router.push(`/login?redirect=/invite/${token}`);
        return;
      }

      // User is authenticated, fetch invite details
      const response = await fetch(`/api/invites/${token}/details`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Invalid invite link");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setInvite(data.invite);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching invite:", err);
      setError("Failed to load invite. Please try again.");
      setLoading(false);
    }
  };

  /**
   * Handles accepting the invitation.
   * Makes POST request to accept endpoint and redirects to list on success.
   */
  const handleAcceptInvite = async () => {
    try {
      setAccepting(true);
      setError(null);

      const response = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to accept invite");
        setAccepting(false);
        return;
      }

      // Success! Show success message briefly then redirect
      setSuccess(true);
      setTimeout(() => {
        router.push(`/lists/${data.list.id}`);
      }, 1500);
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError("Failed to accept invite. Please try again.");
      setAccepting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading invitation...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              You've joined the list. Redirecting...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-center">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invite details state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-center text-2xl">
            You're Invited!
          </CardTitle>
          <CardDescription className="text-center">
            Join the list and start collaborating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* List information */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                List Name
              </p>
              <p className="text-lg font-semibold">{invite?.list?.name}</p>
            </div>

            {/* Show member count if available */}
            {invite?.list?.memberCount !== undefined && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  {invite.list.memberCount} member
                  {invite.list.memberCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Show expiry info */}
            {invite?.expiresAt && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  Expires {new Date(invite.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Show usage info if there's a limit */}
            {invite?.maxUses && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>
                  {invite.usedCount}/{invite.maxUses} slots used
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="w-full"
            >
              {accepting
                ? <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                : "Accept Invitation"}
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          {/* Security note */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By accepting, you'll be added as an editor to this list. You'll be
            able to add, edit, and manage items.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
