

# Plano: Permitir Inserção de Domínio Sem user_id

## Problema Identificado
A tabela `custom_domains` tem as colunas `user_id` e `app_id` como **NOT NULL**, mas o fluxo planejado requer:
- Admin inserir domínio antes de saber qual usuário vai usar
- Usuário ativar o domínio posteriormente via token

## Solução Proposta

### Alteração no Banco de Dados
Executar uma migration para tornar `user_id` e `app_id` nullable:

```sql
-- Permitir que user_id e app_id sejam NULL inicialmente
ALTER TABLE public.custom_domains 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.custom_domains 
  ALTER COLUMN app_id DROP NOT NULL;

-- Atualizar políticas RLS para permitir leitura por token
-- (necessário para validação do token)
CREATE POLICY "Anyone can read by verification_code" 
  ON public.custom_domains 
  FOR SELECT 
  USING (true);
```

### Fluxo Atualizado

```text
┌─────────────────────────────────────────────────────────────────┐
│ ETAPA 1: Admin (você)                                           │
├─────────────────────────────────────────────────────────────────┤
│ 1. Adiciona domínio no Cloudflare                               │
│ 2. Configura Worker Routes                                      │
│ 3. Insere no banco SEM user_id:                                 │
│                                                                 │
│    INSERT INTO custom_domains (domain, verification_code)       │
│    VALUES ('mrnino.com.br', 'TOKEN-UNICO-123');                 │
│                                                                 │
│ 4. Envia o token para o usuário via WhatsApp                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ETAPA 2: Usuário                                                │
├─────────────────────────────────────────────────────────────────┤
│ 1. Vai em Configurações → Domínio Personalizado                 │
│ 2. Clica em "Configurar Meu Domínio"                           │
│ 3. Insere o token recebido                                      │
│ 4. Sistema vincula user_id ao domínio                          │
│ 5. Seleciona qual app vai aparecer em cada path                │
└─────────────────────────────────────────────────────────────────┘
```

### Após Aprovação da Migration

O comando que você vai usar será simplificado:

```sql
-- Admin insere apenas domínio e token
INSERT INTO custom_domains (domain, verification_code)
VALUES ('mrnino.com.br', 'TOKEN-UNICO-123');

-- Ou deixar o sistema gerar o token automaticamente:
INSERT INTO custom_domains (domain)
VALUES ('mrnino.com.br')
RETURNING verification_code;  -- Retorna o token gerado
```

## Seção Técnica

### Arquivos a Modificar
1. **Migration SQL** - Alterar constraints das colunas
2. **Políticas RLS** - Permitir leitura por token (para validação)

### Compatibilidade
- Registros existentes não serão afetados
- O sistema continua funcionando para domínios já vinculados

