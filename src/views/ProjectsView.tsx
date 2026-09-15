import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import {
  getAllProjects,
  deleteProject,
  duplicateProject,
  clearAllProjects,
} from '../lib/storage/indexedDB';
import { Button } from '../components/ui/Button';
import {
  FolderKanban,
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';

interface ProjectsViewProps {
  onEditProject: (project: Project) => void;
  onCreatePost: () => void;
  onCreateVideo: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onEditProject,
  onCreatePost,
  onCreateVideo,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
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
    if (confirm('Deseja realmente excluir este projeto?')) {
      await deleteProject(id);
      loadProjects();
    }
  };

  const handleDuplicate = async (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateProject(proj);
    loadProjects();
  };

  const handleDownloadThumbnail = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!proj.thumbnailUrl) return;
    const link = document.createElement('a');
    link.href = proj.thumbnailUrl;
    link.download = `${proj.name.toLowerCase().replace(/\s+/g, '-')}-preview.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = projects.filter((p) => {
    const matchType = filterType === 'all' || p.type === filterType;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-8 text-left py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            Armazenamento Local
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meus Projetos</h1>
          <p className="text-slate-600 text-sm">
            Projetos salvos no IndexedDB do seu navegador.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="primary" onClick={onCreatePost}>
            <ImageIcon className="w-4 h-4 mr-1.5" />
            Novo Post
          </Button>
          <Button size="sm" variant="outline" onClick={onCreateVideo}>
            <VideoIcon className="w-4 h-4 mr-1.5 text-blue-600" />
            Novo Vídeo
          </Button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'image', label: 'Posts (Imagens)' },
            { id: 'video', label: 'Vídeos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as 'all' | 'image' | 'video')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Carregando projetos salvos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Nenhum projeto encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? 'Nenhum resultado para os termos pesquisados.'
                : 'Você ainda não salvou projetos nesta categoria.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="sm" variant="primary" onClick={onCreatePost}>
              Criar Post
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateVideo}>
              Criar Vídeo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((proj) => (
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

                {/* Tags */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                    {proj.format}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                    {proj.type === 'video' ? 'Vídeo' : 'Post'}
                  </span>
                </div>
              </div>

              {/* Information & Actions */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {proj.name || 'Sem título'}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {proj.content.title}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(proj.updatedAt).toLocaleDateString('pt-AO')}
                  </span>

                  <div className="flex items-center gap-1">
                    {proj.thumbnailUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleDownloadThumbnail(proj, e)}
                        className="p-1.5 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        title="Baixar imagem prévia"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(proj, e)}
                      className="p-1.5 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                      title="Duplicar projeto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(proj.id, e)}
                      className="p-1.5 hover:text-red-600 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                      title="Excluir projeto"
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
  );
};
