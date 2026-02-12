import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, X, Save } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface VisualEditorPanelProps {
  config: any;
  onSave: (newConfig: any) => Promise<boolean>;
  isSaving: boolean;
}

export const VisualEditorPanel = ({ config, onSave, isSaving }: VisualEditorPanelProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [editedConfig, setEditedConfig] = useState(config);

  // Atualizar editedConfig quando config mudar
  useState(() => {
    setEditedConfig(config);
  });

  const handleSave = async () => {
    const success = await onSave(editedConfig);
    if (success) {
      setIsOpen(false);
    }
  };

  const updateConfig = (section: string, key: string, value: string) => {
    setEditedConfig({
      ...editedConfig,
      [section]: {
        ...editedConfig[section],
        [key]: value
      }
    });
  };

  return (
    <>
      {/* Botão flutuante fixo */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-8 right-8 z-50 shadow-2xl rounded-full w-16 h-16"
            variant="default"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("visual.editor.title")}</SheetTitle>
            <SheetDescription>
              {t("pwa.install.instructions")}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* SEÇÃO HERO */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">🎯 Seção Hero</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Tamanho do Título Principal</Label>
                  <Input
                    id="hero-title"
                    value={editedConfig?.hero?.titleSize || ''}
                    onChange={(e) => updateConfig('hero', 'titleSize', e.target.value)}
                    placeholder="text-4xl md:text-6xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: text-3xl, text-4xl md:text-6xl
                  </p>
                </div>

                <div>
                  <Label htmlFor="hero-subtitle">{t("visual.editor.subtitle.size")}</Label>
                  <Input
                    id="hero-subtitle"
                    value={editedConfig?.hero?.subtitleSize || ''}
                    onChange={(e) => updateConfig('hero', 'subtitleSize', e.target.value)}
                    placeholder="text-xl md:text-2xl"
                  />
                </div>

                <div>
                  <Label htmlFor="hero-spacing">Espaçamento da Seção</Label>
                  <Input
                    id="hero-spacing"
                    value={editedConfig?.hero?.spacing || ''}
                    onChange={(e) => updateConfig('hero', 'spacing', e.target.value)}
                    placeholder="py-16 md:py-20"
                  />
                </div>
              </div>
            </Card>

            {/* SEÇÃO FEATURES */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">⚡ Seção Features</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="features-title">Tamanho do Título</Label>
                  <Input
                    id="features-title"
                    value={editedConfig?.features?.titleSize || ''}
                    onChange={(e) => updateConfig('features', 'titleSize', e.target.value)}
                    placeholder="text-3xl md:text-5xl"
                  />
                </div>

                <div>
                  <Label htmlFor="features-desc">Tamanho da Descrição</Label>
                  <Input
                    id="features-desc"
                    value={editedConfig?.features?.descriptionSize || ''}
                    onChange={(e) => updateConfig('features', 'descriptionSize', e.target.value)}
                    placeholder="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="features-spacing">Espaçamento da Seção</Label>
                  <Input
                    id="features-spacing"
                    value={editedConfig?.features?.spacing || ''}
                    onChange={(e) => updateConfig('features', 'spacing', e.target.value)}
                    placeholder="py-16 md:py-20"
                  />
                </div>
              </div>
            </Card>

            {/* SEÇÃO PRICING */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">💰 Seção Pricing</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pricing-title">Tamanho do Título</Label>
                  <Input
                    id="pricing-title"
                    value={editedConfig?.pricing?.titleSize || ''}
                    onChange={(e) => updateConfig('pricing', 'titleSize', e.target.value)}
                    placeholder="text-3xl md:text-5xl"
                  />
                </div>

                <div>
                  <Label htmlFor="pricing-spacing">Espaçamento da Seção</Label>
                  <Input
                    id="pricing-spacing"
                    value={editedConfig?.pricing?.spacing || ''}
                    onChange={(e) => updateConfig('pricing', 'spacing', e.target.value)}
                    placeholder="py-16 md:py-20"
                  />
                </div>
              </div>
            </Card>

            {/* BOTÃO SALVAR */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>

            {/* DICAS */}
            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">💡 Dicas de Tailwind CSS:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code>text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl</code></li>
                <li>• <code>py-4, py-8, py-16</code> (espaçamento vertical)</li>
                <li>• <code>px-4, px-8</code> (espaçamento horizontal)</li>
                <li>• <code>md:text-4xl</code> (responsivo - a partir de tablet)</li>
              </ul>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
