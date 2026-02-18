-- Allow anyone to read pdf_viewer setting
CREATE POLICY "Anyone can view pdf_viewer setting"
ON public.admin_settings
FOR SELECT
USING (key = 'pdf_viewer');