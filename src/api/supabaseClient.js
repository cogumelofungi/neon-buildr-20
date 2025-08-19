import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Substitua pelos valores reais quando conectar ao Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Cliente Supabase configurado
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Funções utilitárias para facilitar o uso nos serviços
export const supabaseHelpers = {
  // Verificar se o usuário está autenticado
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Obter sessão atual
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listener para mudanças de autenticação
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Upload de arquivo
  async uploadFile(bucket, filePath, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    return { data, error };
  },

  // Download de arquivo público
  getPublicUrl(bucket, filePath) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  // Formatação de resposta padrão para manter consistência com os mocks
  formatResponse(data, error = null) {
    return { data, error };
  }
};

export default supabase;