'use client';

/**
 * Inline pre-hydration script so the correct theme is applied before first paint.
 *
 * Defaults (product policy):
 *   - Public site  → light (storage: gb_theme)
 *   - Admin panel  → dark  (storage: gb_admin_theme)
 *
 * OS preference is intentionally ignored so product defaults stay stable.
 */
export function ThemeFlashScript() {
  const dispatcher = `(function(){try{
  var path=location.pathname||'';
  var admin=path==='/admin'||path.indexOf('/admin/')===0;
  var key=admin?'gb_admin_theme':'gb_theme';
  var fallback=admin?'dark':'light';
  var saved=localStorage.getItem(key);
  var theme=(saved==='light'||saved==='dark')?saved:fallback;
  var root=document.documentElement;
  root.classList.toggle('dark', theme==='dark');
  root.style.colorScheme=theme;
}catch(e){}})();`.replace(/\s+/g, ' ').trim();

  return <script dangerouslySetInnerHTML={{ __html: dispatcher }} />;
}
