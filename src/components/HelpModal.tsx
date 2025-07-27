'use client';

import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-blue-100 mt-1">
              Passo {currentStep + 1} de {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Content */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">
                {currentStepData.title}
              </h3>
              
              <div 
                className="text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentStepData.content }}
              />

              {/* Analogy Section */}
              {currentStepData.analogy && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-2">💡</div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Pense assim:
                      </h4>
                      <p className="text-blue-700 italic">
                        {currentStepData.analogy}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tip Section */}
              {currentStepData.tip && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="text-green-500 mr-2">✨</div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">
                        Dica importante:
                      </h4>
                      <p className="text-green-700">
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
                    className="w-full rounded-lg shadow-lg"
                  />
                  <button
                    onClick={() => setIsGifPlaying(!isGifPlaying)}
                    className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    {isGifPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              ) : currentStepData.image ? (
                <img
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {currentStep === 0 ? '🏠' : 
                       currentStep === 1 ? '📊' : 
                       currentStep === 2 ? '📈' : 
                       currentStep === 3 ? '📝' : 
                       currentStep === 4 ? '🎯' : 
                       currentStep === 5 ? '�' : '�📖'}
                    </div>
                    <p className="text-gray-600 font-medium">Ilustração Tutorial</p>
                    <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-3 bg-blue-200 rounded"></div>
                        <div className="h-3 bg-green-200 rounded"></div>
                        <div className="h-3 bg-yellow-200 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                        <div className="h-2 bg-red-200 rounded"></div>
                        <div className="h-4 bg-indigo-200 rounded col-span-3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <ChevronLeft size={20} className="mr-1" />
            Anterior
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Concluir
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Próximo
              <ChevronRight size={20} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
