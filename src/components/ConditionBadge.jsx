import React from 'react';

export default function ConditionBadge({ condition }) {
  if (condition === 'New Original' || condition === 'Новая Оригинал') {
    return <span className="badge-condition badge-new-orig">✨ Новая (Оригинал)</span>;
  }
  if (condition === 'New Aftermarket' || condition === 'Новый Дубликат') {
    return <span className="badge-condition badge-new-after">⚙️ Новая (Дубликат)</span>;
  }
  return <span className="badge-condition badge-used">♻️ Б/У (Оригинал)</span>;
}
