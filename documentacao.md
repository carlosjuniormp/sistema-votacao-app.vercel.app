# Sistema de Votação Eletrônica - Documentação

## Visão Geral
Este sistema foi desenvolvido para realizar votações eletrônicas, permitindo a verificação de eleitores em uma lista de cadastro, registro de votos e acompanhamento de resultados em tempo real.

## Funcionalidades Principais

### 1. Autenticação de Eleitores
- Verificação de eleitores na lista de cadastro
- Sistema de login seguro
- Controle para evitar votos duplicados

### 2. Interface de Votação
- Exibição das perguntas de votação
- Sistema de seleção e confirmação de votos
- Navegação entre perguntas

### 3. Dashboard de Resultados em Tempo Real
- Visualização dos resultados atualizados automaticamente
- Contagem de votos e percentuais para cada opção
- Gráficos de barras para representação visual

### 4. Relatórios
- Geração de relatórios detalhados
- Exportação em formato CSV
- Opção de impressão

### 5. Administração
- Painel administrativo para gerenciamento
- Importação de eleitores
- Inicialização do banco de dados
- Execução de testes do sistema

## Estrutura do Banco de Dados
O sistema utiliza um banco de dados com as seguintes tabelas:
- **eleitores**: Armazena a lista de pessoas autorizadas a votar
- **perguntas**: Armazena as perguntas da votação
- **opcoes_voto**: Armazena as opções de resposta para cada pergunta
- **votos**: Registra os votos realizados
- **sessoes**: Controla o acesso e evita votos duplicados

## Tecnologias Utilizadas
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: D1 (Cloudflare)
- **Implantação**: Cloudflare Workers

## Como Usar o Sistema

### Para Eleitores
1. Acesse a página inicial do sistema
2. Digite seu número de identificação
3. Responda às perguntas apresentadas
4. Confirme seu voto para cada pergunta
5. Visualize a confirmação de votação concluída

### Para Administradores
1. Acesse a página de administração (/admin)
2. Importe a lista de eleitores
3. Inicialize o banco de dados se necessário
4. Execute testes do sistema
5. Acesse a página de resultados (/resultados) para acompanhar a votação
6. Acesse a página de relatórios (/relatorio) para gerar relatórios detalhados

## Manutenção e Suporte
Para manutenção do sistema:
- Use a página de administração para gerenciar eleitores
- Execute os testes periodicamente para verificar o funcionamento
- Faça backup do banco de dados regularmente

## Considerações de Segurança
- O sistema implementa controle de sessão para evitar acessos não autorizados
- Verifica a identidade dos eleitores antes de permitir a votação
- Impede votos duplicados através de controle no banco de dados
- Utiliza tokens de sessão para autenticação
