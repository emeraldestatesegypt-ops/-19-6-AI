import React from 'react';
import { LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  T: (key: string) => string;
  tab: string;
  setTab: (t: string) => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: (() => void) | null;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  langKey: string;
  setLangKey: React.Dispatch<React.SetStateAction<string>>;
}

export const NAV_ITEMS = (T: (k: string) => string) => [
  { id: 'overview', label: 'Live Dashboard', icon: '📊', section: 'CORE' },
  { id: 'leads', label: 'Leads & CRM Hub', icon: '👥', section: 'CORE' },
  { id: 'listings', label: 'Property Inventory', icon: '🏢', section: 'CORE' },
  { id: 'searchInsights', label: T('searchInsights') || 'Search Insights', icon: '📈', section: 'CORE' },
  { id: 'agents', label: 'Ai Bots & Agents', icon: '🤖', section: 'AUTOMATION & AGENTS', badge: '6', badgeCls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  { id: 'workflows', label: 'Workflows', icon: '⚡', section: 'AUTOMATION & AGENTS', badge: '8', badgeCls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  { id: 'easyListing', label: 'Easy Listing', icon: '📑', section: 'INTEGRATIONS' },
  { id: 'automation', label: 'Automation Portal', icon: '⚙️', section: 'INTEGRATIONS' },
  { id: 'dataSync', label: 'Data Sync & Hub', icon: '🔄', section: 'INTEGRATIONS' },
];

export default function Sidebar({
  T,
  tab,
  setTab,
  collapsed,
  setCollapsed,
  onClose,
  theme,
  setTheme,
  langKey,
  setLangKey,
}: SidebarProps) {
  const items = NAV_ITEMS(T);
  const sections = Array.from(new Set(items.map((i) => i.section)));

  const handleSignOut = async () => {
    if (confirm("Disconnect Admin Session?")) {
      await signOut(auth);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0f1d] border-r border-slate-800 overflow-hidden transition-all duration-300 ${collapsed ? 'w-14' : 'w-56'}`} id="admin-sidebar">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 min-h-[56px] justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] text-sm shrink-0">
            🛡️
          </div>
          {!collapsed && (
            <div className="brand-text select-none animate-fade-in">
              <div className="font-bold text-sm text-white tracking-tight">
                {T('brand')}
              </div>
              <div className="font-mono text-[6.5px] tracking-[0.18em] text-slate-500 uppercase mt-0.5">
                {T('brandSub')}
              </div>
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition">
            ✕
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map((section) => (
          <div key={section} className="space-y-1">
            {!collapsed && (
              <div className="px-2 font-mono text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase select-none">
                {section}
              </div>
            )}
            {items
              .filter((item) => item.section === section)
              .map((item) => {
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id);
                      if (onClose) onClose();
                    }}
                    className={`nav-item-btn w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium cursor-pointer transition-all duration-150 relative ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 rounded-r'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={item.label}
                  >
                    <span className="text-sm shadow-sm shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className="truncate select-none">{item.label}</span>
                    )}
                    {item.badge && !collapsed && (
                      <span className={`ml-auto text-[7px] font-bold px-1.5 py-0.5 rounded-full select-none ${item.badgeCls}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="border-t border-slate-800 p-2 space-y-1 shrink-0 bg-[#0a0f1d]">
        {!collapsed && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded text-left transition select-none text-[11px] font-mono uppercase tracking-wider"
            id="sidebar-logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        )}

        {/* Language Toggle Button */}
        <button
          onClick={() => setLangKey((prev) => (prev === 'ar' ? 'en' : 'ar'))}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded text-left transition select-none"
          title={langKey === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          id="btn-language-toggle"
        >
          <span className="text-sm shrink-0">🌐</span>
          {!collapsed && (
            <span className="text-[11px] font-mono uppercase tracking-wider flex items-center justify-between w-full">
              <span>{langKey === 'ar' ? 'اللغة الحالية' : 'Language'}</span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                {langKey === 'ar' ? 'العربية' : 'English'}
              </span>
            </span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-500 hover:text-white hover:bg-white/5 rounded text-left transition select-none"
          title={`${T('collapse')} [/]`}
          id="btn-sidebar-toggle"
        >
          <span className="text-sm transform transition-transform duration-300 shrink-0">
            {collapsed ? '▶' : '◀'}
          </span>
          {!collapsed && (
            <div className="flex items-center justify-between w-full select-none">
              <span className="text-[11px] font-mono uppercase tracking-wider">{T('collapse')}</span>
              <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-500 font-mono">/</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
