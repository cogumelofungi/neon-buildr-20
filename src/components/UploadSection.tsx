import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText, Gift, FolderUp, HelpCircle, Download, Check, Plus, X, FolderOpen, ChevronDown, ChevronRight, ChevronLeft, GripVertical, Layers, Unlink, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppBuilder, UploadModule } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from '@/integrations/supabase/client';
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { generateUniqueSlug } from "@/utils/generateUniqueSlug";
import { useFeatureAccess, getRequiredPlan } from "@/hooks/useFeatureAccess";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import PremiumOverlay from "@/components/ui/premium-overlay";
import { UploadErrorHandler } from "@/components/UploadErrorHandler";

// Plan configuration for upload slots
// maxTotal represents the maximum number of BONUS slots (not including main product)
const PLAN_CONFIG = {
  'Essencial': { initialVisible: 3, maxTotal: 9 },
  'Profissional': { initialVisible: 5, maxTotal: 14 },
  'Empresarial': { initialVisible: 5, maxTotal: 19 },
  'Consultório': { initialVisible: 5, maxTotal: 19 },
} as const;


interface UploadBlock {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fieldName: keyof ReturnType<typeof useAppBuilder>['appData'];
}

interface UploadSectionProps {
  appBuilder: ReturnType<typeof useAppBuilder>;
}

