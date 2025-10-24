import React from 'react';

export type InputMethod = 'image' | 'json';

interface InputMethodSelectorProps {
  selectedMethod: InputMethod;
  onMethodChange: (method: InputMethod) => void;
}

const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({ 
  selectedMethod, 
  onMethodChange 
}) => {
  const methods = [
    {
      id: 'image' as InputMethod,
      title: 'Upload Image',
      description: 'Extract prayer times from a timetable image using AI',
      icon: '📸',
      features: ['AI-powered OCR', 'Automatic extraction', 'Image preview']
    },
    {
      id: 'json' as InputMethod,
      title: 'Enter JSON',
      description: 'Input prayer times data directly in JSON format',
      icon: '📝',
      features: ['Direct input', 'Fast entry', 'Manual validation']
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Choose Input Method
        </h2>
        <p className="text-slate-500">
          Select how you'd like to input the prayer times data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => onMethodChange(method.id)}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedMethod === method.id
                ? 'border-blue-600 bg-blue-600/5 shadow-md'
                : 'border-gray-200 hover:border-blue-600/50'
            }`}
          >
            {/* Selection indicator */}
            {selectedMethod === method.id && (
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="text-center">
              <div className="text-4xl mb-4">{method.icon}</div>
              <h3 className={`text-xl font-semibold mb-2 ${
                selectedMethod === method.id ? 'text-blue-600' : 'text-slate-800'
              }`}>
                {method.title}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {method.description}
              </p>

              <div className="space-y-2">
                {method.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-center text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Hover effect */}
            <div className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
              selectedMethod === method.id 
                ? 'opacity-0' 
                : 'opacity-0 hover:opacity-10 bg-blue-600'
            }`}></div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <span className="font-medium">💡 Tip:</span> You can switch between methods at any time. 
            {selectedMethod === 'image' 
              ? ' Image processing requires an AI provider API key.'
              : ' JSON input allows for quick manual entry of prayer times.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default InputMethodSelector;