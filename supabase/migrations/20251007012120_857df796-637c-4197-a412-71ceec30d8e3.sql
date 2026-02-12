-- Permitir que todos leiam apenas a configuração de maintenance_mode
-- (necessário para o MaintenanceWrapper funcionar antes da autenticação)
CREATE POLICY "Anyone can view maintenance mode setting"
ON admin_settings
FOR SELECT
USING (key = 'maintenance_mode');

-- Garantir que apenas admins possam modificar
-- (a política ALL já existe, mas vamos ser mais específicos)
DROP POLICY IF EXISTS "Admin settings are manageable by admins" ON admin_settings;

CREATE POLICY "Admins can manage all settings"
ON admin_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));