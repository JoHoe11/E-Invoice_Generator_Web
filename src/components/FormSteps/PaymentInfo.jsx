// src/components/FormSteps/PaymentInfo.jsx
import React from 'react';
import { useForm } from '../../contexts/FormContext';
import InputField from '../common/InputField';

export default function PaymentInfo({ onNext}) {
  const { state, updateFormData } = useForm();
  const { payment } = state.formData;

  const handleChange = (e) => {
    updateFormData('payment', { [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Zahlungsdaten</h2>

      <div className="mb-4">
        <label className="block mb-2 text-gray-800 dark:text-white">Zahlungsart</label>
        <select
          name="type"
          value={payment.type}
          onChange={handleChange}
          className="w-full p-2 border rounded 
                 bg-white text-gray-900 border-gray-300 
                 dark:bg-dornBox dark:text-white dark:border-dornBorder 
                 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        >
          <option value="sepa">SEPA-Überweisung</option>
          <option value="directDebit">SEPA-Lastschrift</option>
        </select>
      </div>

      <InputField
        label="Kontoinhaber"
        name="accountHolder"
        value={payment.accountHolder}
        onChange={handleChange}
        required
      />

      <InputField
        label="IBAN"
        name="iban"
        value={payment.iban}
        onChange={handleChange}
        required
      />

      <InputField
        label="BIC"
        name="bic"
        value={payment.bic}
        onChange={handleChange}
      />

      <InputField
        label="Zahlungsbedingungen"
        name="reference"
        value={payment.reference}
        onChange={handleChange}
      />

      {payment.type === 'directDebit' && (
        <>
          <InputField
            label="Mandatsreferenz"
            name="mandateRef"
            value={payment.mandateRef}
            onChange={handleChange}
            required
          />

          <InputField
            label="Kreditor-ID"
            name="creditorId"
            value={payment.creditorId}
            onChange={handleChange}
            required
          />
        </>
      )}
    </form>
  );
}