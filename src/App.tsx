import React, { useEffect, useState } from 'react';
import { BrandConfig, Project, Template } from './types';
import { DEFAULT_BRAND, getStoredBrand, saveBrand } from './lib/storage/indexedDB';
import { ActiveTab, Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { BrandForm } from './components/brand/BrandForm';
import { PostCreator } from './components/editor/PostCreator';
import { VideoCreator } from './components/editor/VideoCreator';
import { TemplatesGalleryView } from './views/TemplatesGalleryView';
import { ProjectsView } from './views/ProjectsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('landing');
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Load Brand from IndexedDB on mount & handle Hash routing for static hosting
  useEffect(() => {
    getStoredBrand().then((stored) => {
      if (stored) {
        setBrand(stored);
      }
    });

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      if (
        [
          'landing',
          'dashboard',
          'create-post',
          'create-video',
          'templates',
          'brand',
          'projects',
          'settings',
        ].includes(hash)
      ) {
        setCurrentTab(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab: ActiveTab) => {
    setCurrentTab(tab);
    window.location.hash = tab === 'landing' ? '' : `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveBrand = async (updatedBrand: BrandConfig) => {
    await saveBrand(updatedBrand);
    setBrand(updatedBrand);
  };

  const handleSelectTemplateFromGallery = (template: Template, type: 'image' | 'video') => {
    if (type === 'video') {
      navigateTo('create-video');
    } else {
      navigateTo('create-post');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    if (project.type === 'video') {
      navigateTo('create-video');
    } else {
      navigateTo('create-post');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onNavigate={navigateTo} brand={brand} />

      {/* Main Page Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentTab === 'landing' && (
          <LandingView
            onCreatePost={() => {
              setEditingProject(null);
              navigateTo('create-post');
            }}
            onCreateVideo={() => {
              setEditingProject(null);
              navigateTo('create-video');
            }}
            onExploreTemplates={() => navigateTo('templates')}
            onConfigureBrand={() => navigateTo('brand')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            brand={brand}
            onCreatePost={() => {
              setEditingProject(null);
              navigateTo('create-post');
            }}
            onCreateVideo={() => {
              setEditingProject(null);
              navigateTo('create-video');
            }}
            onOpenTemplates={() => navigateTo('templates')}
            onOpenBrand={() => navigateTo('brand')}
            onOpenProjects={() => navigateTo('projects')}
            onEditProject={handleEditProject}
          />
        )}

        {currentTab === 'create-post' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="text-left">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingProject ? `Editando Post: ${editingProject.name}` : 'Criar Novo Post'}
                </h1>
                <p className="text-xs text-slate-500">
                  Adicione a imagem e o texto. O Criet monta sua publicação automaticamente.
                </p>
              </div>
              {editingProject && (
                <button
                  onClick={() => setEditingProject(null)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Novo post em branco
                </button>
              )}
            </div>

            <PostCreator
              brand={brand}
              initialProject={editingProject}
              onSaved={() => {}}
              onNavigateBrand={() => navigateTo('brand')}
            />
          </div>
        )}

        {currentTab === 'create-video' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="text-left">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingProject ? `Editando Vídeo: ${editingProject.name}` : 'Criar Novo Vídeo'}
                </h1>
                <p className="text-xs text-slate-500">
                  Faça upload do clipe. Barras de notícia, logo e rodapé animados aplicados localmente.
                </p>
              </div>
              {editingProject && (
                <button
                  onClick={() => setEditingProject(null)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Novo vídeo em branco
                </button>
              )}
            </div>

            <VideoCreator
              brand={brand}
              initialProject={editingProject}
              onSaved={() => {}}
              onNavigateBrand={() => navigateTo('brand')}
            />
          </div>
        )}

        {currentTab === 'templates' && (
          <TemplatesGalleryView onSelectTemplate={handleSelectTemplateFromGallery} />
        )}

        {currentTab === 'brand' && (
          <div className="space-y-6">
            <div className="text-left border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Minha Marca & Identidade Visual
              </h1>
              <p className="text-xs text-slate-500">
                Personalize os dados oficiais da sua página ou empresa para reutilização automática em todos os posts e vídeos.
              </p>
            </div>
            <BrandForm brand={brand} onSave={handleSaveBrand} />
          </div>
        )}

        {currentTab === 'projects' && (
          <ProjectsView
            onEditProject={handleEditProject}
            onCreatePost={() => {
              setEditingProject(null);
              navigateTo('create-post');
            }}
            onCreateVideo={() => {
              setEditingProject(null);
              navigateTo('create-video');
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView brand={brand} onBrandUpdated={setBrand} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
