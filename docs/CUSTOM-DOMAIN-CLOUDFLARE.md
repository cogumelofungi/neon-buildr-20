# Configuração de Domínio Personalizado com Cloudflare Worker

## Pré-requisitos

1. ✅ Domínio registrado e gerenciado no Cloudflare
2. ✅ Worker `migrabook-domain-router` já configurado pelo admin
3. ✅ App publicado no Migrabook

## Passo a Passo (Usuário)

### 1️⃣ Abrir Dialog de Domínio Personalizado

1. Acesse seu dashboard do Migrabook
2. Clique no botão **"Conectar Domínio"**
3. Siga o fluxo até chegar na tela de configuração DNS

### 2️⃣ Adicionar Worker Route no Cloudflare

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecione seu domínio (ex: `meudominio.com`)
3. No menu lateral, clique em **Workers Routes**
4. Clique no botão **Add Route**

### 3️⃣ Configurar Route para domínio raiz

Preencha:
- **Route:** `meudominio.com/*`
- **Worker:** `migrabook-domain-router`
- Clique em **Save**

### 4️⃣ Configurar Route para www

Repita o processo:
- **Route:** `www.meudominio.com/*`
- **Worker:** `migrabook-domain-router`
- Clique em **Save**

### 5️⃣ Verificar no Migrabook

1. Volte ao dialog do Migrabook
2. Clique em **"Verificar Registros"**
3. Aguarde a confirmação

### ⏱️ Tempo de Propagação

- **Cloudflare:** 1-5 minutos
- **SSL:** Automático (Cloudflare gerencia)

## Troubleshooting

### ❌ "Domínio não verificado"

**Solução:**
1. Verifique se o Worker Route foi criado corretamente
2. Aguarde 5 minutos e tente novamente
3. Teste acessando `https://seudominio.com` no navegador

### ❌ "Worker not found"

**Solução:**
1. Certifique-se de que o nome do Worker é exatamente: `migrabook-domain-router`
2. Verifique se o Worker está publicado (deployed)

### ❌ "SSL Error"

**Solução:**
1. Certifique-se de que o proxy do Cloudflare está ATIVO (nuvem laranja)
2. Aguarde até 24h para provisionamento de SSL
3. Verifique em: Cloudflare → SSL/TLS → Edge Certificates

## Suporte

Ainda com problemas? Entre em contato com suporte enviando:
- Screenshot da configuração do Worker Route
- Domínio que está tentando configurar
- Mensagem de erro exata
