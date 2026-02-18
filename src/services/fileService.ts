import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  size: number;
  mime: string;
  provider: 'storage' | 'gdrive';
}

export interface UploadOptions {
  appId: string;
  slot: string;
  file: File;
}

class FileService {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly ALLOWED_MIME_TYPES = ['application/pdf', 'audio/mpeg', 'audio/mp3'];
  private readonly ALLOWED_EXTENSIONS = ['.pdf', '.mp3'];

  async uploadProductFile({ appId, slot, file }: UploadOptions): Promise<UploadResult> {
    // Validar arquivo
    this.validateFile(file);

    try {
      // Obter usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Verificar se deve usar Google Drive (flag opcional)
      const useGDrive = false; // Implementar lógica de config se necessário
      
      let result: UploadResult;
      if (useGDrive) {
        result = await this.uploadToGoogleDrive(appId, slot, file);
      } else {
        result = await this.uploadToStorage(user.id, appId, slot, file);
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      
      // Tratamento específico de erros CORS/Auth
      if (error.message?.includes('session') || error.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (error.status === 403) {
        throw new Error('Sem permissão para upload. Verifique seu plano.');
      }
      
      if (error.status === 500) {
        throw new Error(`Erro no servidor (${error.status}). Tentar novamente.`);
      }
      
      throw new Error(error.message || 'Falha no envio. Tentar novamente.');
    }
  }

  private validateFile(file: File): void {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Validar tipo MIME ou extensão
    const isValidMime = this.ALLOWED_MIME_TYPES.includes(file.type);
    const isValidExtension = this.ALLOWED_EXTENSIONS.includes(fileExtension);
    
    if (!isValidMime && !isValidExtension) {
      throw new Error('Envie apenas PDFs ou MP3s até 100 MB.');
    }

    // Validar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('Envie apenas PDFs ou MP3s até 100 MB.');
    }
  }

  private async uploadToStorage(userId: string, appId: string, slot: string, file: File): Promise<UploadResult> {
    // Determinar extensão baseado no tipo do arquivo
    const fileExtension = file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.name.toLowerCase().endsWith('.mp3') 
      ? '.mp3' 
      : '.pdf';
    const fileName = `${userId}/${appId}/${slot}${fileExtension}`;
    
    console.log('Iniciando upload para Storage:', fileName);

    // Fazer upload para o bucket 'products'
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        contentType: file.type || (fileExtension === '.mp3' ? 'audio/mpeg' : 'application/pdf'),
        upsert: true // Permite sobrescrever arquivo existente
      });

    if (uploadError) {
      console.error('Erro no upload Storage:', uploadError);
      
      // Tratar erro específico de tamanho
      if (uploadError.message?.includes('exceeded the maximum allowed size') || 
          (uploadError as any).statusCode === '413') {
        throw new Error('Envie apenas PDFs ou MP3s até 100 MB.');
      }
      
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error('Erro ao gerar URL do arquivo.');
    }

    console.log('Upload bem-sucedido:', data.publicUrl);

    return {
      url: data.publicUrl,
      size: file.size,
      mime: file.type,
      provider: 'storage'
    };
  }

  private async uploadToGoogleDrive(appId: string, slot: string, file: File): Promise<UploadResult> {
    console.log('Iniciando upload para Google Drive:', `${appId}_${slot}.pdf`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', `${appId}_${slot}.pdf`);

    const { data, error } = await supabase.functions.invoke('google-drive-upload', {
      body: formData
    });

    if (error) {
      console.error('Erro no upload Google Drive:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }

    if (!data?.webViewLink) {
      throw new Error('Erro ao processar upload no Google Drive.');
    }

    console.log('Upload Google Drive bem-sucedido:', data.webViewLink);

    return {
      url: data.webViewLink,
      size: file.size,
      mime: file.type,
      provider: 'gdrive'
    };
  }

  // Método auxiliar para verificar limites do plano
  async checkPlanLimits(userId: string): Promise<{ canUpload: boolean; planName: string }> {
    try {
      const { data: userStatus } = await supabase
        .from('user_status')
        .select(`
          plans (
            name,
            app_limit
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      const planName = userStatus?.plans?.name || 'Empresarial';
      
      // Por exemplo, limite de uploads baseado no plano
      // Essencial: 3 produtos, Profissional: 5 produtos, Empresarial: 10 produtos
      const canUpload = true; // Implementar lógica específica se necessário
      
      return { canUpload, planName };
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
      return { canUpload: true, planName: 'Empresarial' };
    }
  }
}

export const fileService = new FileService();
