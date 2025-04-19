-- Migration number: 0001 	 2025-04-19
DROP TABLE IF EXISTS eleitores;
DROP TABLE IF EXISTS perguntas;
DROP TABLE IF EXISTS opcoes_voto;
DROP TABLE IF EXISTS votos;
DROP TABLE IF EXISTS sessoes;

-- Tabela de eleitores (pessoas autorizadas a votar)
CREATE TABLE IF NOT EXISTS eleitores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  identificacao TEXT UNIQUE NOT NULL, -- Pode ser CPF, ID, ou outro identificador único
  email TEXT,
  telefone TEXT,
  ja_votou BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perguntas da votação
CREATE TABLE IF NOT EXISTS perguntas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  texto TEXT NOT NULL,
  ordem INTEGER NOT NULL, -- Para ordenar as perguntas
  ativa BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de opções de voto para cada pergunta
CREATE TABLE IF NOT EXISTS opcoes_voto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pergunta_id INTEGER NOT NULL,
  texto TEXT NOT NULL,
  ordem INTEGER NOT NULL, -- Para ordenar as opções
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pergunta_id) REFERENCES perguntas(id)
);

-- Tabela de votos registrados
CREATE TABLE IF NOT EXISTS votos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eleitor_id INTEGER NOT NULL,
  pergunta_id INTEGER NOT NULL,
  opcao_id INTEGER NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eleitor_id) REFERENCES eleitores(id),
  FOREIGN KEY (pergunta_id) REFERENCES perguntas(id),
  FOREIGN KEY (opcao_id) REFERENCES opcoes_voto(id)
);

-- Tabela de sessões de votação
CREATE TABLE IF NOT EXISTS sessoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eleitor_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  ip TEXT,
  ativa BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (eleitor_id) REFERENCES eleitores(id)
);

-- Inserir as perguntas fornecidas pelo usuário
INSERT INTO perguntas (texto, ordem) VALUES 
  ('Você concorda que as área 8 do campo da cidade nova sejam emancipadas para a formação de um Novo campo da COMIEADEPA?', 1),
  ('Você concorda que as área 7 do campo da cidade nova sejam emancipadas para a formação de um Novo campo da COMIEADEPA?', 2);

-- Inserir as opções de voto para a primeira pergunta
INSERT INTO opcoes_voto (pergunta_id, texto, ordem) VALUES 
  (1, 'EU CONCORDO COM A EMANCIPAÇÃO DA ÁREA 8.', 1),
  (1, 'EU NÃO CONCORDO COM A EMANCIPAÇÃO DA ÁREA 8.', 2),
  (1, 'ABSTENÇÃO', 3);

-- Inserir as opções de voto para a segunda pergunta
INSERT INTO opcoes_voto (pergunta_id, texto, ordem) VALUES 
  (2, 'EU CONCORDO COM A EMANCIPAÇÃO DA ÁREA 7.', 1),
  (2, 'EU NÃO CONCORDO COM A EMANCIPAÇÃO DA ÁREA 7.', 2),
  (2, 'ABSTENÇÃO', 3);

-- Criar índices para melhorar a performance
CREATE INDEX idx_eleitores_identificacao ON eleitores(identificacao);
CREATE INDEX idx_votos_eleitor_id ON votos(eleitor_id);
CREATE INDEX idx_votos_pergunta_id ON votos(pergunta_id);
CREATE INDEX idx_sessoes_token ON sessoes(token);
CREATE INDEX idx_sessoes_eleitor_id ON sessoes(eleitor_id);
