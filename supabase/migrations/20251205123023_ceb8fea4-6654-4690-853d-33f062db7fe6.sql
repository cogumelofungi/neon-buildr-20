-- Allow anyone to read adobe_client_id setting
CREATE POLICY "Anyone can view adobe_client_id setting"
ON public.admin_settings
FOR SELECT
USING (key = 'adobe_client_id');