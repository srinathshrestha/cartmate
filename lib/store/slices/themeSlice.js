import { createSlice } from "@reduxjs/toolkit";

/**
 * Theme slice for managing dark/light mode.
 * Persists theme preference to localStorage.
 */

// Get initial theme from localStorage or system preference
const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem("cartmate-theme");
  if (stored) return stored;

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: "light", // Will be updated on client
  },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("cartmate-theme", action.payload);
        // Update document class
        if (action.payload === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    toggleTheme: (state) => {
      const newMode = state.mode === "light" ? "dark" : "light";
      state.mode = newMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("cartmate-theme", newMode);
        // Update document class
        if (newMode === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    initializeTheme: (state) => {
      const theme = getInitialTheme();
      state.mode = theme;
      if (typeof window !== "undefined") {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
  },
});

export const { setTheme, toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
