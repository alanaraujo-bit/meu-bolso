'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface HelpStep {
  title: string;
  content: string;
  image?: string;
  gif?: string;
  analogy?: string;
  tip?: string;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: HelpStep[];
}

export default function HelpModal({ isOpen, onClose, title, steps }: HelpModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGifPlaying, setIsGifPlaying] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Detectar tema do sistema
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Observer para mudanças de tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-900/95 backdrop-blur-md border-gray-700/50' 
          : 'bg-white/95 backdrop-blur-md border-white/20'
      }`}>
        {/* Header */}
        <div className={`p-6 flex justify-between items-center border-b transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-gray-700/50 text-white' 
            : 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 border-white/20 text-white'
        }`}>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                darkMode ? 'bg-white/10' : 'bg-white/20'
              }`}>
                ✨
              </div>
              {title}
            </h2>
            <p className={`mt-2 ${
              darkMode ? 'text-gray-300' : 'text-emerald-100'
            }`}>
              Passo {currentStep + 1} de {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
              darkMode 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-white/20 text-white'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={`h-2 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-r-full"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Text Content */}
            <div className="space-y-6">
              <h3 className={`text-2xl font-bold flex items-center gap-3 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  darkMode 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {currentStep + 1}
                </div>
                {currentStepData.title}
              </h3>
              
              <div 
                className={`leading-relaxed text-base transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                dangerouslySetInnerHTML={{ __html: currentStepData.content }}
              />

              {/* Analogy Section */}
              {currentStepData.analogy && (
                <div className={`rounded-xl p-5 border-l-4 transition-all duration-300 ${
                  darkMode 
                    ? 'bg-blue-900/30 border-blue-400 backdrop-blur-sm' 
                    : 'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                        darkMode ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        Pense assim:
                      </h4>
                      <p className={`italic transition-colors duration-300 ${
                        darkMode ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {currentStepData.analogy}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tip Section */}
              {currentStepData.tip && (
                <div className={`rounded-xl p-5 border-l-4 transition-all duration-300 ${
                  darkMode 
                    ? 'bg-emerald-900/30 border-emerald-400 backdrop-blur-sm' 
                    : 'bg-emerald-50 border-emerald-400'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                        darkMode ? 'text-emerald-300' : 'text-emerald-800'
                      }`}>
                        Dica importante:
                      </h4>
                      <p className={`transition-colors duration-300 ${
                        darkMode ? 'text-emerald-200' : 'text-emerald-700'
                      }`}>
                        {currentStepData.tip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Media Content */}
            <div className="flex flex-col items-center justify-center">
              {currentStepData.gif ? (
                <div className="relative w-full">
                  <img
                    src={currentStepData.gif}
                    alt={currentStepData.title}
                    className="w-full rounded-xl shadow-lg"
                  />
                  <button
                    onClick={() => setIsGifPlaying(!isGifPlaying)}
                    className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-900/80 text-white hover:bg-gray-800/80' 
                        : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                  >
                    {isGifPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              ) : currentStepData.image ? (
                <img
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  className="w-full rounded-xl shadow-lg"
                />
              ) : (
                <div className={`w-full h-64 rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm' 
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50'
                }`}>
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">
                      {currentStep === 0 ? '🏠' : 
                       currentStep === 1 ? '📊' : 
                       currentStep === 2 ? '📈' : 
                       currentStep === 3 ? '📝' : 
                       currentStep === 4 ? '🎯' : 
                       currentStep === 5 ? '💰' : '📖'}
                    </div>
                    <p className={`font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Ilustração Tutorial
                    </p>
                    <div className={`mt-4 rounded-xl p-4 shadow-sm transition-all duration-300 ${
                      darkMode ? 'bg-gray-800/50' : 'bg-white'
                    }`}>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-3 bg-emerald-400 rounded animate-pulse"></div>
                        <div className="h-3 bg-teal-400 rounded animate-pulse animation-delay-300"></div>
                        <div className="h-3 bg-cyan-400 rounded animate-pulse animation-delay-600"></div>
                        <div className={`h-2 rounded col-span-2 ${
                          darkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}></div>
                        <div className="h-2 bg-rose-400 rounded"></div>
                        <div className="h-4 bg-indigo-400 rounded col-span-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`px-6 py-4 flex justify-between items-center border-t transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
            : 'bg-gray-50/80 border-gray-200/50 backdrop-blur-sm'
        }`}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 0
                ? darkMode 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-105 shadow-sm'
            }`}
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <div className="flex space-x-3">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentStep
                    ? 'bg-emerald-500 scale-125'
                    : index < currentStep
                    ? 'bg-teal-500'
                    : darkMode 
                      ? 'bg-gray-600 hover:bg-gray-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
              }`}
            >
              ✅ Concluir
            </button>
          ) : (
            <button
              onClick={nextStep}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
              }`}
            >
              Próximo
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
