// src/components/FormSteps/InvoiceData.jsx
import React from 'react';
import { useForm } from '../../contexts/FormContext';
import InputField from '../common/InputField';

export default function InvoiceData({ onNext, isFirstStep }) {
  const { state, updateFormData } = useForm();
  const { invoiceData } = state.formData;

  const handleChange = (e) => {
    updateFormData('invoiceData', { [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-6">Rechnungsdetails</h2>
      
      <InputField
        label="Rechnungsnummer"
        name="invoiceNumber"
        value={invoiceData.invoiceNumber}
        onChange={handleChange}
        required
      />

      <InputField
        label="Rechnungsdatum"
        name="issueDate"
        type="date"
        value={invoiceData.issueDate}
        onChange={handleChange}
        required
      />

      <InputField
        label="Fälligkeitsdatum"
        name="dueDate"
        type="date"
        value={invoiceData.dueDate}
        onChange={handleChange}
        required
      />



      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-2 text-gray-800 dark:text-gray-200">Währung 
              <span
                  className="text-gray-500 dark:text-white cursor-pointer"
                  title="Im Moment wird nur EUR unterstützt!"
                    >
               ❗
              </span>
            </label>
          <select
            name="currency"
            value={invoiceData.currency}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300
                   dark:bg-[#1a1a1a] dark:text-white dark:border-dornBorder focus:outline-none focus:ring-2 focus:ring-red-800"
            required
          >
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-2 text-gray-800 dark:text-gray-200">Rechnungstyp 
          <span
                className="text-gray-500 dark:text-white cursor-pointer"
                title="Im Moment werden nur Rechnungen unterstützt!"
                  >
              ❗
            </span>
          </label>
          <select
            name="invoiceType"
            value={invoiceData.invoiceType}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300
                   dark:bg-[#1a1a1a] dark:text-white dark:border-dornBorder focus:outline-none focus:ring-2 focus:ring-red-800"
            required
          >
            <option value="Invoice">Rechnung</option>
          </select>
        </div>
      </div>

      <InputField
        label="Liefertermin"
        name="deliveryDate"
        type="date"
        value={invoiceData.deliveryDate}
        onChange={handleChange}
      />

      <InputField
        label="Bemerkung"
        name="notes"
        type="textarea"
        value={invoiceData.notes}
        onChange={handleChange}
      />

    </form>
  );
}