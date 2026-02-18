import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import DOMPurify from 'dompurify';

// Sanitize HTML content to prevent XSS attacks
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

interface ResponsiveStyles {
  desktop?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  tablet?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  mobile?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
}

interface ElementStyles {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  lineHeight?: string;
  letterSpacing?: string;
  width?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  content?: string;
  responsive?: ResponsiveStyles;
}

interface EditableElementProps {
  elementId: string;
  children: React.ReactNode;
  currentStyles: ElementStyles;
  onStyleChange: (elementId: string, styles: ElementStyles) => void;
  isEditMode: boolean;
  className?: string;
}

export const EditableElement = ({
  elementId,
  children,
  currentStyles,
  onStyleChange,
  isEditMode,
  className = ''
}: EditableElementProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [localStyles, setLocalStyles] = useState<ElementStyles>(currentStyles);
  const [editedContent, setEditedContent] = useState(currentStyles.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extrair texto das children se não houver content salvo
  useEffect(() => {
    if (!currentStyles.content && children) {
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(extractText).join('');
        if (node && typeof node === 'object' && 'props' in node) {
          return extractText(node.props.children);
        }
        return '';
      };
      const text = extractText(children);
      setEditedContent(text);
    } else if (currentStyles.content) {
      setEditedContent(currentStyles.content);
    }
  }, [children, currentStyles.content]);

  const handleStyleChange = (key: keyof ElementStyles, value: string | ResponsiveStyles) => {
    const newStyles = { ...localStyles, [key]: value };
    setLocalStyles(newStyles);
    onStyleChange(elementId, newStyles);
  };

  const handleTextEdit = () => {
    setIsEditingText(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 100);
  };

  const handleSaveText = () => {
    const newStyles = { ...localStyles, content: editedContent };
    setLocalStyles(newStyles);
    onStyleChange(elementId, newStyles);
    setIsEditingText(false);
  };

  const handleCancelText = () => {
    setEditedContent(currentStyles.content || '');
    setIsEditingText(false);
  };

  // Construir classes Tailwind
  const fontSizeClass = currentStyles.fontSize || '';
  const fontFamilyClass = currentStyles.fontFamily || '';
  const fontWeightClass = currentStyles.fontWeight || '';
  const widthClass = currentStyles.width || '';
  const maxWidthClass = currentStyles.maxWidth || '';
  const heightClass = currentStyles.height || '';
  const minHeightClass = currentStyles.minHeight || '';
  
  // Classes responsivas
  const responsiveClasses = currentStyles.responsive ? [
    currentStyles.responsive.mobile?.fontSize || '',
    currentStyles.responsive.mobile?.fontWeight || '',
    currentStyles.responsive.tablet?.fontSize ? `md:${currentStyles.responsive.tablet.fontSize}` : '',
    currentStyles.responsive.tablet?.fontWeight ? `md:${currentStyles.responsive.tablet.fontWeight}` : '',
    currentStyles.responsive.desktop?.fontSize ? `lg:${currentStyles.responsive.desktop.fontSize}` : '',
    currentStyles.responsive.desktop?.fontWeight ? `lg:${currentStyles.responsive.desktop.fontWeight}` : '',
  ].filter(Boolean).join(' ') : '';
  
  const tailwindClasses = [
    className, 
    fontSizeClass, 
    fontFamilyClass, 
    fontWeightClass,
    widthClass,        // ✨ NOVO
    maxWidthClass,     // ✨ NOVO
    heightClass,       // ✨ NOVO
    minHeightClass,    // ✨ NOVO
    responsiveClasses
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
    
  const inlineStyles: React.CSSProperties = {
    color: currentStyles.color,
    backgroundColor: currentStyles.backgroundColor,
    padding: currentStyles.padding,
    margin: currentStyles.margin,
    lineHeight: currentStyles.lineHeight,
    letterSpacing: currentStyles.letterSpacing,
  };

  // Conteúdo a ser renderizado (editado ou original)
  const displayContent = currentStyles.content || children;

  if (!isEditMode) {
    return (
      <div className={tailwindClasses} style={inlineStyles}>
        {currentStyles.content ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentStyles.content) }} />
        ) : (
          children
        )}
      </div>
    );
  }

  // Modo de edição de texto
  if (isEditingText) {
    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[100px] w-full"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCancelText();
            }
          }}
        />
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleSaveText}>
            {t("editor.save.text")}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancelText}>
            {t("editor.cancel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={`${tailwindClasses} cursor-pointer transition-all hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary/50 relative group`}
          style={inlineStyles}
        >
          {currentStyles.content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentStyles.content) }} />
          ) : (
            children
          )}
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                handleTextEdit();
              }}
              className="hover:bg-primary/80 px-1 rounded flex items-center gap-1"
              title={t("editor.edit.text")}
            >
              <Pencil className="w-3 h-3" />
              <span className="text-[10px]">{t("editor.edit.text")}</span>
            </button>
            <span className="text-[10px] border-l pl-1">| {t("editor.style")}</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[600px] overflow-y-auto" side="right" align="start">
        <div className="space-y-4">
          <div className="font-semibold text-sm border-b pb-2 sticky top-0 bg-popover z-10">
            Editar: {elementId}
          </div>

          {/* Desktop Styles */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <h4 className="font-semibold text-sm">🖥️ Desktop (lg+)</h4>
            
            <div className="space-y-2">
              <Label>Tamanho da Fonte</Label>
              <Select
                value={localStyles.responsive?.desktop?.fontSize || localStyles.fontSize || ''}
                onValueChange={(value) => handleStyleChange('responsive', {
                  ...localStyles.responsive,
                  desktop: { ...localStyles.responsive?.desktop, fontSize: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-xs">XS</SelectItem>
                  <SelectItem value="text-sm">SM</SelectItem>
                  <SelectItem value="text-base">Base</SelectItem>
                  <SelectItem value="text-lg">LG</SelectItem>
                  <SelectItem value="text-xl">XL</SelectItem>
                  <SelectItem value="text-2xl">2XL</SelectItem>
                  <SelectItem value="text-3xl">3XL</SelectItem>
                  <SelectItem value="text-4xl">4XL</SelectItem>
                  <SelectItem value="text-5xl">5XL</SelectItem>
                  <SelectItem value="text-6xl">6XL</SelectItem>
                  <SelectItem value="text-7xl">7XL</SelectItem>
                  <SelectItem value="text-8xl">8XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("editor.font.weight")}</Label>
              <Select
                value={localStyles.responsive?.desktop?.fontWeight || localStyles.fontWeight || ''}
                onValueChange={(value) => handleStyleChange('responsive', {
                  ...localStyles.responsive,
                  desktop: { ...localStyles.responsive?.desktop, fontWeight: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Peso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="font-thin">Thin</SelectItem>
                  <SelectItem value="font-light">Light</SelectItem>
                  <SelectItem value="font-normal">Normal</SelectItem>
                  <SelectItem value="font-medium">Medium</SelectItem>
                  <SelectItem value="font-semibold">Semibold</SelectItem>
                  <SelectItem value="font-bold">Bold</SelectItem>
                  <SelectItem value="font-extrabold">Extrabold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tablet Styles */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <h4 className="font-semibold text-sm">📱 Tablet (md-lg)</h4>
            
            <div className="space-y-2">
              <Label>Tamanho da Fonte</Label>
              <Select
                value={localStyles.responsive?.tablet?.fontSize || 'inherit'}
                onValueChange={(value) => {
                  const finalValue = value === 'inherit' ? undefined : value;
                  handleStyleChange('responsive', {
                    ...localStyles.responsive,
                    tablet: { ...localStyles.responsive?.tablet, fontSize: finalValue }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Herdar Desktop</SelectItem>
                  <SelectItem value="text-xs">XS</SelectItem>
                  <SelectItem value="text-sm">SM</SelectItem>
                  <SelectItem value="text-base">Base</SelectItem>
                  <SelectItem value="text-lg">LG</SelectItem>
                  <SelectItem value="text-xl">XL</SelectItem>
                  <SelectItem value="text-2xl">2XL</SelectItem>
                  <SelectItem value="text-3xl">3XL</SelectItem>
                  <SelectItem value="text-4xl">4XL</SelectItem>
                  <SelectItem value="text-5xl">5XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Peso da Fonte</Label>
              <Select
                value={localStyles.responsive?.tablet?.fontWeight || 'inherit'}
                onValueChange={(value) => {
                  const finalValue = value === 'inherit' ? undefined : value;
                  handleStyleChange('responsive', {
                    ...localStyles.responsive,
                    tablet: { ...localStyles.responsive?.tablet, fontWeight: finalValue }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Peso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Herdar Desktop</SelectItem>
                  <SelectItem value="font-thin">Thin</SelectItem>
                  <SelectItem value="font-light">Light</SelectItem>
                  <SelectItem value="font-normal">Normal</SelectItem>
                  <SelectItem value="font-medium">Medium</SelectItem>
                  <SelectItem value="font-semibold">Semibold</SelectItem>
                  <SelectItem value="font-bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Styles */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <h4 className="font-semibold text-sm">📱 Mobile (sm)</h4>
            
            <div className="space-y-2">
              <Label>Tamanho da Fonte</Label>
              <Select
                value={localStyles.responsive?.mobile?.fontSize || 'inherit'}
                onValueChange={(value) => {
                  const finalValue = value === 'inherit' ? undefined : value;
                  handleStyleChange('responsive', {
                    ...localStyles.responsive,
                    mobile: { ...localStyles.responsive?.mobile, fontSize: finalValue }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Herdar Tablet</SelectItem>
                  <SelectItem value="text-xs">XS</SelectItem>
                  <SelectItem value="text-sm">SM</SelectItem>
                  <SelectItem value="text-base">Base</SelectItem>
                  <SelectItem value="text-lg">LG</SelectItem>
                  <SelectItem value="text-xl">XL</SelectItem>
                  <SelectItem value="text-2xl">2XL</SelectItem>
                  <SelectItem value="text-3xl">3XL</SelectItem>
                  <SelectItem value="text-4xl">4XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Peso da Fonte</Label>
              <Select
                value={localStyles.responsive?.mobile?.fontWeight || 'inherit'}
                onValueChange={(value) => {
                  const finalValue = value === 'inherit' ? undefined : value;
                  handleStyleChange('responsive', {
                    ...localStyles.responsive,
                    mobile: { ...localStyles.responsive?.mobile, fontWeight: finalValue }
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Peso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Herdar Tablet</SelectItem>
                  <SelectItem value="font-thin">Thin</SelectItem>
                  <SelectItem value="font-light">Light</SelectItem>
                  <SelectItem value="font-normal">Normal</SelectItem>
                  <SelectItem value="font-medium">Medium</SelectItem>
                  <SelectItem value="font-semibold">Semibold</SelectItem>
                  <SelectItem value="font-bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ========== NOVOS CONTROLES DE DIMENSÕES ========== */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <h4 className="font-semibold text-sm">📐 Dimensões</h4>
            
            {/* Largura */}
            <div className="space-y-2">
              <Label>Largura</Label>
              <Select
                value={localStyles.width || 'default'}
                onValueChange={(value) => handleStyleChange('width', value === 'default' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione largura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="w-full">100% (w-full)</SelectItem>
                  <SelectItem value="w-11/12">91% (w-11/12)</SelectItem>
                  <SelectItem value="w-3/4">75% (w-3/4)</SelectItem>
                  <SelectItem value="w-1/2">50% (w-1/2)</SelectItem>
                  <SelectItem value="w-96">24rem (w-96)</SelectItem>
                  <SelectItem value="w-80">20rem (w-80)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          
            {/* Largura Máxima */}
            <div className="space-y-2">
              <Label>Largura Máxima</Label>
              <Select
                value={localStyles.maxWidth || 'default'}
                onValueChange={(value) => handleStyleChange('maxWidth', value === 'default' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione max-width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Sem limite</SelectItem>
                  <SelectItem value="max-w-7xl">max-w-7xl (1280px)</SelectItem>
                  <SelectItem value="max-w-6xl">max-w-6xl (1152px)</SelectItem>
                  <SelectItem value="max-w-5xl">max-w-5xl (1024px)</SelectItem>
                  <SelectItem value="max-w-4xl">max-w-4xl (896px)</SelectItem>
                  <SelectItem value="max-w-3xl">max-w-3xl (768px)</SelectItem>
                  <SelectItem value="max-w-2xl">max-w-2xl (672px)</SelectItem>
                  <SelectItem value="max-w-xl">max-w-xl (576px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          
            {/* Altura */}
            <div className="space-y-2">
              <Label>Altura</Label>
              <Input
                value={localStyles.height || ''}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                placeholder="Ex: h-screen, h-96, min-h-[500px]"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Classes Tailwind ou CSS (ex: h-screen, h-[600px])
              </p>
            </div>
          
            {/* Altura Mínima */}
            <div className="space-y-2">
              <Label>Altura Mínima</Label>
              <Input
                value={localStyles.minHeight || ''}
                onChange={(e) => handleStyleChange('minHeight', e.target.value)}
                placeholder="Ex: min-h-[400px]"
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Outras Propriedades */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <h4 className="font-semibold text-sm">🎨 Outras Propriedades</h4>

            <div className="space-y-2">
              <Label>Família da Fonte</Label>
              <Select
                value={localStyles.fontFamily || ''}
                onValueChange={(value) => handleStyleChange('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="font-sans">Sans Serif</SelectItem>
                  <SelectItem value="font-serif">Serif</SelectItem>
                  <SelectItem value="font-mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cor do Texto</Label>
              <Input
                type="color"
                value={localStyles.color || '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <Input
                type="color"
                value={localStyles.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Padding (px)</Label>
                <Input
                  type="number"
                  value={localStyles.padding?.replace('px', '') || ''}
                  onChange={(e) => handleStyleChange('padding', `${e.target.value}px`)}
                />
              </div>
              <div className="space-y-2">
                <Label>Margin (px)</Label>
                <Input
                  type="number"
                  value={localStyles.margin?.replace('px', '') || ''}
                  onChange={(e) => handleStyleChange('margin', `${e.target.value}px`)}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
