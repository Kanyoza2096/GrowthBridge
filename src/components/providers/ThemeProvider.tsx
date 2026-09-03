'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { usePathname } from 'next/navigation';

export type Theme = 'light' | 'dark';
export type ThemeScope = 'public' | 'admin';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  resetToSystem: () => void;
  isUserChosen: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const PUBLIC_STORAGE_KEY = 'gb_theme';
const ADMIN_STORAGE_KEY = 'gb_admin_theme';

const storageKeyFor = (scope: ThemeScope) =>
  scope === 'admin' ? ADMIN_STORAGE_KEY : PUBLIC_STORAGE_KEY;

const DEFAULT_FOR_SCOPE: Record<ThemeScope, Theme> = {
  public: 'light',
  admin: 'dark',
};

function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.style.colorScheme = theme;
}

export function noFlashThemeScript(scope: ThemeScope = 'public'): string {
  const storageKey = storageKeyFor(scope);
  const fallback = DEFAULT_FOR_SCOPE[scope];
  return `(function(){try{
  var s='${storageKey}',scopeDefault='${fallback}';
  var saved=localStorage.getItem(s);
  var t = (saved==='light'||saved==='dark') ? saved : null;
  if(!t){
    t = scopeDefault;
  }
  var r=document.documentElement;
  if(t==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}
  r.style.colorScheme=t;
}catch(e){}})();`
    .replace(/\s+/g, ' ')
    .trim();
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider scope="...">');
  }
  return ctx;
}

function resolveInitialTheme(scope: ThemeScope): { theme: Theme; isUserChosen: boolean } {
  if (typeof window === 'undefined') {
    return { theme: DEFAULT_FOR_SCOPE[scope], isUserChosen: false };
  }

  try {
    const key = storageKeyFor(scope);
    const saved = localStorage.getItem(key);

    if (saved === 'light' || saved === 'dark') {
      return { theme: saved, isUserChosen: true };
    }
  } catch {
    // localStorage blocked or corrupted — use the scope default
  }

  return { theme: DEFAULT_FOR_SCOPE[scope], isUserChosen: false };
}

export function ThemeProvider({
  children,
  scope,
}: {
  children: React.ReactNode;
  scope: ThemeScope;
}) {
  const pathname = usePathname();
  const activeScope: ThemeScope = pathname?.startsWith('/admin') ? 'admin' : 'public';
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme(scope).theme);
  const [isUserChosen, setIsUserChosen] = useState<boolean>(
    () => resolveInitialTheme(scope).isUserChosen
  );

  // When this provider's scope is the active route scope, apply its theme.
  // Re-read storage when becoming active so public/admin preferences stay isolated
  // after cross-navigation (public ↔ admin).
  useEffect(() => {
    if (activeScope !== scope) return;

    try {
      const saved = localStorage.getItem(storageKeyFor(scope));
      if (saved === 'light' || saved === 'dark') {
        if (saved !== theme) {
          setThemeState(saved);
          setIsUserChosen(true);
          applyThemeToDocument(saved);
          return;
        }
      } else if (!isUserChosen) {
        const fallback = DEFAULT_FOR_SCOPE[scope];
        if (fallback !== theme) {
          setThemeState(fallback);
          applyThemeToDocument(fallback);
          return;
        }
      }
    } catch {
      // ignore storage errors
    }

    applyThemeToDocument(theme);
  }, [activeScope, scope, theme, isUserChosen]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      setIsUserChosen(true);
      try {
        localStorage.setItem(storageKeyFor(scope), t);
      } catch {
        // localStorage full or unavailable — theme still works for this session
      }
      if (activeScope === scope) applyThemeToDocument(t);
    },
    [activeScope, scope]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const resetToSystem = useCallback(() => {
    const key = storageKeyFor(scope);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    const next = DEFAULT_FOR_SCOPE[scope];
    setThemeState(next);
    setIsUserChosen(false);
    if (activeScope === scope) applyThemeToDocument(next);
  }, [activeScope, scope]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme,
      toggleTheme,
      resetToSystem,
      isUserChosen,
    }),
    [theme, setTheme, toggleTheme, resetToSystem, isUserChosen]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Backwards-compatible exports
export type AdminTheme = Theme;
export const AdminThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scope="admin">{children}</ThemeProvider>
);
export function useAdminTheme() {
  const ctx = useTheme();
  return {
    theme: ctx.theme as AdminTheme,
    toggleTheme: ctx.toggleTheme,
    setTheme: ctx.setTheme as (t: AdminTheme) => void,
  };
}
