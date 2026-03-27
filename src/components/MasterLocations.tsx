import React, { useState } from 'react';
import { useFormContext } from '../FormContext';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export const MasterLocations: React.FC = () => {
  const { formState, addLocation, removeLocation } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const formatted = inputValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (formState.locations.includes(formatted)) {
      setError('Location already exists.');
      return;
    }

    addLocation(inputValue);
    setInputValue('');
    setError('');
  };

  return (
    <div className="card fade-in">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin className="text-primary-color" />
        Master Locations
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Define all unique locations here (e.g. ICR 1). They will be auto-formatted to remove spaces and special characters. Duplicates are not allowed.
      </p>

      <form onSubmit={handleAdd} className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            className="form-input"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setError(''); }}
            placeholder="Enter location name (e.g. ICR 1)"
          />
          {error && <div className="error-text">{error}</div>}
        </div>
        <button type="submit" className="btn">
          <Plus size={18} /> Add
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Configured Locations ({formState.locations.length})</h3>
        
        {formState.locations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            No locations defined yet. Add one above to start.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {formState.locations.map(loc => (
              <div key={loc} style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{loc}</span>
                <button 
                  onClick={() => removeLocation(loc)}
                  className="btn-danger" 
                  style={{ padding: '0.25rem', borderRadius: '4px', border: 'none' }}
                  title="Remove location"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
