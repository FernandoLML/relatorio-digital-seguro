// frontend/src/app/verifySignature/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSignatureForVerification } from '@/lib/api'; // Importa a função da API
import { Buffer } from 'buffer';

// Helper para converter a string Base64 de volta para um ArrayBuffer
function base64ToArrayBuffer(base64: string) {
  const binaryString = Buffer.from(base64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function VerifySignatureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');

  const [verificationData, setVerificationData] = useState<any | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      router.push('/dashboard');
      return;
    }
    const fetchVerificationData = async () => {
      try {
        // CORREÇÃO: Busca os dados reais da API
        const data = await getSignatureForVerification(reportId);
        setVerificationData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerificationData();
  }, [reportId, router]);

  const handleVerifySignature = async () => {
    if (!verificationData) {
      setError('Dados de verificação não encontrados.');
      return;
    }
    setVerifying(true);
    setError(null);

    try {
      // CORREÇÃO CRÍTICA: Recria EXATAMENTE o mesmo resumo de dados que foi assinado
      const dataToVerify = JSON.stringify({
        id: verificationData.report._id,
        amount: verificationData.report.amount,
        submittedBy: verificationData.report.submittedBy.email,
        validatedBy: verificationData.report.validatedBy.email,
      });
      const encodedData = new TextEncoder().encode(dataToVerify);

      // Importa a chave pública (que está em formato JWK string)
      const publicKey = await window.crypto.subtle.importKey(
        'jwk',
        JSON.parse(verificationData.publicKey),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        true,
        ["verify"]
      );

      // Converte a assinatura de Base64 para ArrayBuffer
      const signatureBuffer = base64ToArrayBuffer(verificationData.signature);

      // Verifica a assinatura
      const isValid = await window.crypto.subtle.verify(
        "RSASSA-PKCS1-v1_5",
        publicKey,
        signatureBuffer,
        encodedData
      );
      
      setIsVerified(isValid);

    } catch (err) {
      console.error('Erro ao verificar assinatura:', err);
      setError('Ocorreu um erro durante a verificação criptográfica.');
      setIsVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <p className="text-center mt-8">A carregar detalhes para verificação...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
  if (!verificationData) return <p className="text-center mt-8">Dados de assinatura não encontrados.</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Verificar Assinatura Digital</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Detalhes do Relatório:</h2>
        <p><strong>Descrição:</strong> {verificationData.report.description}</p>
        <p><strong>Valor:</strong> R$ {verificationData.report.amount.toFixed(2)}</p>
        <p><strong>Assinado Por:</strong> {verificationData.signedBy.name}</p>
        
        <hr className="my-6" />

        <button
          onClick={handleVerifySignature}
          disabled={verifying || isVerified !== null}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
        >
          {verifying ? 'A verificar...' : 'Verificar Assinatura'}
        </button>

        {isVerified === true && (
          <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800 text-center">
            <h3 className="font-bold text-lg">ASSINATURA VÁLIDA</h3>
            <p>A assinatura foi verificada com sucesso. O documento é autêntico.</p>
          </div>
        )}
        {isVerified === false && (
          <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-800 text-center">
            <h3 className="font-bold text-lg">ASSINATURA INVÁLIDA</h3>
            <p>A verificação falhou. A assinatura não corresponde aos dados do documento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifySignaturePage() {
  return (
    <Suspense fallback={<p className="text-center mt-8">A carregar...</p>}>
      <VerifySignatureContent />
    </Suspense>
  );
}