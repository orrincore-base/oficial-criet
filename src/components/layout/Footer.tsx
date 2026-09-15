import React from 'react';
import { ActiveTab } from './Navbar';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-12 pb-8 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-base">
                C
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Criet
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Plataforma de criação rápida de conteúdo visual para páginas online, redes sociais, empresas, instituições, jornais e criadores.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg w-max border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Execução 100% no navegador • Sem envio de dados para servidores
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Ferramentas
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('create-post')}
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Criador de Posts (Imagens)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('create-video')}
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Criador de Vídeos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('templates')}
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Catálogo de Templates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('brand')}
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Minha Marca
                </button>
              </li>
            </ul>
          </div>

          {/* System & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Sobre a Plataforma
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Dashboard Principal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('projects')}
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Meus Projetos (IndexedDB)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('settings')}
                  className="hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Diagnóstico & Backup
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Criet. Tecnologia e simplicidade na criação de conteúdo.</p>
          <div className="flex items-center gap-4">
            <span>Compatível com GitHub Pages</span>
            <span>•</span>
            <span>Zero Backend Obrigatório</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
