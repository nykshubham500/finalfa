import React from 'react';
import { useFormContext } from '../FormContext';
import { Plus, Trash2 } from 'lucide-react';

export interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'location' | 'select';
  options?: string[];
  required?: boolean;
}

interface DynamicSheetProps {
  sheetKey: string;
  title: string;
  columns: ColumnDef[];
}

export const DynamicSheet: React.FC<DynamicSheetProps> = ({ sheetKey, title, columns }) => {
  const { formState, updateSheetData } = useFormContext();
  const rows = formState.sheetData[sheetKey] || [];

  const addRow = () => {
    const newRow: any = {};
    columns.forEach(c => { newRow[c.key] = ''; });
    updateSheetData(sheetKey, [...rows, newRow]);
  };

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    updateSheetData(sheetKey, newRows);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    updateSheetData(sheetKey, newRows);
  };

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>{title}</h2>
        <button onClick={addRow} className="btn"><Plus size={18} /> Add Row</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label} {col.required && '*'}</th>
              ))}
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>No data entered.</td>
              </tr>
            ) : rows.map((row: any, index: number) => (
              <tr key={index}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.type === 'location' ? (
                      <select
                        value={row[col.key] || ''}
                        onChange={e => updateRow(index, col.key, e.target.value)}
                        style={{ borderColor: col.required && !row[col.key] ? 'var(--error)' : 'var(--border-color)'}}
                      >
                        <option value="">Select Location</option>
                        {formState.locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    ) : col.type === 'select' ? (
                      <select
                        value={row[col.key] || ''}
                        onChange={e => updateRow(index, col.key, e.target.value)}
                        style={{ borderColor: col.required && !row[col.key] ? 'var(--error)' : 'var(--border-color)'}}
                      >
                        <option value="">Select Option</option>
                        {col.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={col.type}
                        value={row[col.key] || ''}
                        onChange={e => updateRow(index, col.key, e.target.value)}
                        placeholder={`Enter ${col.label}`}
                        style={{ borderColor: col.required && !row[col.key] ? 'var(--error)' : 'var(--border-color)'}}
                      />
                    )}
                  </td>
                ))}
                <td>
                  <button onClick={() => removeRow(index)} className="btn-danger" style={{ padding: '0.4rem', borderRadius: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
