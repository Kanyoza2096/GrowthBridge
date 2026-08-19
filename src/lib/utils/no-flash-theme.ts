export type ThemeScope = 'public' | 'admin';

const PUBLIC_STORAGE_KEY = 'gb_theme';
const ADMIN_STORAGE_KEY = 'gb_admin_theme';
const storageKeyFor = (scope: ThemeScope) =>
  scope === 'admin' ? ADMIN_STORAGE_KEY : PUBLIC_STORAGE_KEY;

const DEFAULT_FOR_SCOPE: Record<ThemeScope, 'light' | 'dark'> = {
  public: 'light',
  admin: 'dark',
};

/**
 * Inline, zero-RUM script — runs before React hydrates to avoid FOUC / flash.
 * Drop it into <head> via dangerouslySetInnerHTML. Pure server-safe helper string generator.
 */
export function noFlashThemeScript(scope: ThemeScope = 'public'): string {
  const storageKey = storageKeyFor(scope);
  const fallback = DEFAULT_FOR_SCOPE[scope];
  return `(function(){try{var k='${storageKey}',s=localStorage.getItem(k),t=s||'${fallback}';if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}document.documentElement.style.colorScheme=t;}catch(e){}})();`;
}
