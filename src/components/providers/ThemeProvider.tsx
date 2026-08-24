'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

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

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches === true;
}

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
    var sys=(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    t = sys ? 'dark' : scopeDefault;
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
    // localStorage blocked or corrupted — fall through to system default
  }

  const sys = systemPrefersDark() ? 'dark' : DEFAULT_FOR_SCOPE[scope];
  return { theme: sys, isUserChosen: false };
}

export function ThemeProvider({
  children,
  scope,
}: {
  children: React.ReactNode;
  scope: ThemeScope;
}) {
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme(scope).theme);
  const [isUserChosen, setIsUserChosen] = useState<boolean>(
    () => resolveInitialTheme(scope).isUserChosen
  );

  // Single effect: apply theme to DOM AND sync with OS preference changes
  useEffect(() => {
    applyThemeToDocument(theme);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      const key = storageKeyFor(scope);
      let currentSaved: string | null = null;

      try {
        currentSaved = localStorage.getItem(key);
      } catch {
        return;
      }

      if (currentSaved !== 'light' && currentSaved !== 'dark') {
        const next = e.matches ? 'dark' : DEFAULT_FOR_SCOPE[scope];
        setThemeState(next);
        setIsUserChosen(false);
        applyThemeToDocument(next);
      }
    };

    // Use modern API with fallback for older browsers
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      // Safari < 14 fallback
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [scope, theme]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      setIsUserChosen(true);
      try {
        localStorage.setItem(storageKeyFor(scope), t);
      } catch {
        // localStorage full or unavailable — theme still works for this session
      }
      applyThemeToDocument(t);
    },
    [scope]
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
    const sys = systemPrefersDark() ? 'dark' : DEFAULT_FOR_SCOPE[scope];
    setThemeState(sys);
    setIsUserChosen(false);
    applyThemeToDocument(sys);
  }, [scope]);

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
