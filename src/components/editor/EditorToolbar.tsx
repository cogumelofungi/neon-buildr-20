import { Button } from '@/components/ui/button';
import { Loader2, Edit, Save, X } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useLanguage } from '@/hooks/useLanguage';

export const EditorToolbar = () => {
  const { isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  const { isEditMode, isSaving, toggleEditMode, saveAllChanges, resetChanges } = useEditor();
  const { t } = useLanguage();

  // Só mostrar para admins
  if (isAdminLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2 bg-background border rounded-lg shadow-lg p-2">
      {!isEditMode ? (
        <Button
          onClick={toggleEditMode}
          className="gap-2"
          variant="default"
        >
          <Edit className="h-4 w-4" />
          {t("editor.edit.page")}
        </Button>
      ) : (
        <>
          <Button
            onClick={() => {
              resetChanges();
              toggleEditMode();
            }}
            variant="outline"
            className="gap-2"
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
            {t("editor.cancel")}
          </Button>
          <Button
            onClick={saveAllChanges}
            className="gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("editor.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("editor.save.all")}
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};
