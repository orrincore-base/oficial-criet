import React, { useState } from 'react';
import { PostFormat, Template } from '../types';
import { CATEGORIES, TEMPLATES } from '../lib/templates/defaultTemplates';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, Layers, Check } from 'lucide-react';

interface TemplatesGalleryViewProps {
  onSelectTemplate: (template: Template, type: 'image' | 'video') => void;
}

export const TemplatesGalleryView: React.FC<TemplatesGalleryViewProps> = ({
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedFormat, setSelectedFormat] = useState<string>('TODOS');

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchCat =
      selectedCategory === 'TODOS' || tpl.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchFmt =
      selectedFormat === 'TODOS' || tpl.supportedFormats.includes(selectedFormat as PostFormat);
    return matchCat && matchFmt;
  });

  return (
    <div className="space-y-8 text-left py-2">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          Catálogo Reutilizável
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Templates Profissionais
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Modelos padronizados com hierarquia visual precisa para notícias, esportes, comunicados e redes sociais.
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Format Sub-filter */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Formato:</span>
          {['TODOS', '4:5', '1:1', '9:16', '16:9'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedFormat === fmt
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Visual Header / Mockup representation */}
            <div
              className={`h-44 bg-gradient-to-br ${template.thumbnailGradient} p-5 text-white flex flex-col justify-between relative`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs tracking-wider border border-white/10">
                  {template.category}
                </span>

                <div className="flex items-center gap-1">
                  {template.supportedFormats.map((f) => (
                    <span
                      key={f}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample headline simulation */}
              <div className="space-y-1.5">
                <div className="w-12 h-1 rounded-full bg-white/40" />
                <p className="text-sm font-extrabold leading-snug line-clamp-2">
                  {template.name} — Identidade visual consistente
                </p>
                <p className="text-[10px] text-white/70">
                  Rodapé e marca aplicados automaticamente
                </p>
              </div>
            </div>

            {/* Description & Usage */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">{template.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{template.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => onSelectTemplate(template, 'image')}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Criar Post
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectTemplate(template, 'video')}
                >
                  Criar Vídeo
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
