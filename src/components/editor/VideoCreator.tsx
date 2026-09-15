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
import {
  checkBrowserCapabilities,
  downloadVideoBlob,
  drawVideoFrameWithOverlays,
  renderAndExportVideo,
} from '../../lib/video/videoRenderer';
import { saveProject } from '../../lib/storage/indexedDB';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Upload,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  Video as VideoIcon,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';

interface VideoCreatorProps {
  brand: BrandConfig;
  initialProject?: Project | null;
  onSaved?: (project: Project) => void;
  onNavigateBrand?: () => void;
}

// Sample short video clips hosted on public CDN for instant live testing
const SAMPLE_VIDEOS = [
  {
    name: 'Notícia / Metrópole',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    name: 'Tecnologia / Moderno',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  },
];

export const VideoCreator: React.FC<VideoCreatorProps> = ({
  brand,
  initialProject,
  onSaved,
  onNavigateBrand,
}) => {
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States
  const [format, setFormat] = useState<PostFormat>(initialProject?.format || '9:16');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialProject?.templateId || TEMPLATES[0].id
  );

  const [videoUrl, setVideoUrl] = useState<string>(
    initialProject?.mediaUrl || SAMPLE_VIDEOS[0].url
  );

  const [content, setContent] = useState<ContentData>(
    initialProject?.content || {
      category: 'NOTÍCIA',
      title: 'Empreendedores nacionais ganham apoio para expandir projetos inovadores',
      subtitle: 'Programa visa impulsionar a criação de novas oportunidades de negócio no país.',
      date: new Date().toLocaleDateString('pt-AO'),
      location: 'Luanda, Angola',
      sourceOrExtra: 'Cobertura Especial',
      urgenteBadge: false,
      liveBadge: true,
    }
  );

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Processing / Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const browserCaps = checkBrowserCapabilities();
  const selectedTemplate =
    TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  // Video metadata loading
  useEffect(() => {
    const video = hiddenVideoRef.current;
    if (!video) return;

    setIsVideoLoaded(false);
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.load();

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 10);
      setIsVideoLoaded(true);
      // Draw first frame
      drawFrame(0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  // Main Preview Animation Loop
  const drawFrame = (time: number) => {
    const canvas = previewCanvasRef.current;
    const video = hiddenVideoRef.current;
    if (!canvas || !video) return;

    const specs = FORMAT_SPECS[format] || FORMAT_SPECS['9:16'];
    const scale = 0.5; // Optimized scale for preview canvas
    canvas.width = Math.round(specs.width * scale);
    canvas.height = Math.round(specs.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawVideoFrameWithOverlays({
      ctx,
      video,
      width: canvas.width,
      height: canvas.height,
      format,
      content,
      brand,
      template: selectedTemplate,
      currentTime: time,
      duration: video.duration || 10,
      scale,
    });
  };

  useEffect(() => {
    let animId: number;
    const loop = () => {
      const video = hiddenVideoRef.current;
      if (video && !video.paused && !video.ended) {
        setCurrentTime(video.currentTime);
        drawFrame(video.currentTime);
      }
      animId = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      animId = requestAnimationFrame(loop);
    } else {
      drawFrame(currentTime);
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, format, content, brand, selectedTemplate]);

  // Controls
  const togglePlay = () => {
    const video = hiddenVideoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch((e) => console.warn(e));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    const video = hiddenVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    drawFrame(0);
    video.play().then(() => setIsPlaying(true));
  };

  const toggleMute = () => {
    const video = hiddenVideoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Upload Video file
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setFeedback({
        text: 'Formato inválido. Por favor selecione um arquivo de vídeo (MP4, WebM, MOV).',
        type: 'error',
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setFeedback({ text: 'Vídeo carregado com sucesso!', type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Export Video
  const handleExport = async () => {
    const video = hiddenVideoRef.current;
    if (!video) return;

    if (!browserCaps.isFullySupported) {
      setFeedback({
        text: 'Não foi possível processar este vídeo. Tente outro arquivo ou utilize um navegador moderno compatível com MediaRecorder.',
        type: 'error',
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setFeedback({ text: 'Gerando vídeo e aplicando elementos automáticos...', type: 'info' });

    try {
      const blob = await renderAndExportVideo({
        video,
        format,
        content,
        brand,
        template: selectedTemplate,
        onProgress: (pct) => setExportProgress(pct),
      });

      const cleanTitle = (content.title || 'video-criet')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 32);
      downloadVideoBlob(blob, `criet-${cleanTitle}-${Date.now()}.webm`);

      setFeedback({ text: 'Vídeo processado e baixado com sucesso!', type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setFeedback({
        text: `Não foi possível processar este vídeo: ${errMsg}`,
        type: 'error',
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Save Project
  const handleSave = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const thumbData = canvas.toDataURL('image/jpeg', 0.65);
      const project: Project = {
        id: initialProject?.id || 'proj_vid_' + Date.now(),
        name: content.title ? content.title.substring(0, 48) : 'Vídeo Sem Título',
        type: 'video',
        templateId: selectedTemplate.id,
        format,
        mediaUrl: videoUrl.startsWith('blob:') ? '' : videoUrl, // avoid broken blobs across sessions
        mediaType: 'video',
        content,
        brand,
        thumbnailUrl: thumbData,
        createdAt: initialProject?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await saveProject(project);
      if (onSaved) onSaved(project);

      setFeedback({ text: 'Projeto de vídeo salvo com sucesso!', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Erro ao salvar projeto localmente.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Video element used as render source */}
      <video
        ref={hiddenVideoRef}
        playsInline
        muted={isMuted}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-sm font-semibold animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : feedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs uppercase font-bold text-slate-500 hover:text-slate-800"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Flow Steps */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Step 1: Upload Video */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Upload do Vídeo</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">MP4, WebM ou MOV</span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 rounded-xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Clique para selecionar o vídeo do seu dispositivo
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Processamento 100% no seu navegador sem enviar para a nuvem
                </p>
              </div>
            </div>

            {/* Sample video buttons */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                Ou use um clipe de exemplo:
              </p>
              <div className="flex items-center gap-2">
                {SAMPLE_VIDEOS.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setVideoUrl(s.url)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      videoUrl === s.url
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Formato do Vídeo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">Escolha o formato</h3>
              </div>
              <span className="text-xs text-blue-600 font-semibold">{format}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['9:16', '1:1', '4:5', '16:9'] as PostFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    format === f
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <div className="text-sm font-extrabold">{f}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {FORMAT_SPECS[f].recommendedFor.split(',')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Informações Automáticas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">Adicionar informações</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="video-category"
                label="Categoria / Tarja"
                value={content.category}
                onChange={(e) => setContent({ ...content, category: e.target.value })}
                options={[
                  { value: 'NOTÍCIA', label: 'NOTÍCIA' },
                  { value: 'URGENTE', label: 'URGENTE' },
                  { value: 'AO VIVO', label: 'AO VIVO' },
                  { value: 'DESPORTO', label: 'DESPORTO' },
                  { value: 'ENTREVISTA', label: 'ENTREVISTA' },
                  { value: 'ANÚNCIO', label: 'ANÚNCIO' },
                ]}
              />

              <Input
                id="video-date"
                label="Data ou Informação Extra"
                value={content.date}
                onChange={(e) => setContent({ ...content, date: e.target.value })}
                placeholder="Ex: 15 de Setembro, 2026"
              />
            </div>

            <Input
              id="video-title"
              label="Título do Vídeo (Manchete)"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="Escreva o título que aparecerá na barra de notícias..."
              required
            />

            <Textarea
              id="video-subtitle"
              label="Subtítulo ou Descrição (opcional)"
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              placeholder="Texto secundário para contexto da notícia..."
              rows={2}
            />

            {/* Badges Urgente / Ao Vivo */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Switch
                id="video-urgente"
                label="Tarja URGENTE"
                description="Destaque de última hora"
                checked={!!content.urgenteBadge}
                onChange={(checked) => setContent({ ...content, urgenteBadge: checked })}
              />
              <Switch
                id="video-live"
                label="Selo AO VIVO"
                description="Pulsar indicador em tempo real"
                checked={!!content.liveBadge}
                onChange={(checked) => setContent({ ...content, liveBadge: checked })}
              />
            </div>
          </div>

          {/* Step 4: Escolher Template */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  4
                </span>
                <h3 className="text-sm font-bold text-slate-900">Escolher Template de Vídeo</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
              {TEMPLATES.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 block w-max mb-1">
                      {tpl.category}
                    </span>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{tpl.name}</p>
                  </button>
                );
              })}
            </div>

            {/* Minha Marca Info helper */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                Identidade aplicada:{' '}
                <strong className="text-slate-800">{brand.pageName || 'Padrão Criet'}</strong>
              </span>
              {onNavigateBrand && (
                <button
                  type="button"
                  onClick={onNavigateBrand}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Configurar Marca
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Video Preview & Export Controls */}
        <div className="lg:col-span-6 sticky top-20 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Pré-visualização do Vídeo</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase">
                    {format}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elementos e rodapé gerados dinamicamente sobre o vídeo.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                title="Salvar nos Meus Projetos"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Salvar
              </Button>
            </div>

            {/* Video Canvas Stage Viewport */}
            <div className="relative w-full bg-slate-950/95 rounded-xl border border-slate-800 flex items-center justify-center p-3 overflow-hidden shadow-inner min-h-[380px] sm:min-h-[480px]">
              <canvas
                ref={previewCanvasRef}
                className="max-h-[500px] max-w-full w-auto object-contain rounded-lg shadow-2xl"
              />

              {/* Player Overlay Controls */}
              <div className="absolute bottom-4 inset-x-4 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white"
                    title={isPlaying ? 'Pausar' : 'Reproduzir'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
                    title={isMuted ? 'Ativar som' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-slate-300">
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Ao Vivo no Navegador
                  </span>
                </div>
              </div>
            </div>

            {/* Export Progress Bar if rendering */}
            {isExporting && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>Gerando seu vídeo no dispositivo...</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200 rounded-full"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600">
                  Aguarde a gravação local dos frames com os elementos gráficos integrados.
                </p>
              </div>
            )}

            {/* Export CTA */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleExport}
                isLoading={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Gerar e Exportar Vídeo
              </Button>
            </div>

            {/* Browser Capability Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Processamento 100% no Navegador:</p>
                <p className="text-slate-500">
                  {browserCaps.isFullySupported
                    ? 'Seu navegador suporta gravação e renderização nativa de vídeo via MediaRecorder e Canvas.'
                    : 'Navegador com suporte parcial. O vídeo poderá ser visualizado em tempo real.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
