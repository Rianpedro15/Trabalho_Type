-- =============================================================
-- EVENTOS FACUL — banco de dados MySQL 8 ou MariaDB (XAMPP)
-- Grupo Anchieta · Aula 2 (22/10)
-- Rode este script inteiro no MySQL Workbench (raio ⚡), na aba SQL
-- do phpMyAdmin (botão Executar) ou com:
--   mysql -u root -p < eventos.sql
-- Ele APAGA e recria o banco: use só em ambiente de aula.
-- =============================================================

SET NAMES utf8mb4;   -- garante os acentos quando o script roda pelo terminal

DROP DATABASE IF EXISTS eventos_facul;
CREATE DATABASE eventos_facul
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;   -- funciona no MySQL 8 e no MariaDB (XAMPP)

USE eventos_facul;

-- -------------------------------------------------------------
-- usuarios: quem usa o sistema
-- -------------------------------------------------------------
CREATE TABLE usuarios (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  senha_hash  CHAR(60)      NOT NULL,          -- hash bcrypt, NUNCA a senha
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_usuarios        PRIMARY KEY (id),
  CONSTRAINT uq_usuarios_email  UNIQUE (email)
);

-- -------------------------------------------------------------
-- eventos: o coração do sistema (espelho da interface Tarefa do tipos.ts)
-- os ENUM são os mesmos valores dos union types Prioridade e Status:
--   Prioridade = "curto_prazo" | "medio_prazo" | "longo_prazo"
--   Status     = "aberto" | "lotado" | "encerrado"
-- -------------------------------------------------------------
CREATE TABLE eventos (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED  NOT NULL,
  titulo        VARCHAR(120)  NOT NULL,
  descricao     TEXT          NULL,
  prioridade    ENUM('curto_prazo', 'medio_prazo', 'longo_prazo') NOT NULL DEFAULT 'medio_prazo',
  status        ENUM('aberto', 'lotado', 'encerrado')             NOT NULL DEFAULT 'aberto',
  data_evento   DATE          NULL,
  criada_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  encerrada_em  DATETIME      NULL,
  CONSTRAINT pk_eventos PRIMARY KEY (id),
  CONSTRAINT fk_eventos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT ck_eventos_titulo CHECK (CHAR_LENGTH(TRIM(titulo)) >= 3)
);

-- a consulta mais comum: "os eventos DESTE usuário com ESTE status"
CREATE INDEX ix_eventos_usuario_status ON eventos (usuario_id, status);

-- -------------------------------------------------------------
-- tags: cada usuário tem as suas etiquetas
-- -------------------------------------------------------------
CREATE TABLE tags (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED NOT NULL,
  nome        VARCHAR(40)  NOT NULL,
  CONSTRAINT pk_tags PRIMARY KEY (id),
  CONSTRAINT uq_tags_usuario_nome UNIQUE (usuario_id, nome),
  CONSTRAINT fk_tags_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- evento_tag: relacionamento N:N entre eventos e tags
-- (no TypeScript era só tags: string[])
-- -------------------------------------------------------------
CREATE TABLE evento_tag (
  evento_id  INT UNSIGNED NOT NULL,
  tag_id     INT UNSIGNED NOT NULL,
  CONSTRAINT pk_evento_tag PRIMARY KEY (evento_id, tag_id),
  CONSTRAINT fk_evento_tag_evento FOREIGN KEY (evento_id)
    REFERENCES eventos (id) ON DELETE CASCADE,
  CONSTRAINT fk_evento_tag_tag FOREIGN KEY (tag_id)
    REFERENCES tags (id) ON DELETE CASCADE
);

-- =============================================================
-- DADOS DE EXEMPLO — os mesmos seis eventos do dados.ts
-- Senha dos dois usuários: senha123
-- =============================================================
INSERT INTO usuarios (nome, email, senha_hash) VALUES
  ('Administrador', 'admin@eventosfacul.dev', '$2b$10$X46TZdkKX8P2NZNov1SoaOmtQ5JmGB.x/nK1IWAMCrYuZ1/TBFGcS'),
  ('Aluno Teste',   'aluno@eventosfacul.dev', '$2b$10$X46TZdkKX8P2NZNov1SoaOmtQ5JmGB.x/nK1IWAMCrYuZ1/TBFGcS');

INSERT INTO eventos (usuario_id, titulo, descricao, prioridade, status, data_evento, encerrada_em) VALUES
  (1, 'Semana de Recepção dos Calouros', NULL,     'longo_prazo', 'aberto',    NULL, NULL),
  (1, 'Feira de Profissões e Carreiras', NULL,     'curto_prazo', 'encerrado', NULL, NOW()),
  (1, 'Congresso de Iniciação Científica', 'PR #42', 'longo_prazo', 'lotado',    NULL, NULL),
  (1, 'Hackathon Universitário de Tecnologia', NULL,     'medio_prazo', 'aberto',    NULL, NULL),
  (1, 'Jogos Interatléticas da Faculdade', NULL,     'medio_prazo', 'aberto',    NULL, NULL),
  (1, 'Cerimônia de Formatura e Colação de Grau', NULL,     'curto_prazo', 'aberto',    NULL, NULL);

INSERT INTO tags (usuario_id, nome) VALUES
  (1, 'estudo'), (1, 'ts'), (1, 'casa'), (1, 'trabalho'), (1, 'saude');

INSERT INTO evento_tag (evento_id, tag_id) VALUES
  (1, 1), (1, 2),     -- Evento 1: estudo, ts
  (2, 3),             -- Evento 2: casa
  (3, 4),             -- Evento 3: trabalho
  (4, 1), (4, 2),     -- Evento 4: estudo, ts
  (5, 5),             -- Evento 5: saude
  (6, 3);             -- Evento 6: casa

-- =============================================================
-- CONSULTAS DE CONFERÊNCIA (rode uma de cada vez)
-- =============================================================

-- 1) Os eventos do usuário 1, com as tags juntas numa coluna
-- SELECT e.id, e.titulo, e.prioridade, e.status,
--        GROUP_CONCAT(g.nome ORDER BY g.nome SEPARATOR ', ') AS tags
--   FROM eventos e
--   LEFT JOIN evento_tag et ON et.evento_id = e.id
--   LEFT JOIN tags g        ON g.id = et.tag_id
--  WHERE e.usuario_id = 1
--  GROUP BY e.id
--  ORDER BY FIELD(e.prioridade, 'longo_prazo', 'medio_prazo', 'curto_prazo'), e.titulo;

-- 2) O painel: quantos eventos em cada status
-- SELECT status, COUNT(*) AS quantidade
--   FROM eventos
--  WHERE usuario_id = 1
--  GROUP BY status;

-- 3) Esperado: 6 eventos (4 abertos, 1 lotado, 1 encerrado)
