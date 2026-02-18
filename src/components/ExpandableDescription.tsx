import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExpandableDescriptionProps {
  text: string;
  maxLength?: number;
  color?: string;
  className?: string;
  title?: string;
}

const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({
  text,
  maxLength = 120,
  color,
  className = '',
  title = 'Descrição',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!text) return null;
  
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate 
    ? text.substring(0, maxLength).trim() + '...'
    : text;

  return (
    <>
      <p 
        className={`text-sm break-words leading-relaxed ${className}`}
        style={{ color }}
      >
        {displayText}
        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="ml-1 font-medium underline hover:no-underline transition-all"
            style={{ color }}
          >
            Mais
          </button>
        )}
      </p>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {text}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpandableDescription;
