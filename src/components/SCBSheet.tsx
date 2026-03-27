import React from 'react';
import { useFormContext } from '../FormContext';
import type { SCBRow } from '../app-types';
import { Plus, Trash2 } from 'lucide-react';

export const SCBSheet: React.FC = () => {
  const { formState, updateSheetData } = useFormContext();
  const rows: SCBRow[] = formState.sheetData.scb || [];

  const addRow = () => {
    updateSheetData('scb', [
      ...rows,
      { location: '', inverterName: '', scbQty: 1, maxStrings: 1 }
    ]);
  };

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    updateSheetData('scb', newRows);
  };

  const updateRow = (index: number, field: keyof SCBRow, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    updateSheetData('scb', newRows);
  };

  // Generate previews
  const generatePreviews = () => {
    const groupedPreviews: Record<string, string[]> = {};
    rows.forEach(row => {
      if (!row.location || !row.inverterName || !row.scbQty || !row.maxStrings) return;
      
      if (!groupedPreviews[row.location]) {
        groupedPreviews[row.location] = [];
      }
      
      for (let s = 1; s <= row.scbQty; s++) {
        for (let str = 1; str <= row.maxStrings; str++) {
          groupedPreviews[row.location].push(`${row.location}_${row.inverterName}_SCB${s}_STRING${str}`);
        }
      }
    });
    return groupedPreviews;
  };

  const groupedPreviews = generatePreviews();
  const hasPreviews = Object.keys(groupedPreviews).length > 0;

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>SCB Configuration</h2>
        <button onClick={addRow} className="btn"><Plus size={18} /> Add Row</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Location *</th>
              <th>Inverter Name *</th>
              <th>SCB Qty *</th>
              <th>Max Strings *</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No SCB rows added.</td>
              </tr>
            ) : rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <select 
                    value={row.location} 
                    onChange={e => updateRow(index, 'location', e.target.value)}
                    style={{ borderColor: !row.location ? 'var(--error)' : 'var(--border-color)'}}
                  >
                    <option value="">Select Location</option>
                    {formState.locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={row.inverterName || ''}
                    onChange={e => updateRow(index, 'inverterName', e.target.value)}
                    style={{ borderColor: !row.inverterName ? 'var(--error)' : 'var(--border-color)'}}
                  >
                    <option value="">Select Inverter</option>
                    {(formState.sheetData.inverter || [])
                      .filter((inv: any) => !row.location || inv.location === row.location)
                      .map((inv: any) => (
                      <option key={inv.inverterName} value={inv.inverterName}>
                        {inv.inverterName}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    min="1"
                    value={row.scbQty || ''}
                    onChange={e => updateRow(index, 'scbQty', parseInt(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="1"
                    value={row.maxStrings || ''}
                    onChange={e => updateRow(index, 'maxStrings', parseInt(e.target.value) || 0)}
                  />
                </td>
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

      {hasPreviews && (
        <div className="preview-panel">
          {Object.entries(groupedPreviews).map(([location, previews]) => (
            <div key={location} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>
                {location} - Generated Preview ({previews.length} strings)
              </h3>
              <div className="preview-list">
                {previews.slice(0, 50).map((pv, i) => (
                  <div key={i} className="preview-item">{pv}</div>
                ))}
              </div>
              {previews.length > 50 && (
                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                  ...and {previews.length - 50} more items in {location}.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
