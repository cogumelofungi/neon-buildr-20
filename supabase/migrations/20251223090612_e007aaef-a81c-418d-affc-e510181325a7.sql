-- Create table for custom scripts management
CREATE TABLE public.custom_scripts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    script_code text NOT NULL,
    routes text[] NOT NULL DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.custom_scripts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage scripts
CREATE POLICY "Admins can manage custom scripts"
ON public.custom_scripts
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can view active scripts (needed for injection)
CREATE POLICY "Anyone can view active scripts"
ON public.custom_scripts
FOR SELECT
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_scripts_updated_at
BEFORE UPDATE ON public.custom_scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();