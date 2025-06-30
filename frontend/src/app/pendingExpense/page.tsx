// frontend/src/app/pendingExpense/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPendingExpenses } from '@/lib/api'; // Importa a função da API

// Define um tipo para o relatório de despesa para melhor organização
type ExpenseReport = {
  _id: string;
  description: string;
  amount: number;
  status: string;
  submittedBy: {
    name: string;
  };
  date: string;
};

export default function PendingExpensesPage() {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getPendingExpenses();
        setReports(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []); // O array vazio [] garante que o useEffect só é executado uma vez

  if (loading) {
    return <p className="text-center mt-8">A carregar relatórios pendentes...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatórios Pendentes de Validação</h1>
      
      {reports.length === 0 ? (
        <p>Não há relatórios pendentes para validação no momento.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {report.submittedBy.name}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {report.description}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    R$ {report.amount.toFixed(2)}
                  </td>
                   <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {new Date(report.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/validateExpense/${report._id}`} className="text-indigo-600 hover:text-indigo-900">
                      Validar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}