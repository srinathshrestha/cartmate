"use client";

import { LogOut, PlusCircle, ShoppingCart, Users, AlertCircle, CheckCircle, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmailVerification from "@/components/profile/EmailVerification";

/**
 * Dashboard page component.
 * Displays all lists for the current user (created + joined).
 * Allows creating new lists and accessing existing ones.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create list dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch user and lists on mount
  useEffect(() => {
    fetchUserAndLists();
  }, []);

  const fetchUserAndLists = async () => {
    try {
      // Fetch current user
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // Fetch lists
      const listsRes = await fetch("/api/lists");
      if (listsRes.ok) {
        const listsData = await listsRes.json();
        setLists(listsData.lists);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  // Handle create new list
  const handleCreateList = async (e) => {
    e.preventDefault();

    // Check if user is verified
    if (!user?.isEmailVerified) {
      toast.error("Please verify your email before creating lists");
      return;
    }

    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to create list");
        return;
      }

      const data = await response.json();
      toast.success("List created successfully!");

      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      setNewListName("");

      // Redirect to new list
      router.push(`/lists/${data.list.id}`);
    } catch (error) {
      console.error("Create list error:", error);
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle user update from verification
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                Cartmate
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              {user && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        {!user.isEmailVerified && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-500 flex items-center justify-center">
                            <div className="h-1 w-1 rounded-full bg-white"></div>
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="flex flex-col">
                        <span className="font-medium">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        {!user.isEmailVerified && (
                          <span className="text-xs text-orange-600 mt-1">⚠️ Email not verified</span>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ThemeToggle />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Email Verification Banner */}
        {user && !user.isEmailVerified && (
          <Card className="mb-6 border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    Email Not Verified
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                    Please verify your email address to create lists and access all features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">My Lists</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your shopping lists and collaborate
            </p>
          </div>
          <Button
            onClick={() => {
              if (!user?.isEmailVerified) {
                toast.error("Please verify your email before creating lists");
                return;
              }
              setIsCreateDialogOpen(true);
            }}
            className="w-full sm:w-auto"
            disabled={!user?.isEmailVerified}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            {user?.isEmailVerified ? "Create New List" : "Verify Email First"}
          </Button>
        </div>

        {/* Lists grid */}
        {lists.length === 0
          ? <Card className="p-8 sm:p-12 text-center">
              <CardContent>
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {user?.isEmailVerified ? "No lists yet" : "Welcome to Cartmate!"}
              </h3>
                <p className="text-muted-foreground mb-4">
                {user?.isEmailVerified
                  ? "Create your first shopping list to get started"
                  : "Please verify your email address to start creating shopping lists and collaborating with others."
                }
                </p>
              <Button
                onClick={() => {
                  if (!user?.isEmailVerified) {
                    return;
                  } else {
                    setIsCreateDialogOpen(true);
                  }
                }}
                disabled={!user?.isEmailVerified}
              >
                  <PlusCircle className="h-5 w-5 mr-2" />
                {user?.isEmailVerified ? "Create List" : "Verify Email First"}
                </Button>
              </CardContent>
            </Card>
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lists.map((list) => (
                <Link key={list.id} href={`/lists/${list.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {list.name}
                      </CardTitle>
                      <CardDescription className="truncate">
                        Created by {list.creator.username}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {list.memberCount}{" "}
                            {list.memberCount === 1 ? "member" : "members"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4" />
                          <span>
                            {list.itemCount || 0}{" "}
                            {list.itemCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">
                        Last updated {formatDate(list.updatedAt)}
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>}
      </main>

      {/* Create List Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateList}>
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
              <DialogDescription>
                Give your shopping list a name to get started
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="listName">List Name</Label>
              <Input
                id="listName"
                placeholder="e.g., Weekly Groceries"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="mt-2"
                autoFocus
                required
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewListName("");
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !newListName.trim()}
              >
                {isCreating ? "Creating..." : "Create List"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Verification Component */}
      {user && !user.isEmailVerified && (
        <EmailVerification user={user} onUpdate={handleUserUpdate} />
      )}
    </div>
  );
}
