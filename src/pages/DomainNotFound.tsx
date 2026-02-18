import { Globe, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DomainNotFound = () => {
  const currentDomain = window.location.hostname;
  const currentPath = window.location.pathname;

  const goToRoot = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                ?
              </div>
            </div>
          </div>

          {/* Error code */}
          <div className="text-center mb-6">
            <span className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              404
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
            Página não encontrada
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-center mb-4 leading-relaxed">
            O caminho <code className="bg-white/10 px-2 py-1 rounded text-purple-300 text-sm">{currentPath}</code> não está disponível neste domínio.
          </p>

          <p className="text-gray-400 text-center text-sm mb-8">
            Verifique se o endereço foi digitado corretamente ou tente acessar a página inicial.
          </p>

          {/* Domain info */}
          <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Domínio</p>
                <p className="text-white font-medium">{currentDomain}</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button 
            onClick={goToRoot}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 rounded-xl text-lg font-medium shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.02]"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir para página inicial
          </Button>

          {/* Back link */}
          <button 
            onClick={() => window.history.back()}
            className="w-full mt-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à página anterior
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Powered by <span className="text-purple-400 font-medium">MigraBook</span>
        </p>
      </div>
    </div>
  );
};

export default DomainNotFound;
