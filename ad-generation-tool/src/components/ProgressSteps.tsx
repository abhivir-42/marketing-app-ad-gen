import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Script Input' },
  { id: 2, name: 'Review & Refine' },
  { id: 3, name: 'Generate Audio' }
];

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <div className="py-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="relative">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                  step.id <= currentStep
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-gray-600 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap">
                <span className={step.id <= currentStep ? 'text-purple-400' : 'text-gray-500'}>
                  {step.name}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-2 ${
                  step.id < currentStep ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps; 