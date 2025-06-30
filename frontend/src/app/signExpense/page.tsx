// frontend/src/app/signExpense/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getExpenseById, signExpense } from '@/lib/api'; // Importa as funções da API
import { Buffer } from 'buffer'; // Importa o Buffer para conversão segura

// Helper para converter ArrayBuffer para Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  return Buffer.from(buffer).toString('base64');
}

// Interface para os dados do relatório
interface ExpenseReportToSign {
  _id: string;
  description: string;
  amount: number;
  status: string;
  submittedBy: { name: string; email: string };
  validatedBy: { name: string; email: string };
  receiptUrl: string;
}

function SignExpenseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');

  const [report, setReport] = useState<ExpenseReportToSign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      router.push('/dashboard'); // Redireciona se não houver ID
      return;
    }

    const fetchReport = async () => {
      try {
        // Busca os dados reais do relatório usando a API
        const data = await getExpenseById(reportId);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar relatório.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, router]);

  const handleSign = async () => {
    if (!report) {
      setError('Nenhum relatório para assinar.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Dados que serão assinados para garantir a integridade
    const dataToSign = JSON.stringify({
      id: report._id,
      amount: report.amount,
      submittedBy: report.submittedBy.email,
      validatedBy: report.validatedBy.email,
    });

    try {
      // Gera o par de chaves
      const keyPair = await window.crypto.subtle.generateKey(
        { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: "SHA-256" },
        true,
        ["sign", "verify"]
      );

      // Assina os dados com a chave privada
      const signatureBuffer = await window.crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        keyPair.privateKey,
        new TextEncoder().encode(dataToSign)
      );
      const signatureB64 = arrayBufferToBase64(signatureBuffer);

      // Exporta a chave pública para ser guardada
      const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
      const publicKeyString = JSON.stringify(publicKeyJwk);

      // Envia a assinatura e a chave pública para o backend
      await signExpense(report._id, signatureB64, publicKeyString);

      setSuccess('Relatório assinado com sucesso!');
      setTimeout(() => router.push('/signedExpenses'), 2000);

    } catch (err) {
      console.error('Erro ao assinar o relatório:', err);
      setError(err instanceof Error ? err.message : 'Falha ao assinar o relatório.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-8">A carregar relatório para assinatura...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
  if (!report) return <p className="text-center mt-8">Relatório não encontrado.</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Assinar Relatório Digitalmente</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Detalhes do Relatório:</h2>
        <p className="mb-2"><span className="font-semibold">Descrição:</span> {report.description}</p>
        <p className="mb-2"><span className="font-semibold">Valor:</span> R$ {report.amount.toFixed(2)}</p>
        <p className="mb-4"><span className="font-semibold">Enviado Por:</span> {report.submittedBy.name}</p>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Clique no botão abaixo para gerar uma assinatura digital para este relatório, garantindo sua autenticidade e integridade.
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <button
          onClick={handleSign}
          disabled={submitting || !!success}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
        >
          {submitting ? 'A assinar...' : 'Gerar e Assinar Digitalmente'}
        </button>
      </div>
    </div>
  );
}

// O componente principal com Suspense para carregar os parâmetros da URL
export default function SignExpensePage() {
  return (
    <Suspense fallback={<p className="text-center mt-8">A carregar página...</p>}>
      <SignExpenseContent />
    </Suspense>
  );
}