// src/contexts/FormContext.jsx
import { createContext, useContext, useReducer } from 'react';

const FormContext = createContext();

const initialState = {
  currentStep: 0,
  formData: {
    invoiceData: {
      invoiceNumber: '',
      issueDate: '',
      dueDate:'',
      currency: 'EUR',
      invoiceType: 'Invoice',
      deliveryDate: '',
      notes: '',
    },
    seller: {
      name: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'DE',
      email: '',
      contact: '',
      phone: '',
      vatId: '',
      taxNumber: '',
      isSmallBusiness: false,
    },
    buyer: {
      name: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'DE',
      leaderID: '',
      email: '',
      contact: '',
      phone: '',
      customerNumber: '',
      vatId: '',
    },
    payment: {
      type: 'sepa',
      accountHolder: '',
      iban: '',
      bic: '',
      reference: '',
      mandateRef: '',
      creditorId: '',
    },
    lineItems: [],
    attachments: [],
    totals: {
      netAmount: 0,
      vatAmount: 0,
      grossAmount: 0,
    },
  },
  errors: {},
};

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.section]: {
            ...state.formData[action.section],
            ...action.data,
          },
        },
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step,
      };
    case 'UPDATE_LINE_ITEMS':
      return {
        ...state,
        formData: {
          ...state.formData,
          lineItems: action.items,
        },
      };
    case 'UPDATE_ERRORS':
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.errors,
        },
      };
    default:
      return state;
  }
}

export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const updateFormData = (section, data) => {
    dispatch({ type: 'UPDATE_FORM_DATA', section, data });
  };

  const setStep = (step) => {
    dispatch({ type: 'SET_STEP', step });
  };

  const updateLineItems = (items) => {
    dispatch({ type: 'UPDATE_LINE_ITEMS', items });
  };

  const updateErrors = (errors) => {
    dispatch({ type: 'UPDATE_ERRORS', errors });
  };

  return (
    <FormContext.Provider
      value={{
        state,
        updateFormData,
        setStep,
        updateLineItems,
        updateErrors,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};