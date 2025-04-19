import { NextRequest, NextResponse } from 'next/server';
import { buscarEleitor, criarSessao, verificarSeJaVotou } from '@/lib/db/eleitores';

export async function POST(request: NextRequest) {
  try {
    const { identificacao } = await request.json();
    
    if (!identificacao) {
      return NextResponse.json(
        { error: 'Identificação é obrigatória' },
        { status: 400 }
      );
    }
    
    // Buscar eleitor pelo identificador
    const eleitor = await buscarEleitor(identificacao);
    
    if (!eleitor) {
      return NextResponse.json(
        { error: 'Eleitor não encontrado na lista de votação' },
        { status: 404 }
      );
    }
    
    // Verificar se o eleitor já votou
    const jaVotou = await verificarSeJaVotou(eleitor.id);
    
    if (jaVotou) {
      return NextResponse.json(
        { error: 'Este eleitor já realizou seu voto' },
        { status: 403 }
      );
    }
    
    // Criar sessão para o eleitor
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const token = await criarSessao(eleitor.id, ip?.toString());
    
    if (!token) {
      return NextResponse.json(
        { error: 'Erro ao criar sessão de votação' },
        { status: 500 }
      );
    }
    
    // Retornar token e informações do eleitor (sem dados sensíveis)
    return NextResponse.json({
      success: true,
      token,
      eleitor: {
        id: eleitor.id,
        nome: eleitor.nome
      }
    });
    
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
