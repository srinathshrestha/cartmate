import {
  ArrowLeft,
  MessageCircle,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

/**
 * ListHeader Component
 * Handles the header with navigation, title, and panel toggles.
 * Keeps file size under 150 lines by focusing on header logic.
 */
export default function ListHeader({
  list,
  isMembersPanelOpen,
  isChatPanelOpen,
  setIsMembersPanelOpen,
  setIsChatPanelOpen,
  isCreator,
  currentMember,
}) {
  return (
    <header className="border-b border-border bg-card/50 flex-shrink-0">
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
        {/* Left section */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <h1 className="text-base sm:text-xl font-bold truncate">
            {list.name}
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Mobile: Show panel toggles */}
          <div className="md:hidden flex gap-1">
            <Button
              variant={isMembersPanelOpen ? "default" : "outline"}
              size="icon"
              onClick={() => {
                setIsMembersPanelOpen(!isMembersPanelOpen);
                setIsChatPanelOpen(false);
              }}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant={isChatPanelOpen ? "default" : "outline"}
              size="icon"
              onClick={() => {
                setIsChatPanelOpen(!isChatPanelOpen);
                setIsMembersPanelOpen(false);
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop: Always show panels, mobile: Show settings for creator */}
          <div className="hidden sm:flex gap-1">
            <Button
              variant={isMembersPanelOpen ? "default" : "outline"}
              size="icon"
              onClick={() => setIsMembersPanelOpen(!isMembersPanelOpen)}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant={isChatPanelOpen ? "default" : "outline"}
              size="icon"
              onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            {isCreator && (
              <Link href={`/lists/${list.id}/settings`}>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: Show settings button for creator */}
          {isCreator && (
            <Link href={`/lists/${list.id}/settings`}>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
