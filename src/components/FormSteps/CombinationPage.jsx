import React, { useEffect, useState } from 'react';
import InvoiceData from './InvoiceData';
import SellerData from './SellerData';
import BuyerData from './BuyerData';
import LineItems, { LineItemTotals } from './LineItems';
import PaymentInfo from './PaymentInfo';
import { useForm } from '../../contexts/FormContext';
import { 
  validateInvoiceData, 
  validateSellerData, 
  validateBuyerData, 
  validatePaymentData, 
  validateLineItems,
  validateVatCategoryConsistency
} from '../../utils/validation';

export default function CombinationPage({ onNext }) {
  const { state } = useForm();
  const [isValid, setIsValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Use the validation functions from validation.js
  const validateForm = (formData) => {
    const errors = {};
    
    // Invoice validation
    const invoiceErrors = validateInvoiceData(formData.invoiceData);
    if (Object.keys(invoiceErrors).length > 0) {
      errors.invoice = invoiceErrors;
    }
    
    // Seller validation
    const sellerErrors = validateSellerData(formData.seller);
    if (Object.keys(sellerErrors).length > 0) {
      errors.seller = sellerErrors;
    }
    
    // Buyer validation
    const buyerErrors = validateBuyerData(formData.buyer);
    if (Object.keys(buyerErrors).length > 0) {
      errors.buyer = buyerErrors;
    }
    
    // Payment validation
    const paymentErrors = validatePaymentData(formData.payment);
    if (Object.keys(paymentErrors).length > 0) {
      errors.payment = paymentErrors;
    }
    
    // Line items validation including VAT category consistency
    const lineItemErrors = validateLineItems(formData.lineItems, formData.seller, formData.buyer);
    if (Object.keys(lineItemErrors).length > 0) {
      errors.lineItems = lineItemErrors;
    }
    
    return errors;
  };

  useEffect(() => {
    // Run validation on form data changes
    const errors = validateForm(state.formData);
    setValidationErrors(errors);
    setIsValid(Object.keys(errors).length === 0);
  }, [state.formData]);

  const handleReviewClick = (e) => {
    // Double check validity before proceeding
    const currentErrors = validateForm(state.formData);
    if (Object.keys(currentErrors).length > 0) {
      e.preventDefault();
      setShowErrors(true);
      setValidationErrors(currentErrors);
      setIsValid(false);
      // Scroll to top to see errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Auto-hide errors after 7 seconds
      setTimeout(() => setShowErrors(false), 7000);
      return false;
    } else {
      setIsValid(true);
      onNext();
    }
  };

  // Get sections with errors for display
  const getErrorSections = () => {
    return Object.keys(validationErrors).map(section => {
      switch(section) {
        case 'invoice': return 'Rechnungsdaten';
        case 'seller': return 'Verkäuferdaten';
        case 'buyer': return 'Käuferdaten';
        case 'payment': return 'Zahlungsdaten';
        case 'lineItems': return 'Positionen';
        default: return section;
      }
    });
  };

  // Get detailed errors to display
  const getDetailedErrors = () => {
    const allErrors = [];
    
    // Helper to add errors from a section
    const addErrors = (sectionErrors, prefix) => {
      if (!sectionErrors) return;
      
      if (typeof sectionErrors === 'object') {
        Object.entries(sectionErrors).slice(0, 3).forEach(([field, message]) => {
          // Skip 'items' array in lineItems
          if (field !== 'items') {
            allErrors.push(`${prefix}: ${message}`);
          }
        });
      }
    };
    
    // Add errors from each section
    addErrors(validationErrors.invoice, 'Rechnungsdetails');
    addErrors(validationErrors.seller, 'Rechnungssteller');
    addErrors(validationErrors.buyer, 'Rechnungsempfänger');
    addErrors(validationErrors.payment, 'Zahlungsdaten');
    
    // Special handling for line items
    if (validationErrors.lineItems) {
      if (validationErrors.lineItems.general) {
        allErrors.push(`Positionen: ${validationErrors.lineItems.general}`);
      }
      
      if (validationErrors.lineItems.items) {
        // Get first two items with errors
        Object.entries(validationErrors.lineItems.items).slice(0, 2).forEach(([index, itemErrors]) => {
          // Get first error for each item
          const firstError = Object.values(itemErrors)[0];
          allErrors.push(`Position ${parseInt(index) + 1}: ${firstError}`);
        });
      }
    }
    
    return allErrors.slice(0, 7); // Show up to 7 errors
  };

  return (
    <div className="space-y-10">
      {showErrors && !isValid && (
        <div className="p-4 mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow dark:bg-red-900 dark:text-red-100 dark:border-red-700">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold">Formular unvollständig</h3>
          </div>
          
          <p className="mb-2 mt-2">
            <strong>Fehler in:</strong> {getErrorSections().join(", ")}
          </p>
          
          <ul className="list-disc pl-5 space-y-1 mt-3">
            {getDetailedErrors().map((error, idx) => (
              <li key={idx} className="text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <InvoiceData />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SellerData />
        <BuyerData />
      </div>
      <LineItems />
      <PaymentInfo />
      <LineItemTotals />

      <div className="flex justify-end">
        <button
          onClick={handleReviewClick}
          type="button" // Explicitly set type to avoid form submission
          className={`mt-6 px-6 py-3 rounded-md text-white font-semibold transition-colors duration-200
            ${isValid 
              ? 'bg-green-600 hover:bg-green-700 dark:bg-red-700 dark:hover:bg-red-800' 
              : 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-800'}`}
        >
          {isValid ? 'Vorschau' : 'Formular unvollständig'}
        </button>
      </div>
    </div>
  );
}