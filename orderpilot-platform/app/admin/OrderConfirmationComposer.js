'use client';

import { useState } from 'react';

const isDelivery = (type) => type === 'lieferung' || type === 'delivery';

function sameTime(a, b) {
  const normalize = (value) => String(value || '').trim().toLowerCase()
    .replace(/\s*uhr$/, '').replace('.', ':');
  return normalize(a) === normalize(b);
}

function buildMessage({ orderNumber, name, requestedTime, agreedTime, pickupType }) {
  const delivery = isDelivery(pickupType);
  const changed = requestedTime && !sameTime(requestedTime, agreedTime);
  const greeting = `Guten Tag${name ? ` ${name}` : ''}, vielen Dank für Ihre Bestellung ${orderNumber}.`;
  if (delivery && changed) {
    return `${greeting}\n\nDie voraussichtliche Lieferzeit ist ${agreedTime} Uhr. Sie hatten ${requestedTime} Uhr als Wunschzeit angegeben. Passt die neue Zeit für Sie?`;
  }
  if (delivery) return `${greeting}\n\nWir bestätigen die voraussichtliche Lieferzeit um ${agreedTime} Uhr.`;
  if (changed) {
    return `${greeting}\n\nIhre Bestellung ist um ${agreedTime} Uhr zur Abholung bereit. Sie hatten ${requestedTime} Uhr als Wunschzeit angegeben. Passt die neue Zeit für Sie?`;
  }
  return `${greeting}\n\nIhre Bestellung ist um ${agreedTime} Uhr zur Abholung bereit.`;
}

export default function OrderConfirmationComposer({ order }) {
  const [channel, setChannel] = useState(order.communication_channel || '');
  const [agreedTime, setAgreedTime] = useState(order.agreed_time || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function prepareMessage() {
    setError('');
    setSaved(false);
    if (!channel || !agreedTime) {
      setError('Bitte Kanal und zugesagte Zeit angeben.');
      return;
    }
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, communicationChannel: channel, agreedTime }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Daten konnten nicht gespeichert werden.');
      setSaved(true);
      setMessage(buildMessage({
        orderNumber: order.order_number,
        name: order.customer_name,
        requestedTime: order.requested_time,
        agreedTime,
        pickupType: order.pickup_type,
      }));
    } catch (cause) {
      setError(cause.message || 'Daten konnten nicht gespeichert werden.');
    }
  }

  async function copyMessage() {
    try { await navigator.clipboard.writeText(message); }
    catch { setError('Kopieren nicht möglich. Bitte Text markieren und kopieren.'); }
  }

  const phone = String(order.customer_phone || '').trim();
  const hasInternationalPhone = phone.startsWith('+') || phone.startsWith('00');
  const whatsappPhone = phone.replace(/^\+|^00/, '').replace(/\D/g, '');
  const channelUrl = channel === 'whatsapp' && hasInternationalPhone && whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
    : channel === 'telegram'
      ? `https://t.me/share/url?text=${encodeURIComponent(message)}`
      : null;

  return (
    <div className="confirmationComposer">
      <label className="confirmationLabel">
        Kanal
        <select value={channel} onChange={(event) => { setChannel(event.target.value); setMessage(''); }}>
          <option value="">Auswählen</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
        </select>
      </label>
      <label className="confirmationLabel">
        Zugesagte Zeit
        <input type="time" value={agreedTime} onChange={(event) => { setAgreedTime(event.target.value); setMessage(''); }} />
      </label>
      <button type="button" className="confirmationPrepare" onClick={prepareMessage}>Nachricht vorbereiten</button>
      {error && <p className="confirmationError">{error}</p>}
      {message && (
        <div className="confirmationResult">
          <p className="confirmationHint">
            {channel === 'telegram'
              ? 'Der Telegram-Kontakt des Kunden ist nicht gespeichert. Im Telegram-Auswahldialog den Empfänger selbst wählen oder den Text kopieren.'
              : hasInternationalPhone
                ? `Empfänger: ${phone}. Bitte Nummer und Nachricht prüfen und selbst senden.`
                : `Für WhatsApp-Link fehlt eine eindeutig internationale Nummer. Gespeicherte Nummer: ${phone || 'keine'}. Text kopieren und Empfänger manuell öffnen.`}
          </p>
          <textarea readOnly value={message} rows={5} aria-label="Nachricht zur Prüfung" />
          <div className="confirmationActions">
            <button type="button" onClick={copyMessage}>Text kopieren</button>
            {channelUrl && (
              <a href={channelUrl} target="_blank" rel="noreferrer">
                {channel === 'whatsapp' ? 'WhatsApp öffnen' : 'Telegram öffnen'}
              </a>
            )}
          </div>
          {saved && <small>Bestätigungskanal und zugesagte Zeit gespeichert.</small>}
        </div>
      )}
    </div>
  );
}
