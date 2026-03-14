// src/components/ReservationHistory/ReservationFilters.tsx

import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ReservationFiltersProps {
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  };
  onChange: (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }) => void;
  onClear: () => void;
}

export function ReservationFilters({ filters, onChange, onClear }: ReservationFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            label="Rechercher"
            type="text"
            placeholder="Cours, étudiant, lieu..."
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onChange({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value })}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
            <option value="completed">Terminé</option>
          </select>
        </div>

        {/* Start Date */}
        <Input
          label="Du"
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
        />

        {/* End Date */}
        <Input
          label="Au"
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
        />
      </div>

      {/* Clear filters button */}
      <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
        <Button variant="ghost" size="sm" onClick={onClear}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Effacer les filtres
        </Button>
      </div>
    </div>
  );
}
