// src/utils/validation.js
export const validateInvoiceData = (data) => {
  const errors = {};

  if (!data.invoiceNumber?.trim()) {
    errors.invoiceNumber = 'Rechnungsnummer ist erforderlich';
  }

  if (!data.issueDate) {
    errors.issueDate = 'Ausstellungsdatum ist erforderlich';
  }

  if (!data.currency) {
    errors.currency = 'Währung ist erforderlich';
  }

  return errors;
};

export const validateVatIDFormat = (vatId) => {
  if (!vatId || vatId.trim() === '') {
    return { isValid: false, message: 'Umsatzsteuer-ID ist erforderlich' };
  }
  
  // Normalize the VAT ID by removing spaces and converting to uppercase
  const normalizedVatId = vatId.trim().toUpperCase();
  
  // Check if it already has a country prefix
  const hasCountryPrefix = /^[A-Z]{2}/.test(normalizedVatId);
  
  // For German VAT IDs, ensure they start with DE
  if (!hasCountryPrefix) {
    // No prefix, so we'll assume it's a German VAT ID
    return { 
      isValid: false, 
      message: 'Umsatzsteuer-ID muss mit einem Ländercode (z.B. DE) beginnen', 
      formattedValue: 'DE' + normalizedVatId 
    };
  } else if (!normalizedVatId.startsWith('DE') && !normalizedVatId.startsWith('EL')) {
    // Has a prefix but not DE or EL (special case for Greece)
    return { 
      isValid: false, 
      message: 'Im deutschen Kontext muss die Umsatzsteuer-ID mit DE beginnen', 
      formattedValue: 'DE' + normalizedVatId.substring(2) 
    };
  }
  
  // Format is correct
  return { isValid: true, formattedValue: normalizedVatId };
};

export const validateSellerData = (data) => {
  const errors = {};
  
  const requiredFields = ['name', 'street', 'postalCode', 'city', 'email', 'taxNumber'];

  requiredFields.forEach(field => {
    if (!data[field]?.trim()) {
      errors[field] = `${field === 'contact' ? 'Kontaktperson' : field === 'phone' ? 'Telefonnummer' : field.charAt(0).toUpperCase() + field.slice(1)} ist erforderlich`;
    }
  });
  
  if (!data.country) {
    errors.country = 'Land ist erforderlich';
  }

  // Validate phone number contains at least 3 digits
  if (data.phone) {
    if (!/\d{3,}/.test(data.phone)) {
      errors.phone = 'Telefonnummer muss mindestens 3 Zahlen enthalten';
    } else if (!/^\d+$/.test(data.phone)) {
      errors.phone = 'Telefonnummer darf nur Zahlen enthalten';
    }
  }

  if (data.email) {
    // Check for exactly one @ and at least 2 characters on each side
    // Ensure no dots at the beginning or end of domain
    if (!/^[^@]{2,}@[^@.]{2,}\.[^@.][^@]*$/.test(data.email) || data.email.indexOf('@') !== data.email.lastIndexOf('@')) {
      errors.email = 'Ungültiges E-Mail-Format. Es muss genau ein @ und gültige Bestandteile enthalten';
    }
  }

  if (!data.isSmallBusiness) {
    const vatResult = validateVatIDFormat(data.vatId);
    if (!vatResult.isValid) {
      errors.vatId = vatResult.message;
    }
  }

  return errors;
};

export const validateBuyerData = (data) => {
  const errors = {};
  const requiredFields = ['name', 'street', 'postalCode', 'city', 'email'];

  requiredFields.forEach(field => {
    if (!data[field]?.trim()) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });
  
  if (!data.country) {
    errors.country = 'Land ist erforderlich';
  }

  if (data.email) {
    // Check for exactly one @ and at least 2 characters on each side
    // Ensure no dots at the beginning or end of domain
    if (!/^[^@]{2,}@[^@.]{2,}\.[^@.][^@]*$/.test(data.email) || data.email.indexOf('@') !== data.email.lastIndexOf('@')) {
      errors.email = 'Ungültiges E-Mail-Format. Es muss genau ein @ und gültige Bestandteile enthalten';
    }
  }

  if (data.phone) {
    if (!/\d{3,}/.test(data.phone)) {
      errors.phone = 'Telefonnummer muss mindestens 3 Zahlen enthalten';
    } else if (!/^\d+$/.test(data.phone)) {
      errors.phone = 'Telefonnummer darf nur Zahlen enthalten';
    }
  }

  // Validate VAT ID starts with DE for German buyer
  if (data.vatId && data.vatId.trim() !== '') {
    const vatResult = validateVatIDFormat(data.vatId);
    if (!vatResult.isValid) {
      errors.vatId = vatResult.message;
    }
  }

  return errors;
};

