// frontend/src/app/signedExpenses/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSignedExpenses } from '@/lib/api'; // Importa a função da API

interface SignedReport {
  _id: string;
  description: string;
  amount: number;
  signedBy: { name: string };
}

export default function SignedExpensesPage() {
  const [signedReports, setSignedReports] = useState<SignedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedReports = async () => {
      try {
        const data = await getSignedExpenses();
        setSignedReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
      } finally {
        setLoading(false);
      }
    };
    fetchSignedReports();
  }, []);

  if (loading) return <p className="text-center mt-8">A carregar relatórios assinados...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Relatórios de Despesas Assinados</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {signedReports.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Nenhum relatório assinado encontrado.</p>
        ) : (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descrição</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assinado Por</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody>
              {signedReports.map((report) => (
                <tr key={report._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{report.description}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">R$ {report.amount.toFixed(2)}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{report.signedBy.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    <Link href={`/verifySignature?id=${report._id}`} className="text-blue-600 hover:text-blue-900 font-bold">
                      Verificar Assinatura
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}