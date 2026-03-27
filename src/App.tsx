import { useState } from 'react';
import { useFormContext } from './FormContext';
import { MasterLocations } from './components/MasterLocations';
import { SCBSheet } from './components/SCBSheet';
import { DynamicSheet } from './components/DynamicSheet';
import type { ColumnDef } from './components/DynamicSheet';
import { Download, ChevronRight, ChevronLeft } from 'lucide-react';

const SHEETS = [
  { id: 'master', name: 'Locations' },
  { id: 'inverter', name: 'Inverter' },
  { id: 'scb', name: 'SCB Validation' },
  { id: 'tracker', name: 'Tracker' },
  { id: 'inverterTransformer', name: 'Inverter Transformer' },
  { id: 'meter', name: 'Meter' },
  { id: 'wms', name: 'WMS' },
  { id: 'other', name: 'Other' },
  { id: 'incomer', name: 'Incomer' },
  { id: 'icog', name: 'ICOG' },
  { id: 'htPanel', name: 'HT Panel' }
];

const COLUMNS_DEF: Record<string, ColumnDef[]> = {
  inverter: [
    { key: 'inverterName', label: 'Inverter Name', type: 'text', required: true },
    { key: 'location', label: 'Location', type: 'location', required: true },
    { key: 'inverterType', label: 'Inverter Type', type: 'select', options: ['String Inverter', 'Central Inverter'], required: true },
    { key: 'oem', label: 'OEM', type: 'text' },
    { key: 'commissioningDate', label: 'Commissioning Date', type: 'date' },
    { key: 'latitude', label: 'Latitude', type: 'text' },
    { key: 'longitude', label: 'Longitude', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'dcCapacity', label: 'DC Capacity (KWp)', type: 'number', required: true },
    { key: 'acCapacity', label: 'AC Capacity (KW)', type: 'number' },
    { key: 'totalModules', label: 'Total Modules', type: 'number' }
  ],
  tracker: [
    { key: 'equipmentName', label: 'Equipment Name', type: 'text', required: true },
    { key: 'equipmentType', label: 'Equipment Type', type: 'text' },
    { key: 'latitude', label: 'Latitude', type: 'text' },
    { key: 'longitude', label: 'Longitude', type: 'text' },
    { key: 'oem', label: 'OEM', type: 'text' },
    { key: 'qty', label: 'Qty', type: 'number', required: true },
    { key: 'location', label: 'Location', type: 'location', required: true }
  ],
  inverterTransformer: [
    { key: 'inverterTransformerName', label: 'Inverter Transformer Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'location' }
  ],
  meter: [
    { key: 'location', label: 'Location', type: 'location' },
    { key: 'meterName', label: 'Meter Name', type: 'text' },
    { key: 'meterType', label: 'Meter Type', type: 'select', options: ['ABT', 'MFM', 'TVM'] }
  ],
  wms: [
    { key: 'sensorName', label: 'Sensor Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'location' },
    { key: 'oem', label: 'OEM', type: 'text' },
    { key: 'actualData', label: 'Actual Data', type: 'text' },
    { key: 'gridCorrected', label: 'Grid Corrected', type: 'text' }
  ],
  other: [
    { key: 'equipmentName', label: 'Equipment Name', type: 'text', required: true },
    { key: 'equipmentType', label: 'Equipment Type', type: 'text', required: true },
    { key: 'location', label: 'Location', type: 'location', required: true },
    { key: 'oem', label: 'OEM', type: 'text' },
    { key: 'commissioningDate', label: 'Commissioning Date', type: 'date' },
    { key: 'latitude', label: 'Latitude', type: 'text' },
    { key: 'longitude', label: 'Longitude', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number', required: true },
    { key: 'unitOfMeasurement', label: 'Unit Of Measurement', type: 'text' }
  ],
  incomer: [
    { key: 'incomerName', label: 'Incomer Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'location' }
  ],
  icog: [
    { key: 'icogName', label: 'ICOG Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'location' }
  ],
  htPanel: [
    { key: 'htPanelName', label: 'HT Panel Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'location' }
  ]
};

function App() {
  const { formState, setSiteName } = useFormContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [exporting, setExporting] = useState(false);

  const canProceedLoc = formState.locations.length > 0;
  // Ensure inverter array exists and has at least one complete valid inverter (or just length > 0 if sufficient)
  const canProceedInv = formState.sheetData.inverter && formState.sheetData.inverter.length > 0;

  const isStepAccessible = (targetStep: number) => {
    if (targetStep === 0) return true;
    if (targetStep === 1) return canProceedLoc;
    return canProceedLoc && canProceedInv;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const payload = { formData: formState };
      const res = await fetch('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Export failed');
      
      const fileName = formState.siteName 
        ? `${formState.siteName.replace(/[^a-zA-Z0-9_\- ]/g, '')}_Asset_Config_${Date.now()}.xlsx`
        : `Asset_Config_${Date.now()}.xlsx`;
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting Excel');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const nextStep = () => {
    if (isStepAccessible(currentStep + 1)) {
      setCurrentStep(prev => Math.min(prev + 1, SHEETS.length - 1));
    } else {
      alert("Please update Location and Inverter information before moving forward.");
    }
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const currentSheetId = SHEETS[currentStep].id;

  return (
    <div className="app-container">
      <div className="header fade-in">
        <h1>Asset Configuration Validator</h1>
        <p>Ensure backend-ready structured data with strictly enforced naming conventions</p>
        <div style={{ marginTop: '1.5rem', maxWidth: '400px', margin: '1.5rem auto 0 auto', textAlign: 'left' }}>
          <label className="form-label">Site Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Enter Site Name (e.g. Project Alpha)" 
            value={formState.siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>
      </div>

      <div className="stepper fade-in">
        {SHEETS.map((s, index) => {
          const accessible = isStepAccessible(index);
          return (
            <div 
              key={s.id} 
              className={`step-item ${currentStep === index ? 'active' : ''}`}
              onClick={() => accessible && setCurrentStep(index)}
              style={{ cursor: accessible ? 'pointer' : 'not-allowed', opacity: accessible ? 1 : 0.5 }}
              title={accessible ? '' : 'Complete previous mandatory steps to unlock'}
            >
              {s.name}
            </div>
          );
        })}
      </div>

      <div style={{ minHeight: '50vh', marginBottom: '2rem' }}>
        {currentSheetId === 'master' && <MasterLocations />}
        {currentSheetId === 'scb' && <SCBSheet />}
        {currentSheetId !== 'master' && currentSheetId !== 'scb' && (
          <DynamicSheet 
            key={currentSheetId} 
            sheetKey={currentSheetId} 
            title={SHEETS[currentStep].name} 
            columns={COLUMNS_DEF[currentSheetId] || []} 
          />
        )}
      </div>

      <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <button className="btn" onClick={prevStep} disabled={currentStep === 0} style={{ backgroundColor: 'var(--bg-card)', color: 'white', border: '1px solid var(--border-color)'}}>
          <ChevronLeft size={18} /> Previous
        </button>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={handleExport} disabled={exporting}>
            <Download size={18} /> {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <button className="btn" onClick={nextStep} disabled={currentStep === SHEETS.length - 1 || !isStepAccessible(currentStep + 1)}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
