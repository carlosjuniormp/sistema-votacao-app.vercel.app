import { D1Database } from '@cloudflare/workers-types';

export interface CloudflareContext {
  DB: D1Database;
}

export function getCloudflareContext(): CloudflareContext {
  return {
    DB: (process.env as any).DB as D1Database,
  };
}

export async function executeQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> {
  const { DB } = getCloudflareContext();
  const result = await DB.prepare(query).bind(...params).all();
  return result.results as T[];
}

export async function executeRun(
  query: string, 
  params: any[] = []
): Promise<{ success: boolean; lastInsertId?: number }> {
  try {
    const { DB } = getCloudflareContext();
    const result = await DB.prepare(query).bind(...params).run();
    return { 
      success: true, 
      lastInsertId: result.meta?.last_row_id 
    };
  } catch (error) {
    console.error('Erro na execução da query:', error);
    return { success: false };
  }
}

export async function executeFirst<T = any>(
  query: string, 
  params: any[] = []
): Promise<T | null> {
  const { DB } = getCloudflareContext();
  const result = await DB.prepare(query).bind(...params).first();
  return result as T | null;
}
