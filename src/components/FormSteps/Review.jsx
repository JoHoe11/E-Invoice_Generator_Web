// src/components/FormSteps/Review.jsx
import React from 'react';
import { useForm } from '../../contexts/FormContext';
import { generateXML } from '../../utils/xmlGenerator';

export default function Review({ onPrevious }) {
  const { state } = useForm();
  const { formData } = state;

  // Calculate totals consistently with LineItems
  const calculateTotals = () => {
    let netTotal = 0;
    let vatTotal = 0;
    
    formData.lineItems.forEach(item => {
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

  const handleGenerate = async () => {
    try {
      const totals = calculateTotals();
      const xml = await generateXML({ 
        ...formData, 
        totals: {
          netAmount: totals.netTotal,
          vatAmount: totals.vatTotal,
          grossAmount: totals.grossTotal
        } 
      });
      
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `XRechnung_${formData.invoiceData.invoiceNumber}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error generating XML: ' + error.message);
    }
  };

  const totals = calculateTotals();

  // Helper function to display a field only if it has a value
  const displayIfExists = (value, prefix = '') => {
    if (value && String(value).trim()) {
      return prefix ? `${prefix}: ${value}` : value;
    }
    return null;
  };

  // Get formatted payment type
  const getPaymentType = () => {
    switch(formData.payment.type) {
      case 'sepa': return 'SEPA-Überweisung';
      case 'directDebit': return 'SEPA-Lastschrift';
      default: return formData.payment.type;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Rechnungsvorschau</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-dornBox dark:border dark:border-dornBorder">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-dornBorder">
            Rechnungsdetails
          </h3>
          <div className="space-y-2">
            {displayIfExists(formData.invoiceData.invoiceNumber, 'Rechnungsnummer') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rechnungsnummer:</span>
                <span className="font-medium">{formData.invoiceData.invoiceNumber}</span>
              </div>
            )}
            {displayIfExists(formData.invoiceData.issueDate, 'Ausstellungsdatum') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ausstellungsdatum:</span>
                <span className="font-medium">{formatDate(formData.invoiceData.issueDate)}</span>
              </div>
            )}
            {displayIfExists(formData.invoiceData.dueDate, 'Ausstellungsdatum') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fälligkeitsdatum:</span>
                <span className="font-medium">{formatDate(formData.invoiceData.dueDate)}</span>
              </div>
            )}
            {displayIfExists(formData.invoiceData.currency, 'Währung') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Währung:</span>
                <span className="font-medium">{formData.invoiceData.currency}</span>
              </div>
            )}
            {displayIfExists(formData.invoiceData.notes, 'Bemerkung') && (
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400">Bemerkung:</span>
                <span className="font-medium mt-1">{formData.invoiceData.notes}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-dornBox dark:border dark:border-dornBorder">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-dornBorder">
            Zahlungsdaten
          </h3>
          <div className="space-y-2">
            {displayIfExists(getPaymentType(), 'Zahlungsart') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Zahlungsart:</span>
                <span className="font-medium">{getPaymentType()}</span>
              </div>
            )}
            {displayIfExists(formData.payment.iban, 'IBAN') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">IBAN:</span>
                <span className="font-medium">{formData.payment.iban}</span>
              </div>
            )}
            {displayIfExists(formData.payment.accountHolder, 'Kontoinhaber') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Kontoinhaber:</span>
                <span className="font-medium">{formData.payment.accountHolder}</span>
              </div>
            )}
            {displayIfExists(formData.payment.bic, 'BIC') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">BIC:</span>
                <span className="font-medium">{formData.payment.bic}</span>
              </div>
            )}
            {displayIfExists(formData.payment.reference, 'Zahlungsbedingungen') && (
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400">Zahlungsbedingungen:</span>
                <span className="font-medium">{formData.payment.reference}</span>
              </div>
            )}
            {formData.payment.type === 'directDebit' && displayIfExists(formData.payment.mandateRef, 'Mandatsreferenz') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mandatsreferenz:</span>
                <span className="font-medium">{formData.payment.mandateRef}</span>
              </div>
            )}
            {formData.payment.type === 'directDebit' && displayIfExists(formData.payment.creditorId, 'Gläubiger-ID') && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Gläubiger-ID:</span>
                <span className="font-medium">{formData.payment.creditorId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-dornBox dark:border dark:border-dornBorder">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-dornBorder">
            Rechnungssteller
          </h3>
          <div className="space-y-3">
            <div className="font-medium text-lg">{formData.seller.name}</div>
            <div>{formData.seller.street}</div>
            <div>{formData.seller.postalCode} {formData.seller.city}</div>
            
            <div className="border-t pt-3 mt-3 dark:border-dornBorder">
              {displayIfExists(formData.seller.contact) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kontaktperson:</span>
                  <span>{formData.seller.contact}</span>
                </div>
              )}
              {displayIfExists(formData.seller.email) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">E-Mail:</span>
                  <span>{formData.seller.email}</span>
                </div>
              )}
              {displayIfExists(formData.seller.phone) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Telefon:</span>
                  <span>{formData.seller.phone}</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-3 mt-3 dark:border-dornBorder">
              {displayIfExists(formData.seller.vatId) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Umsatzsteuer-ID:</span>
                  <span>{formData.seller.vatId}</span>
                </div>
              )}
              {displayIfExists(formData.seller.taxNumber) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Steuernummer:</span>
                  <span>{formData.seller.taxNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-dornBox dark:border dark:border-dornBorder">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-dornBorder">
            Rechnungsempfänger
          </h3>
          <div className="space-y-3">
            <div className="font-medium text-lg">{formData.buyer.name}</div>
            <div>{formData.buyer.street}</div>
            <div>{formData.buyer.postalCode} {formData.buyer.city}</div>
            
            <div className="border-t pt-3 mt-3 dark:border-dornBorder">
              {displayIfExists(formData.buyer.contact) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kontaktperson:</span>
                  <span>{formData.buyer.contact}</span>
                </div>
              )}
              {displayIfExists(formData.buyer.email) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">E-Mail:</span>
                  <span>{formData.buyer.email}</span>
                </div>
              )}
              {displayIfExists(formData.buyer.phone) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Telefon:</span>
                  <span>{formData.buyer.phone}</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-3 mt-3 dark:border-dornBorder">
              {displayIfExists(formData.buyer.vatId) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Umsatzsteuer-ID:</span>
                  <span>{formData.buyer.vatId}</span>
                </div>
              )}
              {displayIfExists(formData.buyer.leaderID) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Leitweg-ID:</span>
                  <span>{formData.buyer.leaderID}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md dark:bg-dornBox dark:border dark:border-dornBorder">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 dark:border-dornBorder">
          Produkt(e)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dornBorder">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Bezeichnung
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Menge
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Einheit
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Stückpreis
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  MwSt
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Gesamt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dornBox dark:divide-dornBorder">
              {formData.lineItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-[#1f1f1f]' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.description}</div>
                    {item.vatRate === 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Steuercode: {item.vatCategory}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {(() => {
                      switch(item.unit) {
                        case 'piece': return 'Stück';
                        case 'hour': return 'Stunde(n)';
                        case 'day': return 'Tag(e)';
                        case 'kilogram': return 'Kilogramm';
                        case 'meter': return 'Meter';
                        case 'liter': return 'Liter';
                        default: return item.unit;
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {item.unitPrice.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {item.vatRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                    {(item.quantity * item.unitPrice).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Rechnungssumme - styled to match LineItemTotals */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-6 dark:bg-dornBox dark:border dark:border-dornBorder">
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
      
      <div className="flex justify-between pt-4">
      <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center dark:bg-transparent dark:text-white dark:border dark:border-dornBorder dark:hover:bg-dornBox dark:hover:border-red-800 dark:hover:text-red-800"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
        <button
          type="button"
          onClick={handleGenerate}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 flex items-center font-semibold dark:bg-red-700 dark:hover:bg-red-800"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          XRechnung generieren
        </button>
      </div>
    </div>
  );
}