import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Componente para proteger rotas que exigem autenticação
export function useAuthProtection() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        const token = sessionStorage.getItem('token');
        
        if (!token) {
          // Redirecionar para login se não houver token
          router.push('/');
          return;
        }

        // Verificar se o token é válido
        const response = await fetch(`/api/verificar-sessao?token=${token}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          // Token inválido, limpar sessão e redirecionar
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('eleitor');
          router.push('/');
          return;
        }

        // Usuário autenticado
        setAuthorized(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    verificarAutenticacao();
  }, [router]);

  return { loading, authorized };
}
