import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { canAccessAdmin } from '@/utils/adminUtils';
import { usePermissions } from '@/hooks/usePermissions';
import { useLanguage } from '@/hooks/useLanguage'; // ✅ ADICIONADO

const AdminRoleManager = () => {
  const { user } = useAuthContext();
  const { isAdmin } = usePermissions();
  const [isChecking, setIsChecking] = useState(false);
  const { t } = useLanguage(); // ✅ ADICIONADO

  const checkAdminStatus = async () => {
    if (!user) return;

    setIsChecking(true);
    try {
      const hasAccess = await canAccessAdmin(user.id);
      toast({
        title: hasAccess
          ? t('admin.role.access_confirmed') // ✅ substituído
          : t('admin.role.access_denied'),
        description: hasAccess
          ? t('admin.role.has_privileges') // ✅ substituído
          : t('admin.role.no_privileges'),
        variant: hasAccess ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: t('error.generic'), // ✅ substituído
        description: t('admin.role.error_check'), // ✅ substituído
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Se não é admin
  if (!isAdmin) {
    return (
      <Card className="bg-app-surface border-app-border p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">
              {t('admin.role.restricted_access')} {/* ✅ substituído */}
            </h3>
          </div>
          <p className="text-sm text-app-muted">
            {t('admin.role.restricted_message')} {/* ✅ substituído */}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-app-surface border-app-border p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            {t('admin.role.admin_status')} {/* ✅ substituído */}
          </h3>
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            onClick={checkAdminStatus}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            {isChecking ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            {t('admin.role.check_status')} {/* ✅ substituído */}
          </Button>
        </div>

        <p className="text-xs text-app-muted">
          {t('admin.role.access_confirmed_message')} {/* ✅ substituído */}
        </p>
      </div>
    </Card>
  );
};

export default AdminRoleManager;
