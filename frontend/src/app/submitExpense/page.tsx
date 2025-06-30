// frontend/src/app/submitExpense/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitExpense } from '@/lib/api'; // Importamos a nossa nova função da API

export default function SubmitExpensePage() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null); // Estado para guardar o ficheiro

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      setError('Por favor, anexe o ficheiro do recibo.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // FormData é a forma correta de enviar dados de formulário com ficheiros
    const formData = new FormData();
    formData.append('description', description);
    formData.append('amount', amount);
    formData.append('date', date);
    formData.append('receipt', receipt); // O nome 'receipt' deve corresponder ao esperado pelo backend

    try {
      await submitExpense(formData);
      setSuccess('Relatório de despesa submetido com sucesso!');
      
      // Limpa o formulário e redireciona após um curto período
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submeter Relatório de Despesa</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Descrição</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 font-bold mb-2">Valor (R$)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 font-bold mb-2">Data da Despesa</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="receipt" className="block text-gray-700 font-bold mb-2">Recibo (Imagem)</label>
          <input
            type="file"
            id="receipt"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded"
            accept="image/*"
            required
          />
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300">
          {loading ? 'A Enviar...' : 'Submeter Relatório'}
        </button>
      </form>
    </div>
  );
}