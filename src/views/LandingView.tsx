import React from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Zap,
  ArrowRight,
  Palette,
  Eye,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingViewProps {
  onCreatePost: () => void;
  onCreateVideo: () => void;
  onExploreTemplates: () => void;
  onConfigureBrand: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onCreatePost,
  onCreateVideo,
  onExploreTemplates,
  onConfigureBrand,
}) => {
  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Criação instantânea de conteúdo profissional
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Crie posts profissionais <br className="hidden sm:inline" />
            <span className="text-blue-600">em segundos.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Adicione seu conteúdo. Escreva o texto. <br className="hidden sm:inline" />
            <strong>O Criet faz o resto.</strong> Sem timelines, sem camadas e sem complicação.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={onCreatePost}
              className="w-full sm:w-auto px-8 shadow-md shadow-blue-500/25"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Criar Post Agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onCreateVideo}
              className="w-full sm:w-auto px-8"
            >
              <VideoIcon className="w-5 h-5 mr-2 text-blue-600" />
              Criar Vídeo
            </Button>
          </div>

          {/* Privacy badge */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% no navegador • Seus arquivos não saem do seu computador</span>
          </div>
        </div>

        {/* Visual Concept Showcase Formula Card */}
        <div className="mt-14 max-w-4xl mx-auto bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-2">fórmula criet</span>
            </div>
            <span className="text-xs font-bold text-blue-400">Zero Curva de Aprendizado</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-center">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-2xl mb-1 block">📸</span>
              <p className="text-xs font-extrabold text-slate-200">Imagem / Vídeo</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Seu conteúdo bruto</p>
            </div>

            <div className="text-slate-500 font-black text-xl hidden md:block">+</div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-2xl mb-1 block">✍️</span>
              <p className="text-xs font-extrabold text-slate-200">Texto</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Título e categoria</p>
            </div>

            <div className="text-slate-500 font-black text-xl hidden md:block">+</div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-2xl mb-1 block">🎨</span>
              <p className="text-xs font-extrabold text-slate-200">Template</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Identidade automática</p>
            </div>

            <div className="text-slate-500 font-black text-xl hidden md:block">=</div>

            <div className="bg-blue-600 p-4 rounded-2xl border border-blue-500 shadow-lg col-span-1 md:col-span-1">
              <span className="text-2xl mb-1 block">🚀</span>
              <p className="text-xs font-extrabold text-white">Publicação Pronta</p>
              <p className="text-[11px] text-blue-100 mt-0.5">Baixar em alta definição</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section: 01 a 05 */}
      <section className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Como funciona o Criet
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Cinco passos rápidos e intuitivos para transformar ideias em publicações de alto impacto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
          {[
            {
              step: '01',
              title: 'Escolha o conteúdo',
              desc: 'Faça upload de uma imagem ou vídeo diretamente do seu dispositivo.',
            },
            {
              step: '02',
              title: 'Adicione as informações',
              desc: 'Informe o título, descrição, categoria, data e local da publicação.',
            },
            {
              step: '03',
              title: 'Escolha um modelo',
              desc: 'Selecione entre notícia, desporto, curiosidade, anúncio ou urgência.',
            },
            {
              step: '04',
              title: 'Gerar',
              desc: 'O Criet monta automaticamente com logo, cores e rodapé configurados.',
            },
            {
              step: '05',
              title: 'Exportar',
              desc: 'Baixe a publicação pronta em PNG, JPG ou vídeo sem complicação.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-blue-600 block mb-3 font-mono">
                  {item.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Projetado para quem precisa de agilidade
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Uma abordagem moderna para canais de notícias, redações, empresas e criadores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Criação rápida</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crie posts em poucos passos. Nunca mais perca tempo alinhando textos ou posicionando logos manualmente.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Sua identidade automática</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Configure sua marca uma única vez. Seu logo, cores e rodapé de contatos oficiais sempre prontos.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Privacidade total</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O processamento acontece localmente no seu navegador via Canvas e Web APIs. Seus arquivos não vão para servidores.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto bg-blue-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl shadow-blue-500/20">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
          Comece a criar publicações profissionais agora
        </h2>
        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
          Experimente a velocidade do Criet no seu dispositivo sem precisar criar conta ou instalar nada.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            variant="outline"
            onClick={onCreatePost}
            className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 border-none font-bold"
          >
            Criar Primeiro Post
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={onConfigureBrand}
            className="w-full sm:w-auto text-white hover:bg-blue-700"
          >
            Configurar Minha Marca
          </Button>
        </div>
      </section>
    </div>
  );
};
