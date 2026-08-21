'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddMistakeModal from './AddMistakeModal';

type ProblemOption = { id: number; title: string };

export default function AddMistakeButton({ problems }: { problems: ProblemOption[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Add Mistake
      </button>

      {isOpen && (
        <AddMistakeModal problems={problems} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
