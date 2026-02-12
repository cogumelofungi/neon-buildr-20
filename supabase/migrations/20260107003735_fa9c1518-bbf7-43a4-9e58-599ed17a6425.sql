-- Função para remover acentos de texto
CREATE OR REPLACE FUNCTION public.unaccent_text(input_text text)
RETURNS text AS $$
BEGIN
  RETURN translate(
    input_text,
    'áàãâäåéèêëíìîïóòõôöúùûüçñýÿÁÀÃÂÄÅÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑÝ',
    'aaaaaaeeeeiiiiooooouuuucnyyAAAAAAEEEEIIIIOOOOOUUUUCNY'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Atualizar a função generate_unique_slug para usar unaccent_text
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug_candidate text;
  slug_exists boolean;
  counter integer := 0;
BEGIN
  -- Remover acentos primeiro
  slug_candidate := lower(unaccent_text(base_name));
  
  -- Substituir caracteres especiais por hífen
  slug_candidate := regexp_replace(slug_candidate, '[^a-z0-9]', '-', 'g');
  
  -- Remover hífens consecutivos
  slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
  
  -- Remover hífens no início e fim
  slug_candidate := trim(both '-' from slug_candidate);
  
  -- Garantir tamanho mínimo
  IF length(slug_candidate) < 3 THEN
    slug_candidate := slug_candidate || '-app';
  END IF;
  
  -- Verificar se já existe e adicionar contador se necessário
  LOOP
    IF counter = 0 THEN
      SELECT EXISTS(SELECT 1 FROM apps WHERE slug = slug_candidate) INTO slug_exists;
    ELSE
      SELECT EXISTS(SELECT 1 FROM apps WHERE slug = slug_candidate || '-' || counter) INTO slug_exists;
    END IF;
    
    IF NOT slug_exists THEN
      IF counter = 0 THEN
        RETURN slug_candidate;
      ELSE
        RETURN slug_candidate || '-' || counter;
      END IF;
    END IF;
    
    counter := counter + 1;
    
    -- Limite de segurança
    IF counter > 1000 THEN
      RETURN slug_candidate || '-' || extract(epoch from now())::integer;
    END IF;
  END LOOP;
END;
$$;