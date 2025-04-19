import { executeQuery, executeFirst, executeRun } from '@/lib/db';

export interface Pergunta {
  id: number;
  texto: string;
  ordem: number;
  ativa: boolean;
  created_at: string;
}

export interface OpcaoVoto {
  id: number;
  pergunta_id: number;
  texto: string;
  ordem: number;
  created_at: string;
}

export interface Voto {
  id: number;
  eleitor_id: number;
  pergunta_id: number;
  opcao_id: number;
  timestamp: string;
}

// Buscar todas as perguntas ativas
export async function buscarPerguntas(): Promise<Pergunta[]> {
  return await executeQuery<Pergunta>(
    'SELECT * FROM perguntas WHERE ativa = 1 ORDER BY ordem ASC'
  );
}

// Buscar uma pergunta específica
export async function buscarPergunta(id: number): Promise<Pergunta | null> {
  return await executeFirst<Pergunta>(
    'SELECT * FROM perguntas WHERE id = ? AND ativa = 1',
    [id]
  );
}

// Buscar opções de voto para uma pergunta
export async function buscarOpcoesVoto(perguntaId: number): Promise<OpcaoVoto[]> {
  return await executeQuery<OpcaoVoto>(
    'SELECT * FROM opcoes_voto WHERE pergunta_id = ? ORDER BY ordem ASC',
    [perguntaId]
  );
}

// Registrar um voto
export async function registrarVoto(
  eleitorId: number,
  perguntaId: number,
  opcaoId: number
): Promise<boolean> {
  const result = await executeRun(
    'INSERT INTO votos (eleitor_id, pergunta_id, opcao_id) VALUES (?, ?, ?)',
    [eleitorId, perguntaId, opcaoId]
  );
  
  return result.success;
}

// Verificar se o eleitor já votou em uma pergunta específica
export async function verificarVotoEmPergunta(
  eleitorId: number,
  perguntaId: number
): Promise<boolean> {
  const voto = await executeFirst(
    'SELECT id FROM votos WHERE eleitor_id = ? AND pergunta_id = ?',
    [eleitorId, perguntaId]
  );
  
  return voto !== null;
}

// Contar votos por opção para uma pergunta
export async function contarVotosPorOpcao(perguntaId: number): Promise<{opcao_id: number, total: number}[]> {
  return await executeQuery<{opcao_id: number, total: number}>(
    'SELECT opcao_id, COUNT(*) as total FROM votos WHERE pergunta_id = ? GROUP BY opcao_id',
    [perguntaId]
  );
}

// Contar total de votos para uma pergunta
export async function contarTotalVotos(perguntaId: number): Promise<number> {
  const result = await executeFirst<{total: number}>(
    'SELECT COUNT(*) as total FROM votos WHERE pergunta_id = ?',
    [perguntaId]
  );
  
  return result ? result.total : 0;
}
