import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FormState, SheetData } from './app-types';

interface FormContextProps {
  formState: FormState;
  setSiteName: (name: string) => void;
  addLocation: (loc: string) => void;
  removeLocation: (loc: string) => void;
  updateSheetData: (sheetName: keyof SheetData, data: any[]) => void;
}

const defaultSheetData: SheetData = {
  inverter: [],
  scb: [],
  tracker: [],
  other: [],
  inverterTransformer: [],
  meter: [],
  wms: [],
  incomer: [],
  icog: [],
  htPanel: []
};

const FormContext = createContext<FormContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'assetValidatorFormState';

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse form state from local storage', e);
    }
    return {
      siteName: '',
      locations: [],
      sheetData: defaultSheetData,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formState));
    } catch (e) {
      console.error('Failed to save form state to local storage', e);
    }
  }, [formState]);

  const setSiteName = (name: string) => {
    setFormState(prev => ({ ...prev, siteName: name }));
  };

  const addLocation = (loc: string) => {
    const formatted = loc.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (formatted && !formState.locations.includes(formatted)) {
      setFormState(prev => ({
        ...prev,
        locations: [...prev.locations, formatted]
      }));
    }
  };

  const removeLocation = (loc: string) => {
    setFormState(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== loc)
    }));
  };

  const updateSheetData = (sheetName: keyof SheetData, data: any[]) => {
    setFormState(prev => ({
      ...prev,
      sheetData: {
        ...prev.sheetData,
        [sheetName]: data
      }
    }));
  };

  return (
    <FormContext.Provider value={{ formState, setSiteName, addLocation, removeLocation, updateSheetData }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used within FormProvider');
  return context;
};
