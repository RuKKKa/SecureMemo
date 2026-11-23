import React from 'react';
import { Plus } from 'lucide-react';

interface FabButtonProps {
  onClick: () => void;
}

export const FabButton: React.FC<FabButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed right-5 bottom-6 md:right-8 md:bottom-8 z-30 group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 transform hover:-translate-y-1 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/30"
      aria-label="新規メモ作成"
      title="新規メモ作成"
    >
      <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
    </button>
  );
};
