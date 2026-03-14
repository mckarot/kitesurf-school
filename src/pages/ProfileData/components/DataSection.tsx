// src/pages/ProfileData/components/DataSection.tsx

import { ReactNode } from 'react';

interface DataSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DataSection({ title, icon, children, className = '' }: DataSectionProps) {
  return (
    <section
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}
      role="region"
      aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2
          id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-lg font-semibold text-gray-900 flex items-center gap-2"
        >
          {icon}
          {title}
        </h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </section>
  );
}
