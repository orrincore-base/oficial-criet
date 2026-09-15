import React, { useEffect, useState } from 'react';
import { BrandConfig, Project } from '../types';
import { getAllProjects, deleteProject, duplicateProject } from '../lib/storage/indexedDB';
import { Button } from '../components/ui/Button';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Plus,
  Palette,
  Layers,
  FolderKanban,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface DashboardViewProps {
  brand: BrandConfig;
  onCreatePost: () => void;
  onCreateVideo: () => void;
  onOpenTemplates: () => void;
  onOpenBrand: () => void;
  onOpenProjects: () => void;
  onEditProject: (project: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  brand,
  onCreatePost,
  onCreateVideo,
  onOpenTemplates,
  onOpenBrand,
  onOpenProjects,
  onEditProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    const list = await getAllProjects();
    setProjects(list);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      await deleteProject(id);
      loadProjects();
    }
  };

  const handleDuplicate = async (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateProject(proj);
    loadProjects();
  };

  return (
    <div className="space-y-10 text-left py-2">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-wider">
            <span>Painel Principal</span>
            <span>•</span>
            <span>{brand.pageName || 'Marca Padrão'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pronto para criar sua próxima publicação?
          </h1>
          <p className="text-sm text-blue-100 font-normal">
            Escolha um formato abaixo para gerar imagens ou vídeos com identidade visual automática.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="md"
            onClick={onOpenBrand}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-xs font-semibold"
          >
            <Palette className="w-4 h-4 mr-1.5" />
            Minha Marca
          </Button>
          <Button
            size="md"
            onClick={onCreatePost}
            className="bg-white text-blue-700 hover:bg-blue-50 border-none font-bold shadow-md"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo Post
          </Button>
        </div>
      </div>

      {/* Quick Create Cards (Criar Rapidamente) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Criar rapidamente</h2>
          <span className="text-xs text-slate-500">Escolha o tipo de conteúdo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Novo Post */}
          <div
            onClick={onCreatePost}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Novo Post
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gere imagens para Instagram, Facebook, jornais e portais nos formatos 4:5, 1:1, 9:16 ou 16:9.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600">
              <span>Criar post</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Novo Vídeo */}
          <div
            onClick={onCreateVideo}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <VideoIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Novo Vídeo
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adicione barras de notícia, selo ao vivo, logo e rodapé animado aos seus clipes sem editar.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600">
              <span>Criar vídeo</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Galeria de Templates */}
          <div
            onClick={onOpenTemplates}
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Templates Prontos
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore modelos de Notícia, Desporto, Urgente, Curiosidade, Anúncio, Entrevista e Eventos.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-xs font-bold text-slate-700">
              <span>Ver todos</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects (Projetos Recentes) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Projetos recentes</h2>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-full">
              {projects.length}
            </span>
          </div>
          {projects.length > 0 && (
            <button
              onClick={onOpenProjects}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Ver todos os projetos
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            Carregando projetos do dispositivo...
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Nenhum projeto salvo ainda</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Ao criar seu primeiro post ou vídeo e clicar em &quot;Salvar&quot;, ele ficará guardado localmente no seu navegador.
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={onCreatePost}>
              Criar Post Agora
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onEditProject(proj)}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                  {proj.thumbnailUrl ? (
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  {/* Format & Type Tag */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                      {proj.format}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                      {proj.type === 'video' ? 'Vídeo' : 'Post'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {proj.name || 'Sem título'}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updatedAt).toLocaleDateString('pt-AO')}
                    </span>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(proj, e)}
                        className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(proj.id, e)}
                        className="p-1 hover:text-red-600 hover:bg-slate-100 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brand Profile Quick Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              (brand.pageName || 'C')[0]
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Identidade Configurada: {brand.pageName || 'Minha Marca'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Rodapé automático: {brand.footerEnabled ? 'Ativado' : 'Desativado'} • Logo automático: {brand.showLogo ? 'Ativado' : 'Desativado'}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={onOpenBrand}>
          Personalizar Identidade
        </Button>
      </div>
    </div>
  );
};