const UploadSection = ({ appBuilder }: UploadSectionProps) => {
  const { appData, handleFileUpload, isLoading, updateAppData, saveAsDraft } = appBuilder;
  const { t, language } = useLanguage();
  const [importData, setImportData] = useState({
    json: "",
    appId: "",
  });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [retryingStates, setRetryingStates] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { planName, isLoading: planLoading } = usePlanLimits();
  const { uploadModulesVisible } = useFeatureFlags();
  const { hasAppImport } = useFeatureAccess();
  
  // State for visible bonus slots (starts with initial visible based on plan)
  const [visibleBonusCount, setVisibleBonusCount] = useState<number>(0);
  
  // State for collapsed modules
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  
  // State for new module popover
  const [newModulePopoverOpen, setNewModulePopoverOpen] = useState(false);
  
  // Pagination for product lists in module mode
  const PRODUCTS_PER_PAGE = 8;
  const [newModulePage, setNewModulePage] = useState(0);
  const [addToModulePage, setAddToModulePage] = useState<Record<string, number>>({});

  // Get plan config
  const planConfig = useMemo(() => {
    return PLAN_CONFIG[planName as keyof typeof PLAN_CONFIG] || PLAN_CONFIG['Essencial'];
  }, [planName]);
  
  // Calculate the highest bonus slot that has an upload
  const maxUploadedBonus = useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => i + 1).reduce((max, n) => {
      const key = `bonus${n}` as keyof typeof appData;
      const val = (appData as any)[key];
      return val?.url ? Math.max(max, n) : max;
    }, 0);
  }, [appData]);
  
  // Initialize and update visible count when plan loads or uploads change
  useEffect(() => {
    if (!planLoading && planName) {
      const config = PLAN_CONFIG[planName as keyof typeof PLAN_CONFIG] || PLAN_CONFIG['Essencial'];
      const requiredSlots = Math.max(config.initialVisible, maxUploadedBonus);
      setVisibleBonusCount(prev => Math.min(config.maxTotal, Math.max(prev, requiredSlots)));
    }
  }, [planLoading, planName, maxUploadedBonus]);
  
  // Calculate how many more can be added
  const canAddMore = visibleBonusCount < planConfig.maxTotal;
  const remainingSlots = planConfig.maxTotal - visibleBonusCount;
  
  const handleAddUploadSlot = () => {
    if (canAddMore) {
      setVisibleBonusCount(prev => Math.min(prev + 1, planConfig.maxTotal));
    }
  };

  // All possible upload blocks
  const allUploadBlocks: UploadBlock[] = useMemo(() => [
    {
      id: "main",
      title: t("upload.main"),
      description: t("upload.pdf.description"),
      icon: <FileText className="w-6 h-6" />,
      fieldName: "mainProduct" as keyof ReturnType<typeof useAppBuilder>['appData'],
    },
    ...Array.from({ length: 19 }, (_, i) => ({
      id: `bonus${i + 1}`,
      title: `${t("upload.bonus")} ${i + 1}`,
      description: t("upload.bonus.description"),
      icon: <Gift className="w-6 h-6" />,
      fieldName: `bonus${i + 1}` as keyof ReturnType<typeof useAppBuilder>['appData'],
    })),
  ], [t]);

  // Get all slots assigned to any module
  const assignedSlots = useMemo(() => {
    if (!appData.uploadModulesEnabled || !appData.uploadModules) return new Set<string>();
    const set = new Set<string>();
    appData.uploadModules.forEach(m => m.items.forEach(item => set.add(item)));
    return set;
  }, [appData.uploadModulesEnabled, appData.uploadModules]);

  // Get unassigned slots (not in any module)
  const unassignedBlocks = useMemo(() => {
    if (!appData.uploadModulesEnabled) return [];
    return allUploadBlocks.filter((block, index) => {
      if (index === 0) return !assignedSlots.has('main'); // main product
      if (index > visibleBonusCount) return false; // not visible
      return !assignedSlots.has(block.id);
    });
  }, [appData.uploadModulesEnabled, allUploadBlocks, assignedSlots, visibleBonusCount]);

  // Get next available bonus slot for adding to a module
  const getNextAvailableSlot = (): string | null => {
    for (let i = 1; i <= planConfig.maxTotal; i++) {
      const slotId = `bonus${i}`;
      if (!assignedSlots.has(slotId) && i <= visibleBonusCount) {
        return slotId;
      }
    }
    // Try to expand visible count
    if (canAddMore) {
      const nextSlot = visibleBonusCount + 1;
      setVisibleBonusCount(prev => Math.min(prev + 1, planConfig.maxTotal));
      return `bonus${nextSlot}`;
    }
    return null;
  };

  const handleFileSelect = async (blockId: string, fieldName: keyof ReturnType<typeof useAppBuilder>['appData'], file: File) => {
    setLoadingStates(prev => ({ ...prev, [blockId]: true }));
    setUploadErrors(prev => ({ ...prev, [blockId]: '' }));
    
    try {
      await handleFileUpload(fieldName, file, blockId);
    } catch (error: any) {
      setUploadErrors(prev => ({ ...prev, [blockId]: error.message || t("upload.error.generic") }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [blockId]: false }));
    }
  };

  const handleRetryUpload = async (blockId: string, fieldName: keyof ReturnType<typeof useAppBuilder>['appData']) => {
    setRetryingStates(prev => ({ ...prev, [blockId]: true }));
    setUploadErrors(prev => ({ ...prev, [blockId]: '' }));
    
    setTimeout(() => {
      setRetryingStates(prev => ({ ...prev, [blockId]: false }));
      toast({
        title: t("upload.retry.ready.title"),
        description: t("upload.retry.ready.description"),
      });
    }, 1000);
  };

  // Module management functions
  const handleAddModuleWithProduct = (productId: string) => {
    const block = allUploadBlocks.find(b => b.id === productId);
    const newModule: UploadModule = {
      id: Date.now().toString(),
      title: language === 'en' ? `Module ${(appData.uploadModules?.length || 0) + 1}` 
        : language === 'es' ? `Módulo ${(appData.uploadModules?.length || 0) + 1}`
        : `Módulo ${(appData.uploadModules?.length || 0) + 1}`,
      items: [productId],
    };
    
    // If the product is not yet visible (bonus slot), expand visible count
    if (productId.startsWith('bonus')) {
      const bonusNum = parseInt(productId.replace('bonus', ''));
      if (bonusNum > visibleBonusCount) {
        setVisibleBonusCount(Math.min(bonusNum, planConfig.maxTotal));
      }
    }
    
    updateAppData('uploadModules', [...(appData.uploadModules || []), newModule]);
    setNewModulePopoverOpen(false);
  };

  // Get available products for new module (not yet assigned to any module)
  // In module mode, show ALL slots available in the plan (not just visibleBonusCount)
  const availableProductsForNewModule = useMemo(() => {
    const availableBlocks: UploadBlock[] = [];
    const maxSlots = planConfig.maxTotal;
    
    // Main product
    if (!assignedSlots.has('main')) {
      availableBlocks.push(allUploadBlocks[0]);
    }
    
    // All bonus slots up to plan limit
    for (let i = 1; i <= maxSlots; i++) {
      const slotId = `bonus${i}`;
      if (!assignedSlots.has(slotId) && allUploadBlocks[i]) {
        availableBlocks.push(allUploadBlocks[i]);
      }
    }
    
    return availableBlocks;
  }, [allUploadBlocks, assignedSlots, planConfig.maxTotal]);

  const handleRemoveModule = (moduleId: string) => {
    const newModules = (appData.uploadModules || []).filter(m => m.id !== moduleId);
    updateAppData('uploadModules', newModules);
  };

  const handleUpdateModuleTitle = (moduleId: string, title: string) => {
    const newModules = (appData.uploadModules || []).map(m => 
      m.id === moduleId ? { ...m, title } : m
    );
    updateAppData('uploadModules', newModules);
  };

  const handleAddSlotToModule = (moduleId: string) => {
    const nextSlot = getNextAvailableSlot();
    if (!nextSlot) {
      toast({
        title: language === 'en' ? 'Limit reached' : language === 'es' ? 'Límite alcanzado' : 'Limite atingido',
        description: language === 'en' ? 'No more upload slots available for your plan.' 
          : language === 'es' ? 'No hay más espacios disponibles para su plan.'
          : 'Não há mais espaços de upload disponíveis para seu plano.',
        variant: "destructive",
      });
      return;
    }
    const newModules = (appData.uploadModules || []).map(m => 
      m.id === moduleId ? { ...m, items: [...m.items, nextSlot] } : m
    );
    updateAppData('uploadModules', newModules);
  };

  const handleRemoveSlotFromModule = (moduleId: string, slotId: string) => {
    const newModules = (appData.uploadModules || []).map(m => 
      m.id === moduleId ? { ...m, items: m.items.filter(i => i !== slotId) } : m
    );
    updateAppData('uploadModules', newModules);
  };

  const handleMoveSlotToModule = (slotId: string, targetModuleId: string) => {
    const newModules = (appData.uploadModules || []).map(m => ({
      ...m,
      items: m.id === targetModuleId 
        ? [...m.items, slotId] 
        : m.items.filter(i => i !== slotId)
    }));
    updateAppData('uploadModules', newModules);
  };

  const toggleModuleCollapsed = (moduleId: string) => {
    setCollapsedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Render a single upload card (reused in both flat and module modes)
  const renderUploadCard = (block: UploadBlock, options?: { showRemoveFromModule?: boolean; onRemoveFromModule?: () => void }) => {
    const uploadedFile = appData[block.fieldName] as any;
    const hasFile = uploadedFile?.url;
    const isBlockLoading = loadingStates[block.id];
    const uploadError = uploadErrors[block.id];
    const isRetrying = retryingStates[block.id];
    
    return (
      <div key={block.id}>
        <Card 
          className={`bg-app-surface border-app-border p-4 transition-smooth ${
            hasFile ? 'border-primary/30 bg-primary/5' : 'hover:bg-app-surface-hover'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-smooth ${
              hasFile ? 'bg-primary/20 text-primary' : 'bg-app-surface-hover text-app-muted'
            }`}>
              {hasFile ? <Check className="w-6 h-6" /> : block.icon}
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{block.title}</h3>
              <p className="text-sm text-app-muted">{block.description}</p>
              {hasFile && (
                <p className="text-xs text-primary mt-1">
                  ✓ {uploadedFile.name || 'Arquivo carregado'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="upload-zone w-32 h-16 flex flex-col items-center justify-center relative cursor-pointer border-2 border-dashed border-app-border rounded-lg hover:border-primary/50 transition-smooth">
                {isBlockLoading || isRetrying ? (
                 <div className="flex items-center justify-center">
                   <span className="text-xs text-app-muted">{isRetrying ? "Tentando..." : t("upload.uploading")}</span>
                 </div>
                ) : hasFile ? (
                 <div className="flex flex-col items-center text-primary">
                   <Check className="w-5 h-5 mb-1" />
                   <span className="text-xs">{t("upload.uploaded")}</span>
                 </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-app-muted mb-1" />
                    <span className="text-xs text-app-muted">{t("upload.send")}</span>
                  </>
                )}
                
                <Input
                  type="file"
                  accept=".pdf,.mp3,application/pdf,audio/mpeg"
                  className="absolute inset-0 cursor-pointer w-full h-full"
                  style={{ opacity: 0, fontSize: 0 }}
                  disabled={isBlockLoading || isRetrying}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const fileName = file.name.toLowerCase();
                      const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
                      const isMp3 = file.type === 'audio/mpeg' || file.type === 'audio/mp3' || fileName.endsWith('.mp3');
                      
                      if (!isPdf && !isMp3) {
                        toast({
                          title: t("toast.file.invalid.title"),
                          description: t("toast.file.invalid.description"),
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (file.size > 100 * 1024 * 1024) {
                        toast({
                          title: t("toast.file.size.title"),
                          description: t("toast.file.size.description"),
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      handleFileSelect(block.id, block.fieldName, file);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              
              {/* Remove from module button */}
              {options?.showRemoveFromModule && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-app-muted hover:text-foreground hover:bg-app-surface-hover"
                  onClick={options.onRemoveFromModule}
                  title={language === 'en' ? 'Remove from module' : language === 'es' ? 'Quitar del módulo' : 'Remover do módulo'}
                >
                  <Unlink className="w-4 h-4" />
                </Button>
              )}
              
              {/* Delete file button - always visible when file exists */}
              {hasFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    updateAppData(block.fieldName, undefined);
                    try {
                      await saveAsDraft({ ...appData, [block.fieldName]: undefined } as any);
                    } catch { }
                    toast({
                      title: language === 'en' ? 'File removed' : language === 'es' ? 'Archivo eliminado' : 'Arquivo removido',
                      description: language === 'en' ? 'The file was successfully removed.' : language === 'es' ? 'El archivo se eliminó correctamente.' : 'O arquivo foi removido com sucesso.',
                    });
                  }}
                  title={language === 'en' ? 'Delete file' : language === 'es' ? 'Eliminar archivo' : 'Excluir arquivo'}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
        
        {uploadError && (
          <UploadErrorHandler
            error={uploadError}
            onRetry={() => handleRetryUpload(block.id, block.fieldName)}
            isRetrying={isRetrying}
          />
        )}
      </div>
    );
  };

  // Render module card
  const renderModuleCard = (module: UploadModule) => {
    const isCollapsed = collapsedModules[module.id] ?? false;
    const moduleBlocks = module.items
      .map(slotId => allUploadBlocks.find(b => b.id === slotId))
      .filter(Boolean) as UploadBlock[];
    
    const uploadedCount = moduleBlocks.filter(b => {
      const file = appData[b.fieldName] as any;
      return file?.url;
    }).length;

    return (
      <div key={module.id} className="rounded-xl border border-app-border overflow-hidden bg-app-surface">
        {/* Module Header */}
        <div 
          className="flex items-center gap-3 p-4 bg-app-surface-hover cursor-pointer hover:bg-muted/60 transition-smooth"
          onClick={() => toggleModuleCollapsed(module.id)}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <FolderOpen className="w-4 h-4 text-primary" />
          </div>
          
          <Input
            value={module.title}
            onChange={(e) => {
              e.stopPropagation();
              handleUpdateModuleTitle(module.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder={language === 'en' ? 'Module name' : language === 'es' ? 'Nombre del módulo' : 'Nome do módulo'}
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-foreground font-medium text-base p-0 h-auto"
          />
          
          <span className="text-xs text-app-muted whitespace-nowrap">
            {uploadedCount}/{moduleBlocks.length} {language === 'en' ? 'files' : language === 'es' ? 'archivos' : 'arquivos'}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveModule(module.id);
            }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
          
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-app-muted shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-app-muted shrink-0" />
          )}
        </div>
        
        {/* Module Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {moduleBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-app-muted">
                <Layers className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">
                  {language === 'en' ? 'No products in this module yet' 
                    : language === 'es' ? 'Aún no hay productos en este módulo'
                    : 'Nenhum produto neste módulo ainda'}
                </p>
              </div>
            ) : (
              moduleBlocks.map(block => renderUploadCard(block, {
                showRemoveFromModule: true,
                onRemoveFromModule: () => handleRemoveSlotFromModule(module.id, block.id),
              }))
            )}
            
            {/* Add product to module dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-app-border hover:border-primary/50 bg-transparent hover:bg-primary/5 text-app-muted hover:text-primary transition-smooth"
                  disabled={availableProductsForNewModule.length === 0}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {language === 'en' ? 'Add product' : language === 'es' ? 'Agregar producto' : 'Adicionar produto'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2 bg-popover border border-app-border shadow-lg z-50" align="center">
                <div className="space-y-1">
                  <p className="text-xs text-app-muted px-2 py-1.5 font-medium">
                    {language === 'en' ? 'Select a product to add' : language === 'es' ? 'Seleccione un producto para agregar' : 'Selecione um produto para adicionar'}
                  </p>
                  {(() => {
                    const currentPage = addToModulePage[module.id] || 0;
                    const totalPages = Math.ceil(availableProductsForNewModule.length / PRODUCTS_PER_PAGE);
                    const pageItems = availableProductsForNewModule.slice(currentPage * PRODUCTS_PER_PAGE, (currentPage + 1) * PRODUCTS_PER_PAGE);
                    return (
                      <>
                        {pageItems.map(block => {
                          const uploadedFile = appData[block.fieldName] as any;
                          const hasFile = uploadedFile?.url;
                          return (
                            <button
                              key={block.id}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                              onClick={() => {
                                if (block.id.startsWith('bonus')) {
                                  const bonusNum = parseInt(block.id.replace('bonus', ''));
                                  if (bonusNum > visibleBonusCount) {
                                    setVisibleBonusCount(Math.min(bonusNum, planConfig.maxTotal));
                                  }
                                }
                                const newModules = (appData.uploadModules || []).map(m => 
                                  m.id === module.id ? { ...m, items: [...m.items, block.id] } : m
                                );
                                updateAppData('uploadModules', newModules);
                              }}
                            >
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                                hasFile ? 'bg-primary/15 text-primary' : 'bg-muted text-app-muted'
                              }`}>
                                {hasFile ? <Check className="w-3.5 h-3.5" /> : block.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-foreground block truncate">{block.title}</span>
                                {hasFile && (
                                  <span className="text-xs text-primary truncate block">{uploadedFile.name || 'Arquivo carregado'}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-2 pt-2 border-t border-app-border mt-1">
                            <button
                              className="p-1 rounded hover:bg-accent disabled:opacity-30"
                              disabled={currentPage === 0}
                              onClick={() => setAddToModulePage(p => ({ ...p, [module.id]: (p[module.id] || 0) - 1 }))}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-app-muted">{currentPage + 1} / {totalPages}</span>
                            <button
                              className="p-1 rounded hover:bg-accent disabled:opacity-30"
                              disabled={currentPage >= totalPages - 1}
                              onClick={() => setAddToModulePage(p => ({ ...p, [module.id]: (p[module.id] || 0) + 1 }))}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {availableProductsForNewModule.length === 0 && (
                          <p className="text-xs text-app-muted text-center py-3">
                            {language === 'en' ? 'All products are already assigned' : language === 'es' ? 'Todos los productos ya están asignados' : 'Todos os produtos já estão atribuídos'}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    );
  };

  // === Import/Export handlers (unchanged) ===
  const handleImportById = async () => {
    if (!importData.appId.trim()) return;
    
    if (planName === 'Essencial') {
      toast({
        title: t("toast.feature.unavailable.title"),
        description: t("toast.feature.unavailable.description"),
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Usuário não logado');

      const { data: app, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', importData.appId.trim())
        .single();

      if (error) throw error;
      
      if (!app) {
        toast({
          title: t("upload.app.notfound.title"),
          description: t("upload.app.notfound.description"),
          variant: "destructive",
        });
        return;
      }

      if (app.user_id !== currentUser.id) {
        toast({
          title: t("upload.access.denied.title"),
          description: t("upload.access.denied.description"),
          variant: "destructive",
        });
        return;
      }

      const originalSlug = app.link_personalizado || app.slug || '';
      const uniqueSlug = originalSlug ? await generateUniqueSlug(originalSlug) : '';

      const importedData = {
        appName: app.nome || t("upload.default.appname"),
        appDescription: app.descricao || t("upload.default.description"),
        appColor: app.cor || '#4783F6',
        customLink: uniqueSlug,
        customDomain: '',
        allowPdfDownload: false,
        template: app.template || 'classic',
        themeConfig: app.theme_config,
        appIcon: app.icone_url ? { id: 'icon', name: 'icon', url: app.icone_url } : undefined,
        appCover: app.capa_url ? { id: 'cover', name: 'cover', url: app.capa_url } : undefined,
        mainProduct: app.produto_principal_url ? { id: 'main', name: 'main', url: app.produto_principal_url } : undefined,
        bonus1: app.bonus1_url ? { id: 'bonus1', name: 'bonus1', url: app.bonus1_url } : undefined,
        bonus2: app.bonus2_url ? { id: 'bonus2', name: 'bonus2', url: app.bonus2_url } : undefined,
        bonus3: app.bonus3_url ? { id: 'bonus3', name: 'bonus3', url: app.bonus3_url } : undefined,
        bonus4: app.bonus4_url ? { id: 'bonus4', name: 'bonus4', url: app.bonus4_url } : undefined,
        bonus5: (app as any).bonus5_url ? { id: 'bonus5', name: 'bonus5', url: (app as any).bonus5_url } : undefined,
        bonus6: (app as any).bonus6_url ? { id: 'bonus6', name: 'bonus6', url: (app as any).bonus6_url } : undefined,
        bonus7: (app as any).bonus7_url ? { id: 'bonus7', name: 'bonus7', url: (app as any).bonus7_url } : undefined,
        bonus8: (app as any).bonus8_url ? { id: 'bonus8', name: 'bonus8', url: (app as any).bonus8_url } : undefined,
        bonus9: (app as any).bonus9_url ? { id: 'bonus9', name: 'bonus9', url: (app as any).bonus9_url } : undefined,
        mainProductLabel: app.main_product_label || '',
        mainProductDescription: app.main_product_description || '',
        bonusesLabel: app.bonuses_label || '',
        bonus1Label: app.bonus1_label || 'Bônus 1',
        bonus2Label: app.bonus2_label || 'Bônus 2',
        bonus3Label: app.bonus3_label || 'Bônus 3',
        bonus4Label: app.bonus4_label || 'Bônus 4',
        bonus5Label: (app as any).bonus5_label || 'Bônus 5',
        bonus6Label: (app as any).bonus6_label || 'Bônus 6',
        bonus7Label: (app as any).bonus7_label || 'Bônus 7',
        bonus8Label: (app as any).bonus8_label || 'Bônus 8',
        bonus9Label: (app as any).bonus9_label || 'Bônus 9',
        videoCourseEnabled: (app as any).video_course_enabled ?? false,
        videoModules: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.modules || []) : [],
        videoCourseTitle: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.title || 'Curso em Vídeo') : 'Curso em Vídeo',
        videoCourseDescription: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.description || 'Descrição do Curso') : 'Descrição do Curso',
        videoCourseButtonText: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.buttonText || 'Assistir Aulas') : 'Assistir Aulas',
        videoCourseImage: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.image ? { id: 'vc-img', name: 'vc-img', url: JSON.parse((app as any).video_modules).image } : undefined) : undefined,
        videoCourseBackground: (app as any).video_modules ? (JSON.parse((app as any).video_modules)?.background ? { id: 'vc-bg', name: 'vc-bg', url: JSON.parse((app as any).video_modules).background } : undefined) : undefined,
      };

      Object.entries(importedData).forEach(([key, value]) => {
        if (value !== undefined) {
          appBuilder.updateAppData(key as keyof typeof importedData, value);
        }
      });

      toast({
        title: t("toast.import.success.title"),
        description: t("toast.import.success.description").replace("{appName}", app.nome),
      });

      setImportData({ json: "", appId: "" });
    } catch (error) {
      console.error('Erro ao importar app:', error);
      toast({
        title: t("toast.import.error.title"),
        description: t("toast.import.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const exportAppAsJson = () => {
    const exportData = {
      appName: appData.appName,
      appDescription: appData.appDescription,
      appColor: appData.appColor,
      customLink: appData.customLink,
      customDomain: appData.customDomain,
      allowPdfDownload: appData.allowPdfDownload,
      template: appData.template,
      themeConfig: appData.themeConfig,
      appIcon: appData.appIcon,
      appCover: appData.appCover,
      mainProduct: appData.mainProduct,
      mainProductThumbnail: appData.mainProductThumbnail,
      bonus1: appData.bonus1, bonus1Thumbnail: appData.bonus1Thumbnail,
      bonus2: appData.bonus2, bonus2Thumbnail: appData.bonus2Thumbnail,
      bonus3: appData.bonus3, bonus3Thumbnail: appData.bonus3Thumbnail,
      bonus4: appData.bonus4, bonus4Thumbnail: appData.bonus4Thumbnail,
      bonus5: appData.bonus5, bonus5Thumbnail: appData.bonus5Thumbnail,
      bonus6: appData.bonus6, bonus6Thumbnail: appData.bonus6Thumbnail,
      bonus7: appData.bonus7, bonus7Thumbnail: appData.bonus7Thumbnail,
      bonus8: appData.bonus8, bonus8Thumbnail: appData.bonus8Thumbnail,
      bonus9: appData.bonus9, bonus9Thumbnail: appData.bonus9Thumbnail,
      mainProductLabel: appData.mainProductLabel,
      mainProductDescription: appData.mainProductDescription,
      bonusesLabel: appData.bonusesLabel,
      bonus1Label: appData.bonus1Label, bonus2Label: appData.bonus2Label,
      bonus3Label: appData.bonus3Label, bonus4Label: appData.bonus4Label,
      bonus5Label: appData.bonus5Label, bonus6Label: appData.bonus6Label,
      bonus7Label: appData.bonus7Label, bonus8Label: appData.bonus8Label,
      bonus9Label: appData.bonus9Label,
      uploadModulesEnabled: appData.uploadModulesEnabled,
      uploadModules: appData.uploadModules,
      videoCourseEnabled: appData.videoCourseEnabled,
      videoModules: appData.videoModules,
      videoCourseTitle: appData.videoCourseTitle,
      videoCourseDescription: appData.videoCourseDescription,
      videoCourseButtonText: appData.videoCourseButtonText,
      videoCourseImage: appData.videoCourseImage,
      videoCourseBackground: appData.videoCourseBackground,
      exportedAt: new Date().toISOString(),
      version: "2.0"
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appData.appName.replace(/[^a-zA-Z0-9]/g, '_')}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: t("toast.backup.success.title"),
      description: t("toast.backup.success.description"),
    });
  };

  const handleJsonFileSelect = () => {
    if (planName === 'Essencial') {
      toast({
        title: t("toast.feature.unavailable.title"),
        description: t("toast.feature.unavailable.description"),
        variant: "destructive",
      });
      return;
    }
    jsonFileInputRef.current?.click();
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const jsonData = JSON.parse(jsonContent);
        
        if (!jsonData.appName && !jsonData.nome) {
          throw new Error("Formato JSON inválido");
        }

        const originalSlug = jsonData.customLink || jsonData.link_personalizado || '';
        const uniqueSlug = originalSlug ? await generateUniqueSlug(originalSlug) : '';

        const importedData = {
          appName: jsonData.appName || jsonData.nome || 'Meu App',
          appDescription: jsonData.appDescription || jsonData.descricao || 'Descrição do App',
          appColor: jsonData.appColor || jsonData.cor || '#4783F6',
          customLink: uniqueSlug,
          customDomain: '',
          allowPdfDownload: false,
          template: jsonData.template || 'classic',
          themeConfig: jsonData.themeConfig || jsonData.theme_config,
          appIcon: jsonData.appIcon || (jsonData.icone_url ? { id: 'icon', name: 'icon', url: jsonData.icone_url } : undefined),
          appCover: jsonData.appCover || (jsonData.capa_url ? { id: 'cover', name: 'cover', url: jsonData.capa_url } : undefined),
          mainProduct: jsonData.mainProduct || (jsonData.produto_principal_url ? { id: 'main', name: 'main', url: jsonData.produto_principal_url } : undefined),
          mainProductThumbnail: jsonData.mainProductThumbnail,
          bonus1: jsonData.bonus1 || (jsonData.bonus1_url ? { id: 'bonus1', name: 'bonus1', url: jsonData.bonus1_url } : undefined),
          bonus1Thumbnail: jsonData.bonus1Thumbnail,
          bonus2: jsonData.bonus2 || (jsonData.bonus2_url ? { id: 'bonus2', name: 'bonus2', url: jsonData.bonus2_url } : undefined),
          bonus2Thumbnail: jsonData.bonus2Thumbnail,
          bonus3: jsonData.bonus3 || (jsonData.bonus3_url ? { id: 'bonus3', name: 'bonus3', url: jsonData.bonus3_url } : undefined),
          bonus3Thumbnail: jsonData.bonus3Thumbnail,
          bonus4: jsonData.bonus4 || (jsonData.bonus4_url ? { id: 'bonus4', name: 'bonus4', url: jsonData.bonus4_url } : undefined),
          bonus4Thumbnail: jsonData.bonus4Thumbnail,
          bonus5: jsonData.bonus5 || (jsonData.bonus5_url ? { id: 'bonus5', name: 'bonus5', url: jsonData.bonus5_url } : undefined),
          bonus5Thumbnail: jsonData.bonus5Thumbnail,
          bonus6: jsonData.bonus6 || (jsonData.bonus6_url ? { id: 'bonus6', name: 'bonus6', url: jsonData.bonus6_url } : undefined),
          bonus6Thumbnail: jsonData.bonus6Thumbnail,
          bonus7: jsonData.bonus7 || (jsonData.bonus7_url ? { id: 'bonus7', name: 'bonus7', url: jsonData.bonus7_url } : undefined),
          bonus7Thumbnail: jsonData.bonus7Thumbnail,
          bonus8: jsonData.bonus8 || (jsonData.bonus8_url ? { id: 'bonus8', name: 'bonus8', url: jsonData.bonus8_url } : undefined),
          bonus8Thumbnail: jsonData.bonus8Thumbnail,
          bonus9: jsonData.bonus9 || (jsonData.bonus9_url ? { id: 'bonus9', name: 'bonus9', url: jsonData.bonus9_url } : undefined),
          bonus9Thumbnail: jsonData.bonus9Thumbnail,
          mainProductLabel: jsonData.mainProductLabel || jsonData.main_product_label || '',
          mainProductDescription: jsonData.mainProductDescription || jsonData.main_product_description || '',
          bonusesLabel: jsonData.bonusesLabel || jsonData.bonuses_label || '',
          bonus1Label: jsonData.bonus1Label || jsonData.bonus1_label || '',
          bonus2Label: jsonData.bonus2Label || jsonData.bonus2_label || '',
          bonus3Label: jsonData.bonus3Label || jsonData.bonus3_label || '',
          bonus4Label: jsonData.bonus4Label || jsonData.bonus4_label || '',
          bonus5Label: jsonData.bonus5Label || jsonData.bonus5_label || '',
          bonus6Label: jsonData.bonus6Label || jsonData.bonus6_label || '',
          bonus7Label: jsonData.bonus7Label || jsonData.bonus7_label || '',
          bonus8Label: jsonData.bonus8Label || jsonData.bonus8_label || '',
          bonus9Label: jsonData.bonus9Label || jsonData.bonus9_label || '',
          uploadModulesEnabled: jsonData.uploadModulesEnabled || false,
          uploadModules: jsonData.uploadModules || [],
          videoCourseEnabled: jsonData.videoCourseEnabled ?? false,
          videoModules: jsonData.videoModules || [],
          videoCourseTitle: jsonData.videoCourseTitle || 'Curso em Vídeo',
          videoCourseDescription: jsonData.videoCourseDescription || 'Descrição do Curso',
          videoCourseButtonText: jsonData.videoCourseButtonText || 'Assistir Aula',
          videoCourseImage: jsonData.videoCourseImage || null,
          videoCourseBackground: jsonData.videoCourseBackground || null,
        };

        Object.entries(importedData).forEach(([key, value]) => {
          if (value !== undefined) {
            appBuilder.updateAppData(key as keyof typeof importedData, value);
          }
        });

        toast({
          title: t("toast.json.import.success.title"),
          description: t("toast.json.import.success.description"),
        });

        setImportData({ json: "", appId: "" });
      } catch (error) {
        console.error('Erro ao processar JSON:', error);
        toast({
          title: t("toast.json.error.title"),
          description: t("toast.json.error.description"),
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  // === RENDER ===
  return (
    <div className="space-y-6">
      {/* Module Toggle - controlled by feature flag */}
      {uploadModulesVisible && (
        <div className="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <Label className="text-sm text-foreground cursor-pointer font-medium">
                {language === 'en' ? 'Organize in Modules' : language === 'es' ? 'Organizar en Módulos' : 'Organizar em Módulos'}
              </Label>
              <p className="text-xs text-app-muted">
                {language === 'en' ? 'Group your products into named modules' 
                  : language === 'es' ? 'Agrupe sus productos en módulos con nombre'
                  : 'Agrupe seus produtos em módulos nomeados'}
              </p>
            </div>
          </div>
          <Switch
            checked={appData.uploadModulesEnabled ?? false}
            onCheckedChange={(checked) => updateAppData('uploadModulesEnabled', checked)}
          />
        </div>
      )}

      {/* Upload Blocks */}
      <div className="space-y-4">
        {planLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="bg-app-surface border-app-border">
              <div className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-16 bg-muted rounded mb-4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </Card>
          ))
        ) : appData.uploadModulesEnabled ? (
          /* === MODULE MODE === */
          <div className="space-y-4">
            {/* Add Module Button with Product Dropdown */}
            <Popover open={newModulePopoverOpen} onOpenChange={setNewModulePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 border-primary/30 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary transition-smooth py-5"
                  disabled={availableProductsForNewModule.length === 0}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'New Module' : language === 'es' ? 'Nuevo Módulo' : 'Novo Módulo'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2 bg-popover border border-app-border shadow-lg z-50" align="center">
                <div className="space-y-1">
                  <p className="text-xs text-app-muted px-2 py-1.5 font-medium">
                    {language === 'en' ? 'Select a product for the new module' : language === 'es' ? 'Seleccione un producto para el nuevo módulo' : 'Selecione um produto para o novo módulo'}
                  </p>
                  {(() => {
                    const totalPages = Math.ceil(availableProductsForNewModule.length / PRODUCTS_PER_PAGE);
                    const pageItems = availableProductsForNewModule.slice(newModulePage * PRODUCTS_PER_PAGE, (newModulePage + 1) * PRODUCTS_PER_PAGE);
                    return (
                      <>
                        {pageItems.map(block => {
                          const uploadedFile = appData[block.fieldName] as any;
                          const hasFile = uploadedFile?.url;
                          return (
                            <button
                              key={block.id}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                              onClick={() => { handleAddModuleWithProduct(block.id); setNewModulePage(0); }}
                            >
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                                hasFile ? 'bg-primary/15 text-primary' : 'bg-muted text-app-muted'
                              }`}>
                                {hasFile ? <Check className="w-3.5 h-3.5" /> : block.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-foreground block truncate">{block.title}</span>
                                {hasFile && (
                                  <span className="text-xs text-primary truncate block">{uploadedFile.name || 'Arquivo carregado'}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-2 pt-2 border-t border-app-border mt-1">
                            <button
                              className="p-1 rounded hover:bg-accent disabled:opacity-30"
                              disabled={newModulePage === 0}
                              onClick={() => setNewModulePage(p => p - 1)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-app-muted">{newModulePage + 1} / {totalPages}</span>
                            <button
                              className="p-1 rounded hover:bg-accent disabled:opacity-30"
                              disabled={newModulePage >= totalPages - 1}
                              onClick={() => setNewModulePage(p => p + 1)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {availableProductsForNewModule.length === 0 && (
                          <p className="text-xs text-app-muted text-center py-3">
                            {language === 'en' ? 'All products are already in modules' : language === 'es' ? 'Todos los productos ya están en módulos' : 'Todos os produtos já estão em módulos'}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </PopoverContent>
            </Popover>

            {/* Module Cards */}
            {(appData.uploadModules || []).map(module => renderModuleCard(module))}
          </div>
        ) : (
          /* === FLAT MODE (original) === */
          <>
            {allUploadBlocks.filter((block, index) => {
              if (index === 0) return true;
              return index <= visibleBonusCount;
            }).map((block) => renderUploadCard(block))}
            
            {/* Add Upload Button */}
            {canAddMore && (
              <Button
                variant="outline"
                onClick={handleAddUploadSlot}
                className="w-full border-dashed border-2 border-app-border hover:border-primary/50 bg-transparent hover:bg-primary/5 text-app-muted hover:text-primary transition-smooth py-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                + Upload ({remainingSlots} {remainingSlots === 1 ? 'restante' : 'restantes'})
              </Button>
            )}
          </>
        )}
        
        {/* PDF Download Control */}
        <div className="flex items-center space-x-2 mt-4 p-3 bg-app-surface-hover rounded-lg border border-app-border">
          <Checkbox
            id="allow-pdf-download"
            checked={appData.allowPdfDownload}
            onCheckedChange={(checked) => updateAppData('allowPdfDownload', checked)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="allow-pdf-download" className="text-sm text-foreground cursor-pointer">
            {t("upload.allow.download")}
          </Label>
        </div>
      </div>

      {/* Import Existing App - Hidden on mobile/tablet */}
      <div className="hidden lg:block">
      <PremiumOverlay
        isBlocked={!hasAppImport}
        title={t("premium.import.title")}
        description={t("premium.import.description")}
        requiredPlan={getRequiredPlan('hasAppImport')}
        variant="overlay"
      >
        <Card className="bg-app-surface border-app-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-app-surface-hover rounded-lg flex items-center justify-center mx-auto sm:mx-0">
              <FolderUp className="w-5 h-5 sm:w-6 sm:h-6 text-app-muted" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <h3 className="font-medium text-foreground text-center sm:text-left">{t("import.title")}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="mx-auto sm:mx-0">
                      <HelpCircle className="w-4 h-4 text-app-muted" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-app-surface border-app-border">
                      <p className="max-w-xs">
                        {t("import.tooltip")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="json-import" className="text-sm text-app-muted">
                    {t("import.select.json")}
                  </Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full border-app-border justify-center sm:justify-start text-sm"
                              onClick={handleJsonFileSelect}
                              disabled={isImporting || planName === 'Essencial'}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {t("import.select.file")}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {planName === 'Essencial' && (
                          <TooltipContent className="bg-app-surface border-app-border">
                            <p>{t("import.premium.required")}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    {(planName === 'Profissional' || planName === 'Empresarial') && (
                      <Button 
                        variant="outline" 
                        onClick={exportAppAsJson}
                        className="w-full sm:w-auto border-app-border text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t("import.backup")}
                      </Button>
                    )}
                    <input
                      ref={jsonFileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleJsonFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </PremiumOverlay>
      </div>
    </div>
  );
};

export default UploadSection;
