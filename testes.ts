// Script para testar todas as funcionalidades do sistema
// Este script verifica se todas as APIs e componentes estão funcionando corretamente

import { executeQuery, executeRun } from '@/lib/db';
import { buscarEleitor, criarSessao, verificarSessao } from '@/lib/db/eleitores';
import { buscarPerguntas, buscarOpcoesVoto, registrarVoto, contarVotosPorOpcao } from '@/lib/db/votacao';

async function testarBancoDeDados() {
  console.log('Testando conexão com banco de dados...');
  try {
    // Testar execução de query simples
    const resultado = await executeQuery('SELECT 1 as teste');
    if (resultado && resultado.length > 0 && resultado[0].teste === 1) {
      console.log('✅ Conexão com banco de dados OK');
      return true;
    } else {
      console.error('❌ Falha na conexão com banco de dados');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    return false;
  }
}

async function testarTabelasEDados() {
  console.log('Verificando tabelas e dados...');
  try {
    // Verificar tabela de eleitores
    const eleitores = await executeQuery('SELECT * FROM eleitores LIMIT 1');
    console.log(`- Tabela eleitores: ${eleitores.length > 0 ? '✅ OK' : '⚠️ Sem dados'}`);
    
    // Verificar tabela de perguntas
    const perguntas = await executeQuery('SELECT * FROM perguntas');
    console.log(`- Tabela perguntas: ${perguntas.length > 0 ? '✅ OK' : '❌ Sem dados'}`);
    
    // Verificar tabela de opções de voto
    const opcoes = await executeQuery('SELECT * FROM opcoes_voto');
    console.log(`- Tabela opcoes_voto: ${opcoes.length > 0 ? '✅ OK' : '❌ Sem dados'}`);
    
    // Verificar se as perguntas têm opções
    if (perguntas.length > 0) {
      for (const pergunta of perguntas) {
        const opcoesParaPergunta = await executeQuery(
          'SELECT * FROM opcoes_voto WHERE pergunta_id = ?', 
          [pergunta.id]
        );
        console.log(`  - Pergunta ${pergunta.id}: ${opcoesParaPergunta.length > 0 ? '✅ Tem opções' : '❌ Sem opções'}`);
      }
    }
    
    return perguntas.length > 0 && opcoes.length > 0;
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return false;
  }
}

async function testarModuloEleitores() {
  console.log('Testando módulo de eleitores...');
  try {
    // Inserir eleitor de teste se não existir
    const eleitorTeste = await buscarEleitor('TESTE123');
    
    if (!eleitorTeste) {
      await executeRun(
        'INSERT INTO eleitores (nome, identificacao, ja_votou) VALUES (?, ?, 0)',
        ['Eleitor Teste', 'TESTE123']
      );
      console.log('- Eleitor de teste criado: ✅ OK');
    } else {
      console.log('- Eleitor de teste já existe: ✅ OK');
    }
    
    // Testar busca de eleitor
    const eleitor = await buscarEleitor('TESTE123');
    if (eleitor) {
      console.log('- Busca de eleitor: ✅ OK');
    } else {
      console.error('❌ Falha ao buscar eleitor');
      return false;
    }
    
    // Testar criação de sessão
    const token = await criarSessao(eleitor.id, '127.0.0.1');
    if (token) {
      console.log('- Criação de sessão: ✅ OK');
    } else {
      console.error('❌ Falha ao criar sessão');
      return false;
    }
    
    // Testar verificação de sessão
    const sessao = await verificarSessao(token);
    if (sessao) {
      console.log('- Verificação de sessão: ✅ OK');
    } else {
      console.error('❌ Falha ao verificar sessão');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar módulo de eleitores:', error);
    return false;
  }
}

async function testarModuloVotacao() {
  console.log('Testando módulo de votação...');
  try {
    // Buscar perguntas
    const perguntas = await buscarPerguntas();
    if (perguntas && perguntas.length > 0) {
      console.log(`- Busca de perguntas: ✅ OK (${perguntas.length} encontradas)`);
    } else {
      console.error('❌ Falha ao buscar perguntas');
      return false;
    }
    
    // Buscar opções de voto para a primeira pergunta
    const opcoes = await buscarOpcoesVoto(perguntas[0].id);
    if (opcoes && opcoes.length > 0) {
      console.log(`- Busca de opções: ✅ OK (${opcoes.length} encontradas)`);
    } else {
      console.error('❌ Falha ao buscar opções de voto');
      return false;
    }
    
    // Testar registro de voto (com eleitor de teste)
    const eleitor = await buscarEleitor('TESTE123');
    if (eleitor) {
      // Limpar votos anteriores do eleitor de teste
      await executeRun('DELETE FROM votos WHERE eleitor_id = ?', [eleitor.id]);
      
      // Registrar voto
      const sucesso = await registrarVoto(eleitor.id, perguntas[0].id, opcoes[0].id);
      if (sucesso) {
        console.log('- Registro de voto: ✅ OK');
      } else {
        console.error('❌ Falha ao registrar voto');
        return false;
      }
      
      // Verificar contagem de votos
      const contagem = await contarVotosPorOpcao(perguntas[0].id);
      if (contagem && contagem.length > 0) {
        console.log('- Contagem de votos: ✅ OK');
      } else {
        console.error('❌ Falha ao contar votos');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar módulo de votação:', error);
    return false;
  }
}

async function executarTestes() {
  console.log('=== INICIANDO TESTES DO SISTEMA DE VOTAÇÃO ===');
  console.log('Data e hora:', new Date().toLocaleString());
  console.log('-------------------------------------------');
  
  // Testar banco de dados
  const dbOk = await testarBancoDeDados();
  if (!dbOk) {
    console.error('❌ FALHA: Problemas com o banco de dados. Abortando testes.');
    return false;
  }
  
  // Testar tabelas e dados
  const tabelasOk = await testarTabelasEDados();
  if (!tabelasOk) {
    console.error('❌ FALHA: Problemas com as tabelas ou dados. Verifique as migrações.');
    return false;
  }
  
  // Testar módulo de eleitores
  const eleitoresOk = await testarModuloEleitores();
  if (!eleitoresOk) {
    console.error('❌ FALHA: Problemas com o módulo de eleitores.');
    return false;
  }
  
  // Testar módulo de votação
  const votacaoOk = await testarModuloVotacao();
  if (!votacaoOk) {
    console.error('❌ FALHA: Problemas com o módulo de votação.');
    return false;
  }
  
  console.log('-------------------------------------------');
  console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
  console.log('O sistema está pronto para implantação.');
  
  return true;
}

// Exportar função para execução
export { executarTestes };
