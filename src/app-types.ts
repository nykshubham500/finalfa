export interface SCBRow {
  location: string;
  inverterName: string;
  scbQty: number;
  maxStrings: number;
}

export interface TrackerRow {
  equipmentName: string;
  equipmentType: string;
  latitude: string;
  longitude: string;
  oem: string;
  qty: number;
  location: string;
}

export interface InverterRow {
  inverterName: string;
  location: string;
  inverterType: string;
  oem: string;
  commissioningDate: string;
  latitude: string;
  longitude: string;
  status: string;
  dcCapacity: string;
  acCapacity: string;
  totalModules: string;
}

export interface OtherRow {
  equipmentName: string;
  equipmentType: string;
  location: string;
  oem: string;
  commissioningDate: string;
  latitude: string;
  longitude: string;
  status: string;
  quantity: string;
  unitOfMeasurement: string;
}

export type SheetData = {
  inverter: InverterRow[];
  scb: SCBRow[];
  tracker: TrackerRow[];
  other: OtherRow[];
  inverterTransformer: any[];
  meter: any[];
  wms: any[];
  incomer: any[];
  icog: any[];
  htPanel: any[];
  [key: string]: any[];
};

export interface FormState {
  siteName: string;
  locations: string[];
  sheetData: SheetData;
}
