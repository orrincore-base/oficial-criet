import React, { useState } from 'react';
import { BrandConfig } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import {
  Upload,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Building2,
  Database,
  FileCode,
} from 'lucide-react';
import { convertFileToBase64 } from '../../lib/storage/base64Helper';

interface BrandFormProps {
  brand: BrandConfig;
  onSave: (updated: BrandConfig) => Promise<void>;
}

const PRESET_COLORS = [
  { name: 'Azul Criet', primary: '#1D4ED8', secondary: '#0F172A' },
  { name: 'Vermelho Notícia', primary: '#DC2626', secondary: '#0F172A' },
  { name: 'Verde Desporto', primary: '#059669', secondary: '#0B132B' },
  { name: 'Laranja Impacto', primary: '#EA580C', secondary: '#18181B' },
  { name: 'Roxo Premium', primary: '#7C3AED', secondary: '#090D16' },
  { name: 'Preto Minimalista', primary: '#0F172A', secondary: '#1E293B' },
];

export const BrandForm: React.FC<BrandFormProps> = ({ brand, onSave }) => {
  const [formData, setFormData] = useState<BrandConfig>({ ...brand });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoInfo, setLogoInfo] = useState<string | null>(() => {
    if (brand.logoUrl && brand.logoUrl.startsWith('data:')) {
      const kb = (brand.logoUrl.length * 2 / 1024).toFixed(1);
      return `Base64 (${kb} KB) no LocalStorage`;
    }
    return null;
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um arquivo de imagem válido (PNG, JPG, WebP, SVG).');
      return;
    }

    try {
      // Convert image to optimized Base64 data URL for LocalStorage
      const base64 = await convertFileToBase64(file);
      const kb = (base64.length * 2 / 1024).toFixed(1);
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
      setLogoInfo(`Convertida para Base64 (${kb} KB) • Pronta para LocalStorage`);
    } catch (err) {
      console.error(err);
      alert('Falha ao converter imagem para Base64.');
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    setLogoInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Personalize sua identidade e contatos
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Qualquer usuário ou canal pode adicionar sua própria logo, dados e cores. O Criet aplica automaticamente em todos os seus posts e vídeos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 flex-shrink-0">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          Salvo no LocalStorage do navegador (Base64)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Informações Principais */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Dados da Página ou Empresa
            </h4>

            <Input
              id="brand-name"
              label="Nome da Página / Marca / Veículo"
              placeholder="Ex: Minha Empresa, Portal de Notícias, Meu Canal, Jornal..."
              value={formData.pageName}
              onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
              required
            />

            {/* Logo Upload Box */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Logo da Marca (Base64)</label>
                {logoInfo && (
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    {logoInfo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {formData.logoUrl ? (
                  <div className="relative w-24 h-24 rounded-2xl border-2 border-slate-200 bg-slate-900 p-2 flex items-center justify-center overflow-hidden group">
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      title="Remover logo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <Upload className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-[10px] font-medium leading-tight">Sem logo</span>
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="logo-upload-input"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    {formData.logoUrl ? 'Substituir Logo (Base64)' : 'Enviar Logo (PNG / JPG / SVG)'}
                  </label>
                  <input
                    id="logo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <p className="text-[11px] text-slate-500">
                    A logo é automaticamente convertida em <strong>Base64</strong> e persistida no seu <strong>LocalStorage</strong> para acesso contínuo.
                  </p>
                </div>
              </div>
            </div>

            {/* Switches */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <Switch
                id="show-logo-switch"
                label="Exibir logo automaticamente nas publicações"
                description="Se desativado, usará o nome da marca em formato texto estilizado."
                checked={formData.showLogo}
                onChange={(checked) => setFormData({ ...formData, showLogo: checked })}
              />
              <Switch
                id="enable-footer-switch"
                label="Ativar rodapé automático"
                description="Insere a barra inferior com @Instagram, telefone e contatos oficiais."
                checked={formData.footerEnabled}
                onChange={(checked) => setFormData({ ...formData, footerEnabled: checked })}
              />
            </div>
          </div>

          {/* Section 2: Redes e Contatos */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Redes Sociais e Contatos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="brand-instagram"
                label="@Instagram"
                placeholder="@suapagina"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
              <Input
                id="brand-phone"
                label="Telefone / WhatsApp"
                placeholder="+244 923 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="brand-website"
                label="Website Oficial"
                placeholder="www.suapagina.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <Input
                id="brand-email"
                label="E-mail de Contato"
                placeholder="contato@suapagina.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Input
              id="brand-facebook"
              label="Página do Facebook (opcional)"
              placeholder="facebook.com/suapagina"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            />

            <Textarea
              id="brand-additional"
              label="Texto ou Slogan Institucional"
              placeholder="Ex: Informação independente e jornalismo rigoroso."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              rows={2}
            />
          </div>

          {/* Section 3: Paleta de Cores */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Cores da Identidade Visual
            </h4>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Paletas Prontas Recomendadas</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                      formData.primaryColor === preset.primary
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex -space-x-1">
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">Cor Principal (Destaque e Tags)</label>
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

          {/* Submit Action */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSaving}
              className="w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Salvar Identidade da Marca
            </Button>
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4" />
                Configurações salvas localmente!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mockup Card Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="sticky top-24 space-y-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900">Prévia da Identidade em Ação</h4>
              <p className="text-xs text-slate-500">
                Veja como o cabeçalho, logo e rodapé aparecerão automaticamente nos seus conteúdos.
              </p>
            </div>

            {/* Simulated Live Post Card */}
            <div
              className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between p-5 text-white"
              style={{
                backgroundColor: formData.secondaryColor || '#0F172A',
                backgroundImage:
                  'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.25), transparent 70%)',
              }}
            >
              {/* Simulated Header */}
              <div className="flex items-center justify-between">
                {formData.showLogo && formData.logoUrl ? (
                  <div className="px-3 py-1.5 bg-slate-900/80 rounded-xl border border-white/10 flex items-center gap-2">
                    <img
                      src={formData.logoUrl}
                      alt="Preview logo"
                      className="h-6 w-auto max-w-[100px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-slate-900/80 rounded-xl border border-white/10 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: formData.primaryColor || '#1D4ED8' }}
                    />
                    <span className="text-xs font-bold tracking-tight">
                      {formData.pageName || 'Nome da Página'}
                    </span>
                  </div>
                )}

                <span
                  className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-md tracking-wider text-white"
                  style={{ backgroundColor: formData.primaryColor || '#1D4ED8' }}
                >
                  NOTÍCIA
                </span>
              </div>

              {/* Simulated Center / Content */}
              <div className="space-y-2 mt-auto mb-4">
                <div className="h-1.5 w-16 bg-blue-500 rounded-full" />
                <h5 className="text-lg sm:text-xl font-extrabold leading-snug tracking-tight text-white drop-shadow-sm">
                  O Criet aplica sua identidade sem necessidade de edição
                </h5>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {formData.additionalInfo ||
                    'Informação atualizada, com formatação automática e identidade visual consolidada.'}
                </p>
              </div>

              {/* Simulated Automated Footer */}
              {formData.footerEnabled ? (
                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>{formData.instagram || `@${formData.pageName.toLowerCase().replace(/\s+/g, '')}`}</span>
                  <span>{[formData.phone, formData.website].filter(Boolean).join(' • ') || 'Contato Oficial'}</span>
                </div>
              ) : (
                <div className="py-1 text-center text-[10px] text-slate-400 italic">
                  Rodapé desativado
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left text-xs text-slate-600">
              <span className="font-bold text-slate-800">Nota de Privacidade:</span> Seus dados e logos ficam armazenados exclusivamente na memória do seu navegador através do IndexedDB. Nenhum arquivo é enviado para servidores externos.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
