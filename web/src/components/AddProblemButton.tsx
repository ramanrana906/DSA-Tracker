'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddProblemModal from './AddProblemModal';

export default function AddProblemButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Add Problem
      </button>
      
      {isOpen && (
        <AddProblemModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
