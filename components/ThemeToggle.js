"use client";

import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/lib/store/slices/themeSlice";

/**
 * Theme toggle button component.
 * Switches between light and dark mode using Redux.
 */
export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
    >
      {theme === "dark"
        ? <Sun className="h-5 w-5" />
        : <Moon className="h-5 w-5" />}
    </Button>
  );
}
