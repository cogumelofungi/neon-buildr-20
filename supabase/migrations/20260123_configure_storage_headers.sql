-- =====================================================
-- CONFIGURAÇÃO DE HEADERS PARA PDF VIEWER
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Data: 23/01/2026
-- =====================================================

-- 1. CONFIGURAR BUCKET 'products'
-- Configuração de bucket público com suporte a PDFs e imagens

UPDATE storage.buckets
SET public = true,
    file_size_limit = 104857600, -- 100MB
    allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
WHERE id = 'products';

-- NOTA: A configuração de CORS no Supabase deve ser feita através do Dashboard
-- ou utilizando a API Storage Client. A tabela storage.cors não existe por padrão.
-- Para configurar CORS:
-- 1. Acesse Dashboard > Storage > products (bucket) > Configuration
-- 2. Configure as políticas CORS através da interface
-- 
-- Alternativamente, use a API Supabase no código da aplicação com:
-- createClient(url, key, { 
--   auth: { persistSession: true },
--   global: { headers: { 'Access-Control-Allow-Origin': '*' } }
-- })

-- 2. VERIFICAR POLÍTICAS RLS DO BUCKET
-- Garante que usuários autenticados podem ler seus próprios arquivos

-- Política para SELECT (ler arquivos)
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'products' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated')
);

-- Política para INSERT (fazer upload)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para UPDATE (atualizar arquivos)
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'products' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para DELETE (deletar arquivos)
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. PERMITIR ACESSO PÚBLICO PARA LEITURA (OPCIONAL)
-- Descomente se quiser que os PDFs sejam publicamente acessíveis
-- DROP POLICY IF EXISTS "Public can read files" ON storage.objects;
-- CREATE POLICY "Public can read files"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'products');

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar configuração do bucket
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'products';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
