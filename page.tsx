import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identificacao, setIdentificacao] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identificacao }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao autenticar');
      }

      // Armazenar token na sessão
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('eleitor', JSON.stringify({
        id: data.eleitor.id,
        nome: data.eleitor.nome
      }));

      // Redirecionar para a página de votação
      router.push('/votacao');
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sistema de Votação Eletrônica</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="identificacao" className="block text-sm font-medium text-gray-700 mb-1">
              Identificação
            </label>
            <input
              type="text"
              id="identificacao"
              value={identificacao}
              onChange={(e) => setIdentificacao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite seu número de identificação"
              required
            />
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {carregando ? 'Verificando...' : 'Entrar para Votar'}
          </button>
        </form>
      </div>
    </div>
  );
}
