// src/pages/Admin/Wallets/index.tsx
// Page Admin de gestion des portefeuilles élèves (système v13)

import { useState, useMemo, useEffect } from 'react';
import { db } from '../../../db/db';
import type { User, UserWallet, WalletTransaction } from '../../../types';
import { WalletModal } from './components/WalletModal';
import { addFundsToWallet, refundReservation } from '../../../utils/createReservationWithPayment';

interface StudentWalletView {
  user: User;
  wallet: UserWallet | undefined;
  transactions: WalletTransaction[];
}

export function WalletsPage() {
  const [selectedStudent, setSelectedStudent] = useState<StudentWalletView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentWallets, setStudentWallets] = useState<StudentWalletView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger tous les étudiants avec leur wallet
  useEffect(() => {
    const loadStudentWallets = async () => {
      setIsLoading(true);
      try {
        const students = await db.users.where('role').equals('student').toArray();
        const wallets = await db.userWallets.toArray();
        const allTransactions = await db.transactions.toArray();

        const studentData: StudentWalletView[] = students.map((student) => {
          const wallet = wallets.find((w) => w.userId === student.id);
          const transactions = allTransactions
            .filter((t) => t.userId === student.id)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10); // 10 dernières transactions

          return {
            user: student,
            wallet,
            transactions: transactions as unknown as WalletTransaction[],
          };
        });

        setStudentWallets(studentData);
      } catch (error) {
        console.error('[WalletsPage] Error loading student wallets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentWallets();
  }, []);

  // Filtrer par recherche
  const filteredStudents = useMemo(() => {
    if (!studentWallets) return [];
    if (!searchTerm) return studentWallets;

    const term = searchTerm.toLowerCase();
    return studentWallets.filter(
      (s) =>
        s.user.firstName.toLowerCase().includes(term) ||
        s.user.lastName.toLowerCase().includes(term) ||
        s.user.email.toLowerCase().includes(term)
    );
  }, [studentWallets, searchTerm]);

  const handleOpenModal = (student: StudentWalletView) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    amount: number,
    description: string,
    type: 'deposit' | 'withdraw'
  ) => {
    if (!selectedStudent || !selectedStudent.wallet) return;

    if (type === 'deposit') {
      await addFundsToWallet(selectedStudent.user.id, amount, description);
    } else {
      await refundReservation(
        selectedStudent.user.id,
        -amount, // Négatif pour refund (débit)
        0,
        description
      );
    }
  };

  if (!studentWallets) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement des portefeuilles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">Portefeuilles élèves</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/pricing"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                aria-label="Gérer les tarifs"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tarifs
              </a>
              <a
                href="/admin/credits"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                aria-label="Gérer les crédits (système legacy)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Crédits (legacy)
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Info banner */}
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">Gestion des portefeuilles en euros</p>
              <p>
                Ajoutez ou retirez des fonds du portefeuille des élèves. Ces fonds sont utilisés pour réserver des cours
                sur la page{' '}
                <a href="/courses" className="underline hover:text-green-900" target="_blank" rel="noopener noreferrer">
                  /courses
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un élève par nom, prénom ou email..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total élèves</p>
            <p className="text-2xl font-bold text-gray-900">{studentWallets.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Solde total cumulé</p>
            <p className="text-2xl font-bold text-green-600">
              {studentWallets.reduce((sum, s) => sum + (s.wallet?.balance ?? 0), 0).toFixed(2)}€
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Élèves avec solde {'>'} 0€</p>
            <p className="text-2xl font-bold text-blue-600">
              {studentWallets.filter((s) => (s.wallet?.balance ?? 0) > 0).length}
            </p>
          </div>
        </div>

        {/* Students list */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 font-medium">
              {searchTerm ? 'Aucun élève ne correspond à votre recherche' : 'Aucun élève inscrit'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Élève
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Solde
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dernière activité
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {student.user.photo ? (
                          <img
                            src={student.user.photo}
                            alt={`${student.user.firstName} ${student.user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {student.user.firstName[0]}{student.user.lastName[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (student.wallet?.balance ?? 0) >= 70
                            ? 'bg-green-100 text-green-800'
                            : (student.wallet?.balance ?? 0) > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {(student.wallet?.balance ?? 0).toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.transactions.length > 0 ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.transactions[0].type === 'deposit' ? '+' : ''}
                            {student.transactions[0].amount.toFixed(2)}€
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(student.transactions[0].createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucune activité</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenModal(student)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedStudent && (
        <WalletModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleSubmit}
          studentName={`${selectedStudent.user.firstName} ${selectedStudent.user.lastName}`}
          currentBalance={selectedStudent.wallet?.balance ?? 0}
        />
      )}
    </div>
  );
}
