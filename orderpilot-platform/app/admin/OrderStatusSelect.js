
'use client';

import { useState } from 'react';

const statuses = [
  ['new', 'Neu'],
  ['accepted', 'Angenommen'],
  ['preparing', 'In Zubereitung'],
  ['ready', 'Bereit'],
  ['completed', 'Abgeschlossen'],
  ['cancelled', 'Storniert'],
];

export default function OrderStatusSelect({ orderId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(event) {
    const nextStatus = event.target.value;
    const previousStatus = status;

    setStatus(nextStatus);
    setSaving(true);

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen');
      }
    } catch {
      setStatus(previousStatus);
      alert('Status konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      style={{
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        background: '#ffffff',
        color: '#17231b',
      }}
    >
      {statuses.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
