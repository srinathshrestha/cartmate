import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";

/**
 * Redux store for Cartmate application.
 * Manages global state including theme (dark/light mode).
 */
export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});
