import * as XLSX from 'xlsx';
import type { FormState } from './app-types';

// Header definitions per sheet — mirrors what the server copies from the template
const SHEET_HEADERS: Record<string, string[][]> = {
  Location: [
    ['Asset Configuration — Location Master'],
    ['Location Name'],
  ],
  Inverter: [
    ['Asset Configuration — Inverter'],
    ['Inverter Name', 'Location', 'Inverter Type', 'OEM', 'Commissioning Date', 'Latitude', 'Longitude', 'Status', 'DC Capacity (KWp)', 'AC Capacity (KW)', 'Total Modules'],
    // data starts row 3
  ],
  SCB: [
    ['Asset Configuration — SCB'],
    ['Location', 'Inverter Name', 'SCB Qty', 'Max Strings', 'Generated String Name'],
    // data starts row 3
  ],
  Tracker: [
    ['Asset Configuration — Tracker'],
    ['Equipment Name', 'Equipment Type', 'Latitude', 'Longitude', 'OEM', 'Qty', 'Location'],
    // data starts row 3
  ],
  'Inverter Transformer': [
    ['Inverter Transformer Name', 'Location'],
    // data starts row 2
  ],
  Meter: [
    ['Location', 'Meter Name', 'Meter Type'],
    // data starts row 2
  ],
  WMS: [
    ['Sensor Name', 'Location', 'OEM', 'Actual Data', 'Grid Corrected'],
    // data starts row 2
  ],
  Other: [
    ['Asset Configuration — Other Equipment'],
    ['Equipment Name', 'Equipment Type', 'Location', 'OEM', 'Commissioning Date', 'Latitude', 'Longitude', 'Status', 'Quantity', 'Unit Of Measurement'],
    // data starts row 3
  ],
  Incomer: [
    ['Incomer Name', 'Location'],
  ],
  ICOG: [
    ['ICOG Name', 'Location'],
  ],
  'HT Panel': [
    ['HT Panel Name', 'Location'],
  ],
};

export function exportToExcel(formState: FormState): void {
  const wb = XLSX.utils.book_new();

  const addSheet = (sheetName: string, dataRows: (string | number | null)[][]) => {
    const headers = SHEET_HEADERS[sheetName] ?? [];
    const allRows = [...headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  // --- Location ---
  const locationRows = (formState.locations ?? []).map(loc => [loc]);
  addSheet('Location', locationRows);

  // --- Inverter ---
  const inverterRows = (formState.sheetData.inverter ?? []).map(row => [
    row.inverterName,
    row.location,
    row.inverterType,
    row.oem,
    row.commissioningDate || null,
    row.latitude,
    row.longitude,
    row.status,
    row.dcCapacity ? Number(row.dcCapacity) : null,
    row.acCapacity ? Number(row.acCapacity) : null,
    row.totalModules ? Number(row.totalModules) : null,
  ]);
  addSheet('Inverter', inverterRows);

  // --- SCB — expand into individual string rows ---
  const scbRows: (string | number | null)[][] = [];
  (formState.sheetData.scb ?? []).forEach(row => {
    if (!row.location || !row.inverterName || !row.scbQty || !row.maxStrings) return;
    for (let s = 1; s <= row.scbQty; s++) {
      for (let str = 1; str <= row.maxStrings; str++) {
        const stringName = `${row.location}_${row.inverterName}_SCB${s}_STRING${str}`;
        scbRows.push([row.location, row.inverterName, row.scbQty, row.maxStrings, stringName]);
      }
    }
  });
  addSheet('SCB', scbRows);

  // --- Tracker ---
  const trackerRows = (formState.sheetData.tracker ?? []).map(row => [
    row.equipmentName,
    row.equipmentType,
    row.latitude,
    row.longitude,
    row.oem,
    row.qty ? Number(row.qty) : null,
    row.location,
  ]);
  addSheet('Tracker', trackerRows);

  // --- Inverter Transformer ---
  const itRows = (formState.sheetData.inverterTransformer ?? []).map((row: any) => [
    row.inverterTransformerName,
    row.location,
  ]);
  addSheet('Inverter Transformer', itRows);

  // --- Meter ---
  const meterRows = (formState.sheetData.meter ?? []).map((row: any) => [
    row.location,
    row.meterName,
    row.meterType,
  ]);
  addSheet('Meter', meterRows);

  // --- WMS ---
  const wmsRows = (formState.sheetData.wms ?? []).map((row: any) => [
    row.sensorName,
    row.location,
    row.oem,
    row.actualData,
    row.gridCorrected,
  ]);
  addSheet('WMS', wmsRows);

  // --- Other ---
  const otherRows = (formState.sheetData.other ?? []).map(row => [
    row.equipmentName,
    row.equipmentType,
    row.location,
    row.oem,
    row.commissioningDate || null,
    row.latitude,
    row.longitude,
    row.status,
    row.quantity ? Number(row.quantity) : null,
    row.unitOfMeasurement,
  ]);
  addSheet('Other', otherRows);

  // --- Incomer ---
  const incomerRows = (formState.sheetData.incomer ?? []).map((row: any) => [
    row.incomerName,
    row.location,
  ]);
  addSheet('Incomer', incomerRows);

  // --- ICOG ---
  const icogRows = (formState.sheetData.icog ?? []).map((row: any) => [
    row.icogName,
    row.location,
  ]);
  addSheet('ICOG', icogRows);

  // --- HT Panel ---
  const htPanelRows = (formState.sheetData.htPanel ?? []).map((row: any) => [
    row.htPanelName,
    row.location,
  ]);
  addSheet('HT Panel', htPanelRows);

  // --- Trigger download ---
  const fileName = formState.siteName
    ? `${formState.siteName.replace(/[^a-zA-Z0-9_\- ]/g, '')}_Asset_Config_${Date.now()}.xlsx`
    : `Asset_Config_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
