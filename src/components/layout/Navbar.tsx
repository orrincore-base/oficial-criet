import React, { useState } from 'react';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Video as VideoIcon,
  Palette,
  FolderKanban,
  Settings,
  Sparkles,
  Menu,
  X,
  Layers,
  Home,
} from 'lucide-react';
import { BrandConfig } from '../../types';

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'create-post'
  | 'create-video'
  | 'templates'
  | 'brand'
  | 'projects'
  | 'settings';

interface NavbarProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  brand: BrandConfig;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, brand }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-post' as ActiveTab, label: 'Criar Post', icon: ImageIcon },
    { id: 'create-video' as ActiveTab, label: 'Criar Vídeo', icon: VideoIcon },
    { id: 'templates' as ActiveTab, label: 'Templates', icon: Layers },
    { id: 'brand' as ActiveTab, label: 'Minha Marca', icon: Palette },
    { id: 'projects' as ActiveTab, label: 'Projetos', icon: FolderKanban },
    { id: 'settings' as ActiveTab, label: 'Configurações', icon: Settings },
  ];

  const handleNav = (tab: ActiveTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('landing')}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-500/30 group-hover:bg-blue-700 transition-colors">
                C
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  Criet
                </span>
                <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase">
                  Studio
                </span>
              </div>
            </button>

            {/* Configured brand quick chip */}
            {brand.pageName && currentTab !== 'landing' && (
              <div
                onClick={() => handleNav('brand')}
                className="hidden xl:flex items-center gap-2 px-3 py-1 bg-blue-50/70 border border-blue-200/60 rounded-full text-xs font-semibold text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors"
                title="Clique para editar Minha Marca"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="truncate max-w-[140px]">{brand.pageName}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNav('landing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'landing'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              Início
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {currentTab !== 'create-post' && (
              <button
                onClick={() => handleNav('create-post')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Novo Post
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleNav('landing')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
              currentTab === 'landing' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <Home className="w-4 h-4" />
            Início
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
