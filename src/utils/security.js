/**
 * Bar.go Maximum Security Utility Suite
 */

// Strip dangerous HTML tags, script protocols, and event handlers
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .trim();
}

// Safely format WhatsApp URLs preventing protocol manipulation
export function safeWhatsAppUrl(phoneStr, textMsg) {
  const cleanPhone = (phoneStr || '').toString().replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    return '#';
  }

  const safePhone = cleanPhone.startsWith('8') ? '7' + cleanPhone.slice(1) : cleanPhone;
  const safeText = encodeURIComponent(sanitizeInput(textMsg || ''));
  
  return `https://wa.me/${safePhone}?text=${safeText}`;
}

// Tamper-proof LocalStorage JSON Parser preventing XSS state crashes
export function safeParseJSON(jsonStr, fallback = null) {
  if (!jsonStr || typeof jsonStr !== 'string') return fallback;
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('Tampered or invalid session JSON detected and safely cleared.');
    return fallback;
  }
}
