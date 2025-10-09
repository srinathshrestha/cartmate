"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { initializeTheme } from "./slices/themeSlice";
import { store } from "./store";

/**
 * Theme initializer component.
 * Runs on client mount to set the correct theme.
 */
function ThemeInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  return <>{children}</>;
}

/**
 * Redux Provider component.
 * Wraps the app with Redux store and initializes theme.
 */
export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <ThemeInitializer>{children}</ThemeInitializer>
    </Provider>
  );
}
