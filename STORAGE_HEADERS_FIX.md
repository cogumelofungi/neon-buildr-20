# 🔧 Configuração de Headers para PDF Viewer

## ❌ Problemas Detectados

```
✅ Content-Type: application/pdf
✅ Content-Length: 82460309
❌ Accept-Ranges: N/A          ← FALTA
✅ Cache-Control: max-age=3600
❌ Access-Control-Allow-Origin ← FALTA
```

## 📋 O que falta configurar

1. **Accept-Ranges: bytes** - Permite requisições parciais (streaming)
2. **Access-Control-Allow-Origin** - Permite acesso cross-origin (CORS)

## 🚀 Solução Rápida

### Passo 1: Executar SQL no Supabase

1. Acesse o **Dashboard do Supabase**
2. Vá em **SQL Editor**
3. Copie e execute o script: `supabase/migrations/20260123_configure_storage_headers.sql`

### Passo 2: Verificar Resultados

Execute no SQL Editor:

```sql
-- Verificar configuração do bucket
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'products';

-- Verificar políticas RLS
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
```

Resultado esperado:
```
id: products
public: true
file_size_limit: 104857600
allowed_mime_types: {application/pdf,image/png,image/jpeg,image/jpg,image/gif,image/webp}
```

### Passo 3: Testar Novamente

Após executar o SQL, recarregue a página de teste:
- http://localhost:8080/test-pdf-viewer.html

Os headers devem mostrar:
```
✅ Accept-Ranges: bytes
✅ Access-Control-Allow-Origin: *
```

## 🔐 Segurança e CORS

⚠️ **IMPORTANTE**: Para configurar CORS no Supabase, você tem duas opções:

### Opção 1: Via Dashboard (Recomendado)
1. Acesse **Dashboard do Supabase** > **Storage** > Bucket **products**
2. Clique em **Configuration** ou **Settings**
3. Configure as políticas CORS:
   - **Allowed Origins:** Seu domínio (ex: `https://seu-dominio.com`) ou `*` para todos
   - **Allowed Methods:** GET, HEAD, OPTIONS
   - **Allowed Headers:** Range, Content-Type, Authorization
   - **Exposed Headers:** Accept-Ranges, Content-Range, Content-Length, Content-Type

### Opção 2: Via Código da Aplicação
Configure o cliente Supabase com headers personalizados:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key, {
  auth: { persistSession: true },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

## 📊 O que cada configuração faz

| Header | Função | Benefício |
|--------|--------|-----------|
| Accept-Ranges | Permite requisições parciais | Streaming eficiente, melhor performance |
| Access-Control-Allow-Origin | Permite CORS | Acesso de diferentes domínios |
| Content-Range | Identifica parte do arquivo | Permite navegação rápida entre páginas |
| Cache-Control | Define cache do navegador | Reduz requisições repetidas |

## ✅ Checklist de Validação

- [ ] Script SQL executado sem erros
- [ ] Bucket 'products' configurado como público
- [ ] Políticas RLS criadas corretamente
- [ ] CORS configurado via Dashboard ou código
- [ ] Teste mostra ✅ Accept-Ranges: bytes
- [ ] Teste mostra ✅ Access-Control-Allow-Origin
- [ ] PDF carrega mais rápido
- [ ] Navegação entre páginas é fluida

## 🐛 Troubleshooting

### Headers ainda não aparecem
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Aguarde 5 minutos para propagação do CDN
- Verifique se o bucket está configurado como `public = true`

### Erro de CORS persiste
- Configure CORS via Dashboard do Supabase (Storage > products > Configuration)
- Ou configure no código do cliente Supabase
- Teste com `allowed_origins: ['*']` primeiro, depois restrinja ao domínio específico

### Accept-Ranges não aparece
- Confirme que o bucket está público (`public = true`)
- Verifique se o arquivo PDF está acessível publicamente
- Teste com URL direta do Storage
- CORS deve estar configurado para expor os headers corretos

## 🔀 PDF Proxy (CORS bypass para PDF.js)

O viewer hospedado em `mozilla.github.io/pdf.js` bloqueia carregamento de PDFs de origens diferentes (CORS). A solução é um **proxy Edge Function** (`supabase/functions/pdf-proxy`) que:

1. Recebe a URL do PDF como query param (`?url=...`)
2. Valida contra whitelist (apenas domínios Supabase Storage)
3. Faz fetch upstream propagando o header `Range` (suporte a `206 Partial Content`)
4. Retorna o corpo com headers CORS (`Access-Control-Allow-Origin: *`)

### Variáveis de ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `VITE_PDF_PROXY_URL` | URL completa do proxy (opcional) | Edge Function do projeto |

### Checklist de aceitação (proxy)

- [ ] Desktop (Chrome/Firefox/Edge): PDF do Supabase Storage abre no `mozilla.github.io` viewer sem ficar em branco
- [ ] iOS: fallback por iframe permanece funcionando inalterado
- [ ] `curl -I "<pdf-proxy>?url=<supabase-pdf>"` retorna `Access-Control-Allow-Origin: *` e `Accept-Ranges`
- [ ] `npm run build` passa sem erros

## 📞 Suporte

Se os problemas persistirem, compartilhe:
1. Resultado da query de verificação do bucket
2. Screenshot do teste de headers
3. Logs do navegador (F12 > Console)
4. Configuração CORS do Dashboard (se aplicável)
