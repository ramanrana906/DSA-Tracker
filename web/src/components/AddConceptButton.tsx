'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddConceptModal from './AddConceptModal';

export default function AddConceptButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> New Note
      </button>

      {isOpen && (
        <AddConceptModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
