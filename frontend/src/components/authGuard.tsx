// frontend/src/components/AuthGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Não faz nada enquanto o estado de autenticação está a ser carregado.
    if (loading) {
      return;
    }

    // Se o carregamento terminou e não há utilizador, redireciona para a página de login.
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]); // Re-executa este efeito se algum destes valores mudar.

  // Enquanto carrega ou se não houver utilizador, mostra uma mensagem de carregamento.
  // Isto impede que a página protegida "pisque" no ecrã antes do redirecionamento.
  if (loading || !user) {
    return <p className="text-center mt-8">A verificar autenticação...</p>;
  }

  // Se tudo estiver certo (carregamento completo e utilizador existe), mostra a página.
  return <>{children}</>;
}