// frontend/src/app/validateExpense/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getExpenseById, validateExpense } from '@/lib/api'; // Importa as funções da API

type ExpenseReportDetails = {
  _id: string;
  description: string;
  amount: number;
  status: string;
  submittedBy: {
    name: string;
    email: string;
  };
  date: string;
  receiptUrl: string; // URL para ver o recibo
};

export default function ValidateExpensePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string; // Obtém o ID da URL

  const [report, setReport] = useState<ExpenseReportDetails | null>(null);
  const [managerComment, setManagerComment] = useState('');
  const [decision, setDecision] = useState<'aprovado' | 'rejeitado' | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchReportDetails = async () => {
        try {
          const data = await getExpenseById(id);
          setReport(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar os detalhes do relatório.');
        } finally {
          setLoading(false);
        }
      };
      fetchReportDetails();
    }
  }, [id]);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) {
      setError('Por favor, selecione uma decisão (Aprovar ou Rejeitar).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await validateExpense(id, decision, managerComment);
      setSuccess(`Relatório ${decision === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      setTimeout(() => {
        router.push('/pendingExpense'); // Volta para a lista de pendentes
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao processar a decisão.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-8">A carregar detalhes...</p>;
  if (error && !report) return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
  if (!report) return <p className="text-center mt-8">Relatório não encontrado.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Validar Relatório de Despesa</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><strong className="text-gray-600">Colaborador:</strong> {report.submittedBy.name}</div>
          <div><strong className="text-gray-600">Email:</strong> {report.submittedBy.email}</div>
          <div><strong className="text-gray-600">Valor:</strong> R$ {report.amount.toFixed(2)}</div>
          <div><strong className="text-gray-600">Data:</strong> {new Date(report.date).toLocaleDateString()}</div>
        </div>
        <div className="mb-4">
          <strong className="text-gray-600">Descrição:</strong>
          <p className="p-2 bg-gray-50 rounded mt-1">{report.description}</p>
        </div>
        <div className="mb-6">
          <a href={report.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">
            Ver Recibo em Ecrã Cheio
          </a>
        </div>
        
        <hr className="my-6"/>

        <form onSubmit={handleDecision}>
          <h2 className="text-xl font-semibold mb-4">Tomar Decisão</h2>
          <div className="mb-4">
            <label htmlFor="managerComment" className="block text-gray-700 font-bold mb-2">Comentário (Obrigatório se rejeitado)</label>
            <textarea
              id="managerComment"
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              onClick={() => setDecision('rejeitado')}
              disabled={submitting}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 disabled:bg-red-300"
            >
              {submitting && decision === 'rejeitado' ? 'A processar...' : 'Rejeitar'}
            </button>
            <button
              type="submit"
              onClick={() => setDecision('aprovado')}
              disabled={submitting}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {submitting && decision === 'aprovado' ? 'A processar...' : 'Aprovar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}