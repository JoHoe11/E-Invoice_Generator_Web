// src/components/FormSteps/index.jsx
import React from 'react';
import { useForm } from '../../contexts/FormContext';
import Review from './Review';
import StepIndicator from '../common/StepIndicator';
import CombinationPage from './CombinationPage';



const steps = [
  { title: 'Rechnungsdetails', component: CombinationPage},
  { title: 'Überblick', component: Review },
];

export default function FormSteps() {
  const { state, setStep } = useForm();
  const CurrentComponent = steps[state.currentStep].component;

  const goToNextStep = () => {
    if (state.currentStep < steps.length - 1) {
      setStep(state.currentStep + 1); // Move to the next step
    }
  };

  const goToPreviousStep = () => {
    if (state.currentStep > 0) {
      setStep(state.currentStep - 1); // Move to the previous step
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-gray-900 dark:bg-[#1a1a1a] dark:text-white rounded-lg shadow-lg">
      <StepIndicator steps={steps} currentStep={state.currentStep} />
      <div className="mt-8">
        <CurrentComponent
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          isFirstStep={state.currentStep === 0}
          isLastStep={state.currentStep === steps.length - 1}
        />
  </div>
</div>

  );
}