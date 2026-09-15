import React, { useEffect, useRef, useState } from 'react';
import {
  BrandConfig,
  ContentData,
  FORMAT_SPECS,
  PostFormat,
  Project,
  Template,
} from '../../types';
import { TEMPLATES } from '../../lib/templates/defaultTemplates';
import { downloadCanvasImage, loadImage, renderPostToCanvas } from '../../lib/canvas/imageRenderer';
import { saveProject } from '../../lib/storage/indexedDB';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import {
  Upload,
  Download,
  Save,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Layers,
  FileCheck,
} from 'lucide-react';

interface PostCreatorProps {
  brand: BrandConfig;
  initialProject?: Project | null;
  onSaved?: (project: Project) => void;
  onNavigateBrand?: () => void;
}

// Sample photography for immediate testing without needing to find a file
const SAMPLE_PHOTOS = [
  {
    name: 'Notícia / Cidade',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&auto=format&fit=crop&q=80',
  },
  {
    name: 'Desporto / Futebol',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1080&auto=format&fit=crop&q=80',
  },
  {
    name: 'Conferência / Negócios',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tecnologia / Estudo',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&auto=format&fit=crop&q=80',
  },
];

export const PostCreator: React.FC<PostCreatorProps> = ({
  brand,
  initialProject,
  onSaved,
  onNavigateBrand,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active step or current selections
  const [format, setFormat] = useState<PostFormat>(initialProject?.format || '4:5');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialProject?.templateId || TEMPLATES[0].id
  );

  const [imageUrl, setImageUrl] = useState<string>(
    initialProject?.mediaUrl || SAMPLE_PHOTOS[0].url
  );
  const [loadedImageElement, setLoadedImageElement] = useState<HTMLImageElement | null>(null);

  const [content, setContent] = useState<ContentData>(
    initialProject?.content || {
      category: 'NOTÍCIA',
      title: 'Governo anuncia novas medidas de apoio aos jovens empreendedores',
      subtitle: 'Programa nacional prevê financiamento facilitado e mentoria técnica especializada para projetos de inovação.',
      date: new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' }),
      location: 'Luanda, Angola',
      sourceOrExtra: 'Fonte Oficial',
      urgenteBadge: false,
      liveBadge: false,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectedTemplate =
    TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  // Load Image element whenever URL changes
  useEffect(() => {
    if (!imageUrl) {
      setLoadedImageElement(null);
      return;
    }
    let isCancelled = false;
    loadImage(imageUrl)
      .then((img) => {
        if (!isCancelled) setLoadedImageElement(img);
      })
      .catch((err) => {
        console.warn('Erro ao carregar imagem para canvas:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  // Re-render canvas whenever any input changes
  useEffect(() => {
    if (!canvasRef.current) return;
    renderPostToCanvas({
      canvas: canvasRef.current,
      format,
      image: loadedImageElement,
      content,
      brand,
      template: selectedTemplate,
      scale: 1, // high quality
    });
  }, [format, loadedImageElement, content, brand, selectedTemplate]);

  // Handle local file upload
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedbackMessage({ text: 'Selecione um arquivo de imagem (PNG, JPG, WebP).', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      setFeedbackMessage({ text: 'Imagem carregada com sucesso!', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Download Post
  const handleDownload = (formatType: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    setFeedbackMessage({ text: 'Gerando sua publicação em alta definição...', type: 'success' });

    try {
      const cleanTitle = (content.title || 'post-criet')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 32);
      const filename = `criet-${cleanTitle}-${Date.now()}`;
      downloadCanvasImage(canvasRef.current, filename, formatType);

      setTimeout(() => {
        setFeedbackMessage({ text: 'Download concluído com sucesso!', type: 'success' });
        setIsExporting(false);
        setTimeout(() => setFeedbackMessage(null), 3000);
      }, 600);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setFeedbackMessage({ text: 'Erro ao gerar imagem para download.', type: 'error' });
    }
  };

  // Save Project in IndexedDB
  const handleSaveProject = async () => {
    if (!canvasRef.current) return;
    setIsSaving(true);
    try {
      // Get preview thumbnail data URL (scaled down for efficient storage)
      const thumbData = canvasRef.current.toDataURL('image/jpeg', 0.65);

      const project: Project = {
        id: initialProject?.id || 'proj_' + Date.now(),
        name: content.title ? content.title.substring(0, 48) : 'Post Sem Título',
        type: 'image',
        templateId: selectedTemplate.id,
        format,
        mediaUrl: imageUrl,
        mediaType: 'image',
        content,
        brand,
        thumbnailUrl: thumbData,
        createdAt: initialProject?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await saveProject(project);
      if (onSaved) onSaved(project);

      setFeedbackMessage({ text: 'Projeto salvo nos seus Projetos!', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ text: 'Erro ao salvar projeto localmente.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {feedbackMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs uppercase tracking-wider text-slate-500 hover:text-slate-800"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Grid: Left Controls (Steps) | Right Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Easy 3-step Controls */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Step 1: Escolha uma Imagem */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Escolha o conteúdo</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Upload ou exemplo</span>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 hover:border-blue-400 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Clique para enviar ou arraste a imagem
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  PNG, JPG ou WebP de qualquer dimensão
                </p>
              </div>
            </div>

            {/* Quick Sample Photos */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                Ou use uma foto de exemplo para testar:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => setImageUrl(sample.url)}
                    className={`group relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      imageUrl === sample.url
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-end p-1">
                      <span className="text-[9px] font-bold text-white truncate w-full">
                        {sample.name.split('/')[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Adicione as Informações */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">Adicione as informações</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="post-category"
                label="Categoria / Assunto"
                value={content.category}
                onChange={(e) => setContent({ ...content, category: e.target.value })}
                options={[
                  { value: 'NOTÍCIA', label: 'NOTÍCIA' },
                  { value: 'DESPORTO', label: 'DESPORTO' },
                  { value: 'CURIOSIDADE', label: 'CURIOSIDADE' },
                  { value: 'ANÚNCIO', label: 'ANÚNCIO' },
                  { value: 'URGENTE', label: 'URGENTE' },
                  { value: 'AO VIVO', label: 'AO VIVO' },
                  { value: 'ENTREVISTA', label: 'ENTREVISTA' },
                  { value: 'EVENTO', label: 'EVENTO' },
                  { value: 'PROMOÇÃO', label: 'PROMOÇÃO' },
                ]}
              />

              <Input
                id="post-date"
                label="Data da Publicação"
                value={content.date}
                onChange={(e) => setContent({ ...content, date: e.target.value })}
                placeholder="Ex: 15 de Setembro, 2026"
              />
            </div>

            <Input
              id="post-title"
              label="Título Principal"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="Escreva a manchete ou frase principal..."
              required
            />

            <Textarea
              id="post-subtitle"
              label="Subtítulo / Descrição Resumida (opcional)"
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              placeholder="Breve texto complementar para dar contexto à notícia..."
              rows={2}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="post-location"
                label="Local / Cidade"
                value={content.location}
                onChange={(e) => setContent({ ...content, location: e.target.value })}
                placeholder="Ex: Luanda, Angola"
              />
              <Input
                id="post-source"
                label="Fonte ou Informação Extra"
                value={content.sourceOrExtra}
                onChange={(e) => setContent({ ...content, sourceOrExtra: e.target.value })}
                placeholder="Ex: Agência de Notícias / Redação Oficial"
              />
            </div>

            {/* Badges Urgente / Ao Vivo */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Switch
                id="post-urgente"
                label="Tarja URGENTE"
                description="Alerta vermelho imediato"
                checked={!!content.urgenteBadge}
                onChange={(checked) => setContent({ ...content, urgenteBadge: checked })}
              />
              <Switch
                id="post-live"
                label="Selo AO VIVO"
                description="Indicador de transmissão"
                checked={!!content.liveBadge}
                onChange={(checked) => setContent({ ...content, liveBadge: checked })}
              />
            </div>
          </div>

          {/* Step 3: Escolha o Modelo & Formato */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-900">Escolha o modelo e formato</h3>
              </div>
              <span className="text-xs text-blue-600 font-semibold">
                {TEMPLATES.length} modelos prontos
              </span>
            </div>

            {/* Format Selector Pills */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Proporção do Post
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(FORMAT_SPECS) as PostFormat[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      format === f
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="font-bold">{f}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {FORMAT_SPECS[f].label.split(' ')[1]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Card Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Modelos Visuais
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {TEMPLATES.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        if (tpl.category !== 'TODOS') {
                          setContent((prev) => ({ ...prev, category: tpl.category }));
                        }
                      }}
                      className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tpl.category}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{tpl.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minha Marca Info helper */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  Marca ativa:{' '}
                  <strong className="text-slate-800">{brand.pageName || 'Padrão Criet'}</strong>
                </span>
              </div>
              {onNavigateBrand && (
                <button
                  type="button"
                  onClick={onNavigateBrand}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Alterar Marca
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Instant Visual Preview & Export */}
        <div className="lg:col-span-6 sticky top-20 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Pré-visualização Instantânea</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase">
                    {format} • {FORMAT_SPECS[format].width}×{FORMAT_SPECS[format].height}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atualizada em tempo real conforme você digita.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProject}
                isLoading={isSaving}
                title="Salvar nos Meus Projetos"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Salvar
              </Button>
            </div>

            {/* Canvas Stage Viewport */}
            <div className="relative w-full bg-slate-950/95 rounded-xl border border-slate-800 flex items-center justify-center p-3 overflow-hidden shadow-inner min-h-[380px] sm:min-h-[500px]">
              <canvas
                ref={canvasRef}
                className="max-h-[520px] max-w-full w-auto object-contain rounded-lg shadow-2xl transition-all"
              />

              {/* High-res badge */}
              <div className="absolute top-5 right-5 pointer-events-none">
                <span className="px-2 py-1 text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white/90 rounded border border-white/15">
                  HD • {FORMAT_SPECS[format].width}px
                </span>
              </div>
            </div>

            {/* Download & Export CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:flex-1"
                onClick={() => handleDownload('png')}
                isLoading={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Imagem (PNG)
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => handleDownload('jpeg')}
                disabled={isExporting}
              >
                Baixar JPG
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <span>• Sem marca d&apos;água de terceiros</span>
              <span>• Cores calibradas</span>
              <span>• 100% Processamento Local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
