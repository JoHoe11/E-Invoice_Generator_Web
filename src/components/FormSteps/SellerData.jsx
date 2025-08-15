// src/components/FormSteps/SellerData.jsx
import React, { useEffect } from 'react';
import { useForm } from '../../contexts/FormContext';
import InputField from '../common/InputField';

export default function SellerData({ onNext, onPrevious }) {
  const { state, updateFormData } = useForm();
  const { seller } = state.formData;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateFormData('seller', { [e.target.name]: value });
  };

  // When isSmallBusiness changes, we might need to update validations
  useEffect(() => {
    // This ensures validation is re-run when isSmallBusiness changes
    if (seller.isSmallBusiness) {
      // VAT ID not required for small businesses
      updateFormData('seller', { vatId: seller.vatId || 'Kleinunternehmer' });
    }
  }, [seller.isSmallBusiness]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-6">Rechnungssteller</h2>

      <InputField
        label="Name Rechnungssteller"
        name="name"
        value={seller.name}
        onChange={handleChange}
        required
      />

      <InputField
        label="Straße"
        name="street"
        value={seller.street}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="PLZ"
          name="postalCode"
          value={seller.postalCode}
          onChange={handleChange}
          required
        />
        <InputField
          label="Ort"
          name="city"
          value={seller.city}
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
            name="country"
            value={seller.country}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300
                   dark:bg-[#1a1a1a] dark:text-white dark:border-dornBorder focus:outline-none focus:ring-2 focus:ring-red-800"
            required
          >
            <option value="DE">Deutschland</option>
          </select>
        </div>
      </div>

      {/* Add checkbox for Kleinunternehmer before VAT ID */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="isSmallBusiness"
          id="isSmallBusiness"
          checked={seller.isSmallBusiness}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="isSmallBusiness">Kleinunternehmer gem. § 19 UStG</label>
      </div>

      <InputField
        label={`Umsatzsteuer-ID ${!seller.isSmallBusiness ? '' : ''}`}
        name="vatId"
        value={seller.vatId}
        onChange={handleChange}
        placeholder="DE123456789"
        required={!seller.isSmallBusiness}
        disabled={seller.isSmallBusiness}
      />

      <InputField
        label="Steuernummer"
        name="taxNumber"
        value={seller.taxNumber}
        onChange={handleChange}
        required
      />

      <InputField
        label="E-mail"
        type="email"
        name="email"
        value={seller.email}
        onChange={handleChange}
        required
      />

      <InputField
        label=" Kontaktperson"
        name="contact"
        value={seller.contact}
        onChange={handleChange}
      />

      <InputField
        label="Telefon"
        name="phone"
        value={seller.phone}
        onChange={handleChange}
      />

    </form>
  );
}