export const validatePaymentData = (data) => {
  const errors = {};

  if (!data.accountHolder?.trim()) {
    errors.accountHolder = 'Kontoinhaber ist erforderlich';
  }

  if (!data.iban?.trim()) {
    errors.iban = 'IBAN ist erforderlich';
  } else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(data.iban.replace(/\s/g, ''))) {
    errors.iban = 'Ungültiges IBAN-Format';
  }

  if (data.type === 'directDebit') {
    if (!data.mandateRef?.trim()) {
      errors.mandateRef = 'Mandatsreferenz ist für Lastschriftverfahren erforderlich';
    }
    if (!data.creditorId?.trim()) {
      errors.creditorId = 'Gläubiger-ID ist für Lastschriftverfahren erforderlich';
    }
  }

  return errors;
};
////////////////////////////////////////function is unnecessary for now *alpha //////////////////////////////////////////////////////////////////
export const validateVatCategoryConsistency = (lineItems, seller = {}, buyer = {}) => {
  const errors = {};
  
  // Make sure lineItems is an array to prevent errors
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return errors;
  }
  
  // Check for "O" category (Not subject to VAT)
  const hasOCategory = lineItems.some(item => item.vatCategory === 'O');
  
  if (hasOCategory) {
    // Check if all line items have O category
    const hasMixedCategories = lineItems.some(item => item.vatCategory !== 'O');
    if (hasMixedCategories) {
      errors.vatCategoryMixed = 'Wenn "Nicht steuerbar" (O) verwendet wird, müssen alle Positionen diese Kategorie verwenden.';
    }
    
    // Check if VAT IDs are present (not allowed with O category)
    // Add null checks to prevent errors
    if (seller && seller.vatId && seller.vatId.trim() !== '') {
      errors.sellerVatId = 'Umsatzsteuer-ID des Verkäufers darf nicht angegeben werden, wenn "Nicht steuerbar" (O) verwendet wird.';
    }
    
    if (buyer && buyer.vatId && buyer.vatId.trim() !== '') {
      errors.buyerVatId = 'Umsatzsteuer-ID des Käufers darf nicht angegeben werden, wenn "Nicht steuerbar" (O) verwendet wird.';
    }
  }
  
  // Check for correct VAT rates with category O
  lineItems.forEach((item, index) => {
    if (item.vatCategory === 'O' && item.vatRate !== 0) {
      if (!errors.items) errors.items = [];
      if (!errors.items[index]) errors.items[index] = {};
      errors.items[index].vatRate = 'Bei Steuerkategorie "Nicht steuerbar" (O) muss der Steuersatz 0% sein.';
    }
  });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return errors;
};

export const validateLineItems = (items, seller, buyer) => {
  if (!items.length) {
    return { general: 'Mindestens eine Position ist erforderlich' };
  }

  const errors = [];
  items.forEach((item, index) => {
    const itemErrors = {};

    if (!item.description?.trim()) {
      itemErrors.description = 'Beschreibung ist erforderlich';
    }

    if (!item.quantity || item.quantity <= 0) {
      itemErrors.quantity = 'Die Menge muss größer als 0 sein';
    }

    if (!item.unitPrice || item.unitPrice < 0) {
      itemErrors.unitPrice = 'Der Einzelpreis muss 0 oder höher sein';
    }

    if (Object.keys(itemErrors).length) {
      errors[index] = itemErrors;
    }

    if (!item.unit) {
      itemErrors.unit = 'Einheit ist erforderlich';
    }
    
    //validation for VAT information as it's required
    if (typeof item.vatRate === 'undefined' || item.vatRate === null) {
      itemErrors.vatRate = 'Steuersatz ist erforderlich';
    }
    
    if (!item.vatCategory) {
      itemErrors.vatCategory = 'Steuerkategorie ist erforderlich';
    }

    if (Object.keys(itemErrors).length) {
      errors[index] = itemErrors;
    }

  });

 const result = errors.length ? { items: errors } : {};
  
 if (seller && buyer) {
  // Add VAT category consistency validation
  const vatConsistencyErrors = validateVatCategoryConsistency(items, seller, buyer);
  
  // Merge the errors
  if (vatConsistencyErrors.vatCategoryMixed) {
    result.general = vatConsistencyErrors.vatCategoryMixed;
  }
  
  if (vatConsistencyErrors.sellerVatId || vatConsistencyErrors.buyerVatId) {
    result.vatIdConflict = 'Umsatzsteuer-IDs dürfen nicht angegeben werden, wenn "Nicht steuerbar" (O) verwendet wird.';
  }
  
  if (vatConsistencyErrors.items) {
    if (!result.items) result.items = [];
    vatConsistencyErrors.items.forEach((itemErrors, index) => {
      if (itemErrors) {
        if (!result.items[index]) result.items[index] = {};
        Object.assign(result.items[index], itemErrors);
      }
    });
  }
}

return result;
};

export function isFormCompletelyValid(formData) {
  const {
    invoiceData,
    seller,
    buyer,
    payment,
    lineItems
  } = formData;

  const hasInvoiceData = invoiceData.invoiceNumber && invoiceData.issueDate && invoiceData.currency;
  
  const hasSellerData = seller.name && 
                        seller.street && 
                        seller.postalCode && 
                        seller.city && 
                        seller.country && 
                        seller.email && 
                        seller.phone && 
                        seller.contact && 
                        seller.taxNumber && 
                        (seller.isSmallBusiness || seller.vatId);
  
  const hasBuyerData = buyer.name && buyer.street && buyer.postalCode && buyer.city && buyer.country && buyer.vatId;
  const hasPaymentData = payment.accountHolder && payment.iban && (payment.type !== 'directDebit' || (payment.mandateRef && payment.creditorId));
  const hasLineItems = Array.isArray(lineItems) && lineItems.length > 0 &&
    lineItems.every(item =>
      item.description &&
      item.quantity > 0 &&
      item.unit &&
      item.unitPrice >= 0 &&
      typeof item.vatRate !== 'undefined' &&
      item.vatCategory
    );

    const vatCategoryErrors = validateVatCategoryConsistency(lineItems, seller, buyer);
    const isVatCategoryValid = Object.keys(vatCategoryErrors).length === 0;
  
    return hasInvoiceData && 
           hasSellerData && 
           hasBuyerData && 
           hasPaymentData && 
           hasLineItems &&
           isVatCategoryValid;
  }