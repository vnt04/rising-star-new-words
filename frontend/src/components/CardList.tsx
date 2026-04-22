'use client';

import { useState } from 'react';
import { Card } from '@/lib/types';

interface CardPatch {
  front?: string;
  back?: string;
  example?: string;
}

interface Props {
  cards: Card[];
  onUpdate: (id: string, patch: CardPatch) => void;
  onDelete: (id: string) => void;
}

function CardRow({
  card,
  onUpdate,
  onDelete,
}: {
  card: Card;
  onUpdate: (id: string, patch: CardPatch) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [example, setExample] = useState(card.example ?? '');

  function handleSave() {
    onUpdate(card.id, {
      front: front.trim() || card.front,
      back: back.trim() || card.back,
      example: example.trim() || undefined,
    });
    setEditing(false);
  }

  function handleCancel() {
    setFront(card.front);
    setBack(card.back);
    setExample(card.example ?? '');
    setEditing(false);
  }

  if (!editing) {
    return (
      <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-800">{card.front}</p>
            <p className="text-sm text-slate-600 mt-1">{card.back}</p>
            {card.example && (
              <p className="text-xs text-slate-400 mt-1 italic">{card.example}</p>
            )}
          </div>
          <div className="ml-4 shrink-0 flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(card.id)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-indigo-300 bg-white p-4 shadow-sm space-y-2">
      <input
        className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Front"
      />
      <input
        className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Back"
      />
      <input
        className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
        value={example}
        onChange={(e) => setExample(e.target.value)}
        placeholder="Example (optional)"
      />
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="text-sm text-slate-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </li>
  );
}

export default function CardList({ cards, onUpdate, onDelete }: Props) {
  if (cards.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        No cards yet. Add your first card above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {cards.map((card) => (
        <CardRow
          key={card.id}
          card={card}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
