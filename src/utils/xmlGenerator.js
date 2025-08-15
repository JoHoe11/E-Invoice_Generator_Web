// XML Generator for XRechnung 3.0.2

// Unit code mapping according to UN/ECE Recommendation 20
const unitCodeMap = {
    'piece': 'H87',    // Piece
    'hour': 'HUR',     // Hour
    'day': 'DAY',      // Day
    'kilogram': 'KGM', // Kilogram
    'meter': 'MTR',    // Meter
    'liter': 'LTR',    // Litre
  };
  
  function getUnitCode(unit) {
    const normalizedUnit = unit.toLowerCase();
    if (!unitCodeMap[normalizedUnit]) {
      throw new Error(`Ungültiger Einheitencode: ${unit}. Bitte verwenden Sie eines der folgenden: ${Object.keys(unitCodeMap).join(', ')}`);
    }
    return unitCodeMap[normalizedUnit];
  }

  function formatVatId(vatId) {
    if (!vatId || vatId.trim() === '') {
      return '';
    }
    
    const normalizedVatId = vatId.trim().toUpperCase();
    
    // Check if it already has a country prefix
    const hasCountryPrefix = /^[A-Z]{2}/.test(normalizedVatId);
    
    if (!hasCountryPrefix) {
      // No prefix, add DE
      return 'DE' + normalizedVatId;
    } else if (!normalizedVatId.startsWith('DE') && !normalizedVatId.startsWith('EL')) {
      // Wrong country prefix, replace with DE
      return 'DE' + normalizedVatId.substring(2);
    }
    
    return normalizedVatId;
  }
  
  // IBAN validation function
  function validateIBAN(iban) {
    // Remove spaces and convert to uppercase
    iban = iban.replace(/\s/g, '').toUpperCase();
    
    // Basic format check
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(iban)) {
      return false;
    }
    
    // Move first 4 chars to end and convert letters to numbers
    const moved = iban.slice(4) + iban.slice(0, 4);
    const expanded = moved.split('').map(char => {
      const code = char.charCodeAt(0);
      return code >= 65 ? (code - 55).toString() : char;
    }).join('');
    
    // Perform MOD-97 check
    let remainder = expanded;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
    }
    
    return parseInt(remainder, 10) % 97 === 1;
  }
  
  export const generateXML = (formData) => {
    // Validate IBAN
    const cleanIBAN = formData.payment.iban.replace(/\s/g, '');
    if (!validateIBAN(cleanIBAN)) {
      throw new Error('Ungültiges IBAN-Format oder ungültige Prüfsumme');
    }
   
     // Ensure contact information exists
    if (!formData.seller.contact || formData.seller.contact.trim() === '') {
        formData.seller.contact = formData.seller.name;
    }
  
    if (!formData.seller.phone || formData.seller.phone.trim() === '') {
        formData.seller.phone = '0123456789';
    }
  
  // Format VAT IDs correctly if they exist and the seller is not a Kleinunternehmer
    if (!formData.seller.isSmallBusiness && formData.seller.vatId) {
        formData.seller.vatId = formatVatId(formData.seller.vatId);
    }
  
    if (formData.buyer.vatId) {
        formData.buyer.vatId = formatVatId(formData.buyer.vatId);
    }

    // Calculate VAT breakdowns and totals
    const vatBreakdowns = {};
    let totalNetAmount = 0;
    let totalVatAmount = 0;
  
    formData.lineItems.forEach(item => {
      const itemTotal = parseFloat((item.quantity * item.unitPrice).toFixed(2));
      const vatAmount = parseFloat(((itemTotal * item.vatRate) / 100).toFixed(2));
      totalNetAmount = parseFloat((totalNetAmount + itemTotal).toFixed(2));
      totalVatAmount = parseFloat((totalVatAmount + vatAmount).toFixed(2));
  
      const key = `${item.vatRate}_${item.vatCategory}`;
      if (!vatBreakdowns[key]) {
        vatBreakdowns[key] = {
          rate: item.vatRate,
          category: item.vatCategory,
          taxableAmount: 0,
          taxAmount: 0
        };
      }
      vatBreakdowns[key].taxableAmount = parseFloat((vatBreakdowns[key].taxableAmount + itemTotal).toFixed(2));
      vatBreakdowns[key].taxAmount = parseFloat((vatBreakdowns[key].taxAmount + vatAmount).toFixed(2));
    });
  
    const totalGrossAmount = parseFloat((totalNetAmount + totalVatAmount).toFixed(2));
  
    // Verify VAT calculations (BR-CO-15)
    Object.values(vatBreakdowns).forEach(vb => {
      const calculatedVAT = parseFloat(((vb.taxableAmount * vb.rate) / 100).toFixed(2));
      const difference = Math.abs(calculatedVAT - vb.taxAmount);
      if (difference > 0.01) {
        throw new Error(`Mehrwertsteuerberechnungsfehler für den Satz ${vb.rate}%`);
      }
    });
  
    // Map exemption codes to their descriptions
    const exemptionReasonMap = {
      'E': 'Steuerbefreit',
      'G': 'Nicht steuerbar',
      'O': 'Außerhalb des Steuergebiets',
      'Z': 'Steuerfreie Ausfuhrlieferung',
      'AE': 'Reverse Charge'
    };
  
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
  <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
           xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
           xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
      <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</cbc:CustomizationID>
      <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
      <cbc:ID>${formData.invoiceData.invoiceNumber}</cbc:ID>
      <cbc:IssueDate>${formData.invoiceData.issueDate}</cbc:IssueDate>
      <cbc:DueDate>${formData.invoiceData.dueDate}</cbc:DueDate>
      <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
      ${formData.invoiceData.notes ? `<cbc:Note>${formData.invoiceData.notes}</cbc:Note>` : ''}
      <cbc:DocumentCurrencyCode>${formData.invoiceData.currency}</cbc:DocumentCurrencyCode>
      <cbc:BuyerReference>${formData.buyer.leaderID || 'NO_REF'}</cbc:BuyerReference>
  
      <cac:AccountingSupplierParty>
          <cac:Party>
              <cbc:EndpointID schemeID="EM">${formData.seller.email}</cbc:EndpointID>
              ${formData.buyer.customerNumber ? `<cac:PartyIdentification>
                  <cbc:ID schemeID="0088">${formData.buyer.customerNumber}</cbc:ID>
              </cac:PartyIdentification>` : ''}
              <cac:PartyName>
                  <cbc:Name>${formData.seller.name}</cbc:Name>
              </cac:PartyName>
              <cac:PostalAddress>
                  <cbc:StreetName>${formData.seller.street}</cbc:StreetName>
                  <cbc:CityName>${formData.seller.city}</cbc:CityName>
                  <cbc:PostalZone>${formData.seller.postalCode}</cbc:PostalZone>
                  <cac:Country>
                      <cbc:IdentificationCode>${formData.seller.country}</cbc:IdentificationCode>
                  </cac:Country>
              </cac:PostalAddress>
              ${!formData.seller.isSmallBusiness && formData.seller.vatId ? `<cac:PartyTaxScheme>
                  <cbc:CompanyID>${formData.seller.vatId}</cbc:CompanyID>
                  <cac:TaxScheme>
                      <cbc:ID>VAT</cbc:ID>
                  </cac:TaxScheme>
              </cac:PartyTaxScheme>` : ''}
              ${formData.seller.isSmallBusiness ? `<cac:PartyTaxScheme>
                   <cbc:CompanyID>${formData.seller.taxNumber}</cbc:CompanyID>
                   <cac:TaxScheme>
                        <cbc:ID>FC</cbc:ID>
                   </cac:TaxScheme>
              </cac:PartyTaxScheme>` : ''}
              <cac:PartyLegalEntity>
                  <cbc:RegistrationName>${formData.seller.name}</cbc:RegistrationName>
                  ${!formData.seller.isSmallBusiness ? `<cbc:CompanyID>${formData.seller.taxNumber}</cbc:CompanyID>` : 
                  `<cbc:CompanyLegalForm>Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG</cbc:CompanyLegalForm>`}
              </cac:PartyLegalEntity>
              <cac:Contact>
                  <cbc:Name>${formData.seller.contact}</cbc:Name>
                  <cbc:Telephone>${formData.seller.phone}</cbc:Telephone>
                  <cbc:ElectronicMail>${formData.seller.email}</cbc:ElectronicMail>
              </cac:Contact>
          </cac:Party>
      </cac:AccountingSupplierParty>
  
      <cac:AccountingCustomerParty>
          <cac:Party>
              <cbc:EndpointID schemeID="EM">${formData.buyer.email}</cbc:EndpointID>
              <cac:PartyName>
                  <cbc:Name>${formData.buyer.name}</cbc:Name>
              </cac:PartyName>
              <cac:PostalAddress>
                  <cbc:StreetName>${formData.buyer.street}</cbc:StreetName>
                  <cbc:CityName>${formData.buyer.city}</cbc:CityName>
                  <cbc:PostalZone>${formData.buyer.postalCode}</cbc:PostalZone>
                  <cac:Country>
                      <cbc:IdentificationCode>${formData.buyer.country}</cbc:IdentificationCode>
                  </cac:Country>
              </cac:PostalAddress>
              ${formData.buyer.vatId ? `<cac:PartyTaxScheme>
                  <cbc:CompanyID>${formData.buyer.vatId}</cbc:CompanyID>
                  <cac:TaxScheme>
                      <cbc:ID>VAT</cbc:ID>
                  </cac:TaxScheme>
              </cac:PartyTaxScheme>` : ''}
              <cac:PartyLegalEntity>
                  <cbc:RegistrationName>${formData.buyer.name}</cbc:RegistrationName>
              </cac:PartyLegalEntity>
              <cac:Contact>
                  <cbc:ElectronicMail>${formData.buyer.email}</cbc:ElectronicMail>
              </cac:Contact>
          </cac:Party>
      </cac:AccountingCustomerParty>
  
      ${formData.invoiceData.deliveryDate ? `<cac:Delivery>
          <cbc:ActualDeliveryDate>${formData.invoiceData.deliveryDate}</cbc:ActualDeliveryDate>
      </cac:Delivery>` :''}
  
      <cac:PaymentMeans>
          <cbc:PaymentMeansCode>${formData.payment.type === 'sepa' ? '58' : '59'}</cbc:PaymentMeansCode>
          <cbc:PaymentID>${formData.payment.reference || formData.invoiceData.invoiceNumber}</cbc:PaymentID>
          <cac:PayeeFinancialAccount>
              <cbc:ID>${cleanIBAN}</cbc:ID>
              <cbc:Name>${formData.payment.accountHolder}</cbc:Name>
              ${formData.payment.bic ? `<cac:FinancialInstitutionBranch>
                  <cbc:ID>${formData.payment.bic}</cbc:ID>
              </cac:FinancialInstitutionBranch>` : ''}
          </cac:PayeeFinancialAccount>
      </cac:PaymentMeans>
  
      <cac:TaxTotal>
          <cbc:TaxAmount currencyID="${formData.invoiceData.currency}">${totalVatAmount.toFixed(2)}</cbc:TaxAmount>
          ${Object.values(vatBreakdowns).map(vb => `<cac:TaxSubtotal>
              <cbc:TaxableAmount currencyID="${formData.invoiceData.currency}">${vb.taxableAmount.toFixed(2)}</cbc:TaxableAmount>
              <cbc:TaxAmount currencyID="${formData.invoiceData.currency}">${vb.taxAmount.toFixed(2)}</cbc:TaxAmount>
              <cac:TaxCategory>
                  <cbc:ID>${vb.category}</cbc:ID>
                  <cbc:Percent>${vb.rate}</cbc:Percent>
                  ${vb.category !== 'S' ? `<cbc:TaxExemptionReason>${exemptionReasonMap[vb.category] || 'Steuerbefreit'}</cbc:TaxExemptionReason>` : ''}
                  <cac:TaxScheme>
                      <cbc:ID>VAT</cbc:ID>
                  </cac:TaxScheme>
              </cac:TaxCategory>
          </cac:TaxSubtotal>`).join('')}
      </cac:TaxTotal>
  
      <cac:LegalMonetaryTotal>
          <cbc:LineExtensionAmount currencyID="${formData.invoiceData.currency}">${totalNetAmount.toFixed(2)}</cbc:LineExtensionAmount>
          <cbc:TaxExclusiveAmount currencyID="${formData.invoiceData.currency}">${totalNetAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
          <cbc:TaxInclusiveAmount currencyID="${formData.invoiceData.currency}">${totalGrossAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
          <cbc:PayableAmount currencyID="${formData.invoiceData.currency}">${totalGrossAmount.toFixed(2)}</cbc:PayableAmount>
      </cac:LegalMonetaryTotal>
  
      ${formData.lineItems.map((item, index) => `<cac:InvoiceLine>
          <cbc:ID>${index + 1}</cbc:ID>
          <cbc:InvoicedQuantity unitCode="${getUnitCode(item.unit)}">${item.quantity}</cbc:InvoicedQuantity>
          <cbc:LineExtensionAmount currencyID="${formData.invoiceData.currency}">${(item.quantity * item.unitPrice).toFixed(2)}</cbc:LineExtensionAmount>
          <cac:Item>
              <cbc:Name>${item.description}</cbc:Name>
              <cac:ClassifiedTaxCategory>
                  <cbc:ID>${item.vatCategory}</cbc:ID>
                  <cbc:Percent>${item.vatRate}</cbc:Percent>
                  <cac:TaxScheme>
                      <cbc:ID>VAT</cbc:ID>
                  </cac:TaxScheme>
              </cac:ClassifiedTaxCategory>
          </cac:Item>
          <cac:Price>
              <cbc:PriceAmount currencyID="${formData.invoiceData.currency}">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
          </cac:Price>
      </cac:InvoiceLine>`).join('')}
  </Invoice>`;
  
    return xmlString;
  };