// src/components/FormSteps/BuyerData.jsx
import React from 'react';
import { useForm } from '../../contexts/FormContext';
import InputField from '../common/InputField';

export default function BuyerData({ onNext, onPrevious }) {
  const { state, updateFormData } = useForm();
  const { buyer } = state.formData;

  const handleChange = (e) => {
    updateFormData('buyer', { [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-6">Rechnungsempfänger</h2>

      <InputField
        label="Name Rechnungsempfänger"
        name="name"
        value={buyer.name}
        onChange={handleChange}
        required
      />

      <InputField
        label="Straße"
        name="street"
        value={buyer.street}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="PLZ"
          name="postalCode"
          value={buyer.postalCode}
          onChange={handleChange}
          required
        />
        <InputField
          label="Ort"
          name="city"
          value={buyer.city}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-2 text-gray-800 dark:text-gray-200">
            Land   
            <span
                className="text-gray-500 dark:text-white cursor-pointer"
                title="Im Moment werden nur deutsche xRechnungen unterstützt"
                  >
              ❗
            </span>
          </label>
          <select
            name="Land"
            value={buyer.country}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300
                   dark:bg-[#1a1a1a] dark:text-white dark:border-dornBorder focus:outline-none focus:ring-2 focus:ring-red-800"
            required
          >
            <option value="DE">Deutschland</option>
          </select>
        </div>
      </div>

      <InputField
        label="Umsatzsteuer-ID"
        name="vatId"
        value={buyer.vatId}
        onChange={handleChange}
        placeholder="DE123456789"
        required
      />

      <InputField
        label="Leitweg-ID"
        name="leaderID"
        value={buyer.leaderID}
        onChange={handleChange}
      />

      <InputField
        label="Kundennummer"
        name="customerNumber"
        value={buyer.customerNumber}
        onChange={handleChange}
      />

      <InputField
        label="E-mail"
        type="email"
        name="email"
        value={buyer.email}
        onChange={handleChange}
        required
      />

      <InputField
        label="Kontaktperson"
        name="contact"
        value={buyer.contact}
        onChange={handleChange}
      />

      <InputField
        label="Telefon"
        name="phone"
        value={buyer.phone}
        onChange={handleChange}
      />

    </form>
  );
}