// src/App.jsx
import React from 'react';
import { FormProvider } from './contexts/FormContext';
import FormSteps from './components/FormSteps';

function App() {
  return (
    <FormProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1e1e1e] dark:text-dornBody">
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div className="bg-white dark:bg-dornBox dark:border rounded-lg dark:border-dornBorder shadow-lg dark:shadow-red-900">
        <FormSteps />
      </div>
    </main>
  </div>
</FormProvider>

  );
}

export default App;