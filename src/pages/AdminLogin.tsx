import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import { z } from 'zod';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin, checkAdminStatus } = useAdminAuth();
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loginSchema = z.object({
    email: z.string().email(t('validation.email.invalid')),
    password: z.string().min(6, t('validation.password.min'))
  });

  useEffect(() => {
    // Redirect if already admin
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = loginSchema.parse(credentials);
      
      // Sign in with Supabase
      const { error } = await signIn(validatedData.email, validatedData.password);
      
      if (error) {
        toast({
          title: t('toast.login.error.title'),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Check admin status after successful login
      await checkAdminStatus();
      
      toast({
        title: t('toast.login.success.title'),
        description: t('toast.login.success.description'),
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('toast.validation.title'),
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('toast.login.error.title'),
          description: t('toast.login.error.description'),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-app-surface border-app-border">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.login.title')}</h1>
          <p className="text-app-muted text-center">{t('admin.login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('admin.login.email')}</Label>
            <Input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="bg-app-surface-hover border-app-border"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">{t('admin.login.password')}</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="bg-app-surface-hover border-app-border"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-neon" disabled={isLoading}>
            {isLoading ? t('admin.login.loading') : t('admin.login.submit')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;