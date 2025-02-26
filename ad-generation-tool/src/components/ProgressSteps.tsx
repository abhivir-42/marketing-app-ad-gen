import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Script Creation' },
  { id: 2, name: 'Iterate & Produce' }
];

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <div className="py-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="relative">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                  step.id <= currentStep
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-gray-600 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm font-medium whitespace-nowrap">
                <span className={step.id <= currentStep ? 'text-purple-400' : 'text-gray-500'}>
                  {step.name}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-28 h-1 mx-3 ${
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