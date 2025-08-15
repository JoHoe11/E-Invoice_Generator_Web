// src/components/FormSteps/LineItems.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from '../../contexts/FormContext';

export default function LineItems({ onNext, onPrevious }) {
  const { state, updateLineItems } = useForm();
  const { lineItems } = state.formData;
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // Subscribe to a global showErrors state from the parent component
  useEffect(() => {
    // This will catch the event when the Review button is pressed
    const handleReviewAttempt = () => {
      validateAllItems();
      setShowErrors(true);
    };

    window.addEventListener('validate-form', handleReviewAttempt);
    
    return () => {
      window.removeEventListener('validate-form', handleReviewAttempt);
    };
  }, [lineItems]);

  const validateLineItem = (item) => {
    const itemErrors = {};
    
    if (!item.description?.trim()) {
      itemErrors.description = 'Bezeichnung erforderlich';
    }
    
    if (!item.quantity || item.quantity <= 0) {
      itemErrors.quantity = 'Menge > 0 erforderlich';
    }
    
    if (item.unitPrice < 0) {
      itemErrors.unitPrice = 'Positive Zahl erforderlich';
    }
    
    return itemErrors;
  };

  const validateAllItems = () => {
    const newErrors = {};
    
    lineItems.forEach(item => {
      const itemErrors = validateLineItem(item);
      if (Object.keys(itemErrors).length > 0) {
        newErrors[item.id] = itemErrors;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateLineItem = (id, field, value) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate totals when quantity or price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        // Update VAT category based on rate
        if (field === 'vatRate') {
          // When VAT is 0%, set default exemption code to E
          updatedItem.vatCategory = value === 0 ? 'E' : 'S';
        }
        
        // Only validate and show errors if showErrors is true
        if (showErrors) {
          const validationErrors = validateLineItem(updatedItem);
          setErrors(prev => ({
            ...prev,
            [id]: Object.keys(validationErrors).length > 0 ? validationErrors : undefined
          }));
        }
        
        return updatedItem;
      }
      return item;
    });

    updateLineItems(updatedItems);
  };

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit: 'piece',
      unitPrice: 0,
      vatRate: 19,
      vatCategory: 'S',
      total: 0,
    };
    
    // Only validate if the user has attempted to submit already
    if (showErrors) {
      const newErrors = validateLineItem(newItem);
      setErrors(prev => ({
        ...prev,
        [newItem.id]: Object.keys(newErrors).length > 0 ? newErrors : undefined
      }));
    }
    
    updateLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id) => {
    // Remove the item and its errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    
    updateLineItems(lineItems.filter(item => item.id !== id));
  };

  // Check if the line items section is valid
  const hasErrors = Object.values(errors).some(itemErrors => 
    itemErrors && Object.keys(itemErrors).length > 0
  );
  
  const noItems = lineItems.length === 0;

  return (
    <div className="space-y-6 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Produkt(e)</h2>
        
        {/* Error indicator - only show if showErrors is true */}
        {showErrors && (hasErrors || noItems) && (
          <div className="text-red-500 text-sm flex items-center">
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {noItems ? 'Mindestens ein Artikel erforderlich' : 'Ungültige Artikel vorhanden'}
          </div>
        )}
      </div>

      {noItems ? (
        <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center dark:bg-dornBox dark:border-dornBorder">
          <p className="text-gray-500 dark:text-gray-300 mb-4">Keine Artikel vorhanden. Bitte fügen Sie mindestens einen Artikel hinzu.</p>
          <button
            type="button"
            onClick={addLineItem}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-transparent dark:text-white dark:border dark:border-dornBorder dark:hover:bg-dornBox hover:border-red-800 hover:text-red-800">
            Artikel hinzufügen
          </button>
        </div>
      ) : (
        <>
          {/* Line items as individual cards */}
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 border rounded-lg 
                          ${showErrors && errors[item.id] 
                            ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' 
                            : 'border-gray-200 dark:border-dornBorder dark:bg-dornBox'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-700 dark:hover:text-red-800 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Entfernen
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Bezeichnung <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      className={`w-full p-2 border rounded bg-white text-gray-900 
                               dark:bg-[#2a2a2a] dark:text-white dark:border-dornBorder
                               ${showErrors && errors[item.id]?.description 
                                 ? 'border-red-500 dark:border-red-500' 
                                 : 'border-gray-300'}`}
                      required
                    />
                    {showErrors && errors[item.id]?.description && (
                      <p className="text-red-500 text-xs">{errors[item.id].description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Einheit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                      className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 
                             dark:bg-[#2a2a2a] dark:text-white dark:border-dornBorder"
                      required
                    >
                      <option value="piece">Stück</option>
                      <option value="hour">Stunde(n)</option>
                      <option value="day">Tag(e)</option>
                      <option value="kilogram">Kilogramm</option>
                      <option value="meter">Meter</option>
                      <option value="liter">Liter</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Menge <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                      className={`w-full p-2 border rounded bg-white text-gray-900 
                               dark:bg-[#2a2a2a] dark:text-white dark:border-dornBorder
                               ${showErrors && errors[item.id]?.quantity 
                                 ? 'border-red-500 dark:border-red-500' 
                                 : 'border-gray-300'}`}
                      min="1"
                      required
                    />
                    {showErrors && errors[item.id]?.quantity && (
                      <p className="text-red-500 text-xs">{errors[item.id].quantity}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Stückpreis (€) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                      className={`w-full p-2 border rounded bg-white text-gray-900 
                               dark:bg-[#2a2a2a] dark:text-white dark:border-dornBorder
                               ${showErrors && errors[item.id]?.unitPrice 
                                 ? 'border-red-500 dark:border-red-500' 
                                 : 'border-gray-300'}`}
                      step="0.01"
                      min="0"
                      required
                    />
                    {showErrors && errors[item.id]?.unitPrice && (
                      <p className="text-red-500 text-xs">{errors[item.id].unitPrice}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">Gesamtpreis</label>
                    <div className="p-2 border rounded bg-gray-50 dark:bg-[#333333] dark:border-dornBorder text-right font-medium">
                      {(item.quantity * item.unitPrice).toFixed(2)} €
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Mehrwertsteuer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.vatRate}
                      onChange={(e) => updateLineItem(item.id, 'vatRate', Number(e.target.value))}
                      className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 
                             dark:bg-[#2a2a2a] dark:text-white dark:border-dornBorder"
                      required
                    >
                      <option value="19">19%</option>
                      <option value="7">7%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  
                  {item.vatRate === 0 && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium">
                        Befreiungscode <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.vatCategory}
                        onChange={(e) => updateLineItem(item.id, 'vatCategory', e.target.value)}
                        className="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 
                               dark:bg-[#2a2a2a] dark:text-white dark:border-dornBorder"
                        required
                      >
                        <option value="E">Steuerbefreit (E)</option>
                        <option value="G">Nicht steuerbar (G)</option>
                        <option value="Z">Unbesteuerte Waren (Z)</option>
                        <option value="AE">Umkehrung der Steuerschuldnerschaft ;Reverse Charge (AE)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLineItem}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center dark:bg-transparent dark:text-white dark:border dark:border-dornBorder dark:hover:bg-dornBox dark:hover:border-red-800 dark:hover:text-red-800"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Artikel hinzufügen
          </button>
        </>
      )}
    </div>
  );
}

// Export a separate component for the totals to be used in CombinationPage
export function LineItemTotals() {
  const { state } = useForm();
  const { lineItems } = state.formData;
  
  // Calculate totals
  const calculateTotals = () => {
    let netTotal = 0;
    let vatTotal = 0;
    
    lineItems.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      netTotal += itemTotal;
      vatTotal += itemTotal * (item.vatRate / 100);
    });
    
    return {
      netTotal,
      vatTotal,
      grossTotal: netTotal + vatTotal
    };
  };

  const totals = calculateTotals();
  
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-6 dark:bg-dornBox dark:border-dornBorder">
      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Rechnungssumme</h3>
      <div className="grid grid-cols-2 gap-y-2 text-right">
        <div className="text-gray-600 dark:text-gray-300">Netto-Gesamtbetrag:</div>
        <div className="font-medium text-gray-900 dark:text-white">{totals.netTotal.toFixed(2)} €</div>
        
        <div className="text-gray-600 dark:text-gray-300">MwSt-Betrag:</div>
        <div className="font-medium text-gray-900 dark:text-white">{totals.vatTotal.toFixed(2)} €</div>
        
        <div className="text-lg font-semibold text-gray-800 dark:text-white pt-2 border-t dark:border-dornBorder">Brutto-Gesamtbetrag:</div>
        <div className="text-lg font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-dornBorder">{totals.grossTotal.toFixed(2)} €</div>
      </div>
    </div>
  );
}