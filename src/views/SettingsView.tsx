import React, { useEffect, useState } from 'react';
import { BrandConfig, Project } from '../types';
import { checkBrowserCapabilities } from '../lib/video/videoRenderer';
import {
  clearAllProjects,
  getAllProjects,
  saveBrand,
  saveProject,
  DEFAULT_BRAND,
} from '../lib/storage/indexedDB';
import {
  convertFileToBase64,
  getLocalStorageStats,
  clearLocalStorageBrand,
} from '../lib/storage/base64Helper';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import {
  Settings,
  ShieldCheck,
  HardDrive,
  Cpu,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Code2,
  Database,
  FileCode,
  Sparkles,
  Palette,
  Eye,
  Copy,
  RotateCcw,
} from 'lucide-react';

interface SettingsViewProps {
  brand: BrandConfig;
  onBrandUpdated: (brand: BrandConfig) => void;
}

const PRESET_COLORS = [
  { name: 'Azul Criet', primary: '#1D4ED8', secondary: '#0F172A' },
  { name: 'Vermelho Notícia', primary: '#DC2626', secondary: '#0F172A' },
  { name: 'Verde Desporto', primary: '#059669', secondary: '#0B132B' },
  { name: 'Laranja Impacto', primary: '#EA580C', secondary: '#18181B' },
  { name: 'Roxo Premium', primary: '#7C3AED', secondary: '#090D16' },
  { name: 'Preto Minimalista', primary: '#0F172A', secondary: '#1E293B' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ brand, onBrandUpdated }) => {
  const [caps, setCaps] = useState(checkBrowserCapabilities());
  const [quota, setQuota] = useState<{ usage: number; quota: number } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // LocalStorage Brand Form State
  const [formData, setFormData] = useState<BrandConfig>({ ...brand });
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandSavedNotice, setBrandSavedNotice] = useState(false);
  const [lsStats, setLsStats] = useState(getLocalStorageStats());
  const [copiedBase64, setCopiedBase64] = useState(false);

  // Sync internal form data if parent brand changes
  useEffect(() => {
    setFormData({ ...brand });
    setLsStats(getLocalStorageStats());
  }, [brand]);

  useEffect(() => {
    setCaps(checkBrowserCapabilities());
    setLsStats(getLocalStorageStats());
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage !== undefined && est.quota !== undefined) {
          setQuota({ usage: est.usage, quota: est.quota });
        }
      });
    }
  }, []);

  // Handle Logo Upload and Convert to Base64
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ text: 'Por favor selecione um arquivo de imagem (PNG, JPG, WebP, SVG).', type: 'error' });
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      const kb = (base64.length * 2 / 1024).toFixed(1);
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
      setFeedback({
        text: `Logo convertida para Base64 (${kb} KB)! Clique em "Salvar no LocalStorage" para aplicar.`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Falha ao converter imagem para Base64.', type: 'error' });
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleCopyBase64 = () => {
    if (!formData.logoUrl) return;
    navigator.clipboard.writeText(formData.logoUrl).then(() => {
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    });
  };

  // Save Brand into LocalStorage & IndexedDB
  const handleSaveBrandToLocalStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBrand(true);
    setBrandSavedNotice(false);

    try {
      await saveBrand(formData);
      onBrandUpdated(formData);
      setLsStats(getLocalStorageStats());
      setBrandSavedNotice(true);
      setFeedback({
        text: 'Identidade visual e contatos salvos no LocalStorage do usuário com sucesso!',
        type: 'success',
      });
      setTimeout(() => {
        setBrandSavedNotice(false);
        setFeedback(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Erro ao salvar no LocalStorage.', type: 'error' });
    } finally {
      setIsSavingBrand(false);
    }
  };

  // Reset Brand to Default in LocalStorage
  const handleResetBrand = async () => {
    if (confirm('Deseja restaurar as configurações padrão da marca? Isso limpará a logo e os contatos salvos no LocalStorage.')) {
      clearLocalStorageBrand();
      await saveBrand(DEFAULT_BRAND);
      setFormData({ ...DEFAULT_BRAND });
      onBrandUpdated(DEFAULT_BRAND);
      setLsStats(getLocalStorageStats());
      setFeedback({ text: 'Marca redefinida para os padrões no LocalStorage.', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Export Full Backup
  const handleExportBackup = async () => {
    try {
      const projects = await getAllProjects();
      const backupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        brand: formData,
        projects,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `criet-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setFeedback({ text: 'Backup exportado com sucesso!', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Erro ao exportar dados locais.', type: 'error' });
    }
  };

  // Import Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);

        if (parsed.brand) {
          await saveBrand(parsed.brand);
          setFormData(parsed.brand);
          onBrandUpdated(parsed.brand);
          setLsStats(getLocalStorageStats());
        }

        if (Array.isArray(parsed.projects)) {
          for (const proj of parsed.projects) {
            await saveProject(proj);
          }
        }

        setFeedback({
          text: `Backup restaurado com sucesso! (${parsed.projects?.length || 0} projetos importados)`,
          type: 'success',
        });
        setTimeout(() => setFeedback(null), 4000);
      } catch (err) {
        console.error(err);
        setFeedback({ text: 'Arquivo de backup inválido ou corrompido.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Clear Storage
  const handleClearData = async () => {
    if (confirm('Tem certeza que deseja apagar todos os projetos salvos localmente? Esta ação é irreversível.')) {
      await clearAllProjects();
      setFeedback({ text: 'Projetos locais apagados com sucesso.', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-8 text-left py-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
          <Settings className="w-3.5 h-3.5" />
          Configurações & Diagnóstico
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Configurações da Plataforma
        </h1>
        <p className="text-slate-600 text-sm">
          Gerencie sua identidade visual, contatos e arquivos convertidos para Base64 no LocalStorage do seu navegador.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl border text-sm font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FORMULÁRIO DE MARCA, LOGO BASE64 E CONTATOS NO LOCALSTORAGE           */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header with Storage Indicators */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Formulário da Marca & Contatos (LocalStorage)
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Guarde sua logo convertida em Base64, nome, contatos e cores salvos no navegador para uso em todos os posts e vídeos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              LocalStorage Ativo
            </span>
          </div>
        </div>

        {/* Diagnostic Chips */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div>
            Tamanho da Marca no LocalStorage:{' '}
            <strong className="text-slate-900 font-mono">{lsStats.brandSizeKB} KB</strong>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            Logo em Base64:{' '}
            {lsStats.hasLogo ? (
              <strong className="text-emerald-700 font-mono">{lsStats.logoBase64SizeKB} KB (Salva)</strong>
            ) : (
              <span className="text-slate-400">Nenhuma logo armazenada</span>
            )}
          </div>
          <span className="text-slate-300">•</span>
          <div>
            Uso total do LocalStorage:{' '}
            <strong className="text-slate-900 font-mono">{lsStats.totalUsageKB} KB</strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveBrandToLocalStorage} className="p-6 space-y-6">
          {/* Logo Upload Box (Base64) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Logo da Marca / Página (Armazenamento em Base64)
              </label>
              {formData.logoUrl && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBase64}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Copiar código Base64 da logo"
                  >
                    <Copy className="w-3 h-3 text-blue-600" />
                    {copiedBase64 ? 'Copiado!' : 'Copiar Base64'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              {formData.logoUrl ? (
                <div className="relative w-28 h-28 rounded-xl border-2 border-slate-300 bg-slate-900 p-2.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group">
                  <img
                    src={formData.logoUrl}
                    alt="Logo em Base64"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 text-[9px] text-white text-center py-0.5 font-mono">
                    Base64
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-2 text-center flex-shrink-0">
                  <FileCode className="w-6 h-6 mb-1 text-slate-400" />
                  <span className="text-[10px] font-semibold">Sem logo salva</span>
                </div>
              )}

              <div className="flex-1 space-y-2 text-left">
                <label
                  htmlFor="settings-logo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {formData.logoUrl ? 'Substituir Imagem da Logo' : 'Fazer Upload da Logo'}
                </label>
                <input
                  id="settings-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <p className="text-xs text-slate-600 leading-relaxed">
                  A imagem selecionada é convertida automaticamente pelo navegador em formato <strong>Base64 Data URL</strong> e gravada diretamente no seu <strong>LocalStorage</strong>. Recomenda-se imagem com fundo transparente (PNG ou SVG).
                </p>
              </div>
            </div>
          </div>

          {/* Nome e Slogan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="settings-brand-name"
              label="Nome da Página / Marca / Empresa"
              placeholder="Ex: Minha Empresa, Portal de Notícias, Meu Canal, Jornal..."
              value={formData.pageName}
              onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
              required
            />
            <Input
              id="settings-brand-additional"
              label="Slogan ou Texto Institucional"
              placeholder="Ex: Informação independente e jornalismo ágil."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            />
          </div>

          {/* Contatos Oficiais (Inseridos nos Rodapés dos Posts e Vídeos) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Contatos Oficiais (Aplicados no Rodapé das Publicações)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="settings-instagram"
                label="@Instagram"
                placeholder="@suapagina"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
              <Input
                id="settings-phone"
                label="WhatsApp / Telefone"
                placeholder="+244 923 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="settings-website"
                label="Website Oficial"
                placeholder="www.suapagina.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <Input
                id="settings-email"
                label="E-mail de Contato"
                placeholder="contato@suapagina.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Input
              id="settings-facebook"
              label="Página do Facebook (opcional)"
              placeholder="facebook.com/suapagina"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            />
          </div>

          {/* Cores da Identidade Visual */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cores da Identidade
              </label>
              <span className="text-[11px] text-slate-500">
                Usadas nas tarjas, tags, títulos e rodapés
              </span>
            </div>

            {/* Presets rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                    })
                  }
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                    formData.primaryColor === preset.primary
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white flex-shrink-0"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="truncate text-[11px]">{preset.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">Cor Primária (Destaques e Tags)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor || '#1D4ED8'}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">Cor Secundária (Fundo e Contraste)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor || '#0F172A'}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Switches */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <Switch
              id="settings-show-logo"
              label="Exibir logo automaticamente nas publicações"
              description="Insere o logo Base64 no cabeçalho dos posts e vídeos criados."
              checked={formData.showLogo}
              onChange={(checked) => setFormData({ ...formData, showLogo: checked })}
            />
            <Switch
              id="settings-footer-enabled"
              label="Ativar rodapé automático com contatos"
              description="Exibe barra inferior contendo @Instagram, telefone e website nas artes geradas."
              checked={formData.footerEnabled}
              onChange={(checked) => setFormData({ ...formData, footerEnabled: checked })}
            />
          </div>

          {/* Visual Preview of Resulting Header & Footer */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Prévia do Cabeçalho e Rodapé que serão inseridos
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-800 rounded">
                Simulação
              </span>
            </div>

            {/* Header preview */}
            <div className="p-3 bg-slate-800/80 rounded-lg flex items-center justify-between">
              {formData.showLogo && formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="h-6 w-auto max-w-[120px] object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: formData.primaryColor }} />
                  <span className="text-xs font-bold">{formData.pageName || 'Nome da Sua Marca'}</span>
                </div>
              )}
              <span
                className="px-2 py-0.5 text-[10px] font-bold rounded text-white uppercase"
                style={{ backgroundColor: formData.primaryColor }}
              >
                CATEGORIA
              </span>
            </div>

            {/* Footer preview */}
            {formData.footerEnabled ? (
              <div className="p-2.5 bg-slate-800/60 rounded-lg flex flex-wrap items-center justify-between text-[11px] font-medium text-slate-300">
                <span>{formData.instagram || '@suapagina'}</span>
                <span>{[formData.phone, formData.website].filter(Boolean).join(' • ') || 'Contatos'}</span>
              </div>
            ) : (
              <div className="p-2 text-center text-[10px] text-slate-500 italic">
                Rodapé automático desativado
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSavingBrand}
              className="w-full sm:w-auto"
            >
              <Database className="w-4 h-4 mr-2" />
              Salvar no LocalStorage
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleResetBrand}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2 text-slate-500" />
              Restaurar Padrões
            </Button>

            {brandSavedNotice && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in sm:ml-auto">
                <CheckCircle2 className="w-4 h-4" />
                Marca salva no LocalStorage!
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-emerald-950">
            Armazenamento 100% no seu dispositivo
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            O Criet processa imagens, vídeos, logos e textos diretamente no navegador via HTML5 Canvas e Web APIs. As fotos e logos convertidas em Base64 permanecem salvas na memória local (LocalStorage e IndexedDB) do seu próprio computador ou celular, sem upload para nenhum servidor.
          </p>
        </div>
      </div>

      {/* Browser Capabilities Diagnostic */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-slate-900">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold">Diagnóstico de Recursos do Navegador</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700">Canvas 2D Rendering</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Suportado
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700">MediaRecorder API</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                caps.hasMediaRecorder
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-amber-700 bg-amber-100'
              }`}
            >
              {caps.hasMediaRecorder ? 'Suportado' : 'Indisponível'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700">Canvas captureStream</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                caps.hasCanvasCaptureStream
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-amber-700 bg-amber-100'
              }`}
            >
              {caps.hasCanvasCaptureStream ? 'Suportado' : 'Indisponível'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700">Formato de Gravação Nativo</span>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              {caps.supportedMimeType ? caps.supportedMimeType.split(';')[0] : 'Nenhum'}
            </span>
          </div>
        </div>
      </div>

      {/* Storage Management & Backups */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-slate-900">
          <HardDrive className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold">Armazenamento Local (IndexedDB & LocalStorage)</h3>
        </div>

        {quota && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Espaço em disco estimado para o Criet:</span>
              <span className="font-mono">
                {(quota.usage / (1024 * 1024)).toFixed(2)} MB usados
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button variant="outline" size="md" onClick={handleExportBackup} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2 text-blue-600" />
            Fazer Backup Completo (JSON)
          </Button>

          <label className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
            <Upload className="w-4 h-4 mr-2 text-blue-600" />
            Restaurar Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <Button
            variant="danger"
            size="md"
            onClick={handleClearData}
            className="w-full sm:w-auto ml-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Projetos Salvos
          </Button>
        </div>
      </div>

      {/* Static Hosting & GitHub Pages info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold">Hospedagem Estática 100% Frontend</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          O Criet é 100% estático, sem necessidade de servidores Node, Flask, PHP ou bancos de dados SQL externos. Ao compilar com <code className="px-1.5 py-0.5 bg-slate-100 rounded text-blue-600 font-mono text-[11px]">npm run build</code>, a pasta <code className="px-1.5 py-0.5 bg-slate-100 rounded text-blue-600 font-mono text-[11px]">dist/</code> gerada pode ser publicada diretamente no GitHub Pages, Vercel, Netlify ou qualquer CDN estático.
        </p>
      </div>
    </div>
  );
};

