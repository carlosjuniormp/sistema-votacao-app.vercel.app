import { executeQuery, executeFirst, executeRun } from '@/lib/db';
import { randomBytes } from 'crypto';

export interface Eleitor {
  id: number;
  nome: string;
  identificacao: string;
  email?: string;
  telefone?: string;
  ja_votou: boolean;
  created_at: string;
}

export interface Sessao {
  id: number;
  eleitor_id: number;
  token: string;
  ip?: string;
  ativa: boolean;
  created_at: string;
  expires_at: string;
}

// Buscar eleitor por identificação (CPF, ID, etc)
export async function buscarEleitor(identificacao: string): Promise<Eleitor | null> {
  return await executeFirst<Eleitor>(
    'SELECT * FROM eleitores WHERE identificacao = ?',
    [identificacao]
  );
}

// Verificar se o eleitor já votou
export async function verificarSeJaVotou(eleitorId: number): Promise<boolean> {
  const eleitor = await executeFirst<Eleitor>(
    'SELECT ja_votou FROM eleitores WHERE id = ?',
    [eleitorId]
  );
  return eleitor ? eleitor.ja_votou : false;
}

// Criar uma nova sessão para o eleitor
export async function criarSessao(eleitorId: number, ip?: string): Promise<string | null> {
  // Gerar token aleatório
  const token = randomBytes(32).toString('hex');
  
  // Definir data de expiração (2 horas a partir de agora)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);
  
  const result = await executeRun(
    'INSERT INTO sessoes (eleitor_id, token, ip, ativa, expires_at) VALUES (?, ?, ?, 1, ?)',
    [eleitorId, token, ip || null, expiresAt.toISOString()]
  );
  
  return result.success ? token : null;
}

// Verificar se uma sessão é válida
export async function verificarSessao(token: string): Promise<Sessao | null> {
  const agora = new Date().toISOString();
  
  return await executeFirst<Sessao>(
    'SELECT * FROM sessoes WHERE token = ? AND ativa = 1 AND expires_at > ?',
    [token, agora]
  );
}

// Marcar eleitor como já tendo votado
export async function marcarComoVotado(eleitorId: number): Promise<boolean> {
  const result = await executeRun(
    'UPDATE eleitores SET ja_votou = 1 WHERE id = ?',
    [eleitorId]
  );
  
  return result.success;
}

// Encerrar sessão após votação
export async function encerrarSessao(token: string): Promise<boolean> {
  const result = await executeRun(
    'UPDATE sessoes SET ativa = 0 WHERE token = ?',
    [token]
  );
  
  return result.success;
}

// Importar lista de eleitores (para uso administrativo)
export async function importarEleitores(eleitores: Omit<Eleitor, 'id' | 'ja_votou' | 'created_at'>[]): Promise<boolean> {
  try {
    for (const eleitor of eleitores) {
      await executeRun(
        'INSERT INTO eleitores (nome, identificacao, email, telefone, ja_votou) VALUES (?, ?, ?, ?, 0)',
        [eleitor.nome, eleitor.identificacao, eleitor.email || null, eleitor.telefone || null]
      );
    }
    return true;
  } catch (error) {
    console.error('Erro ao importar eleitores:', error);
    return false;
  }
}
