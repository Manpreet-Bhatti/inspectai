"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(
  undefined
);

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a Tooltip");
  }
  return context;
}

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

function Tooltip({
  children,
  open,
  onOpenChange,
  delayDuration = 200,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (newOpen) {
        timeoutRef.current = setTimeout(() => {
          if (isControlled && onOpenChange) {
            onOpenChange(true);
          } else {
            setInternalOpen(true);
          }
        }, delayDuration);
      } else {
        if (isControlled && onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalOpen(false);
        }
      }
    },
    [isControlled, onOpenChange, delayDuration]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContext.Provider
      value={{ open: isOpen, onOpenChange: handleOpenChange }}
    >
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { onOpenChange } = useTooltipContext();

    const handleMouseEnter = () => {
      onOpenChange(true);
    };

    const handleMouseLeave = () => {
      onOpenChange(false);
    };

    const handleFocus = () => {
      onOpenChange(true);
    };

    const handleBlur = () => {
      onOpenChange(false);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{
          onMouseEnter?: () => void;
          onMouseLeave?: () => void;
          onFocus?: () => void;
          onBlur?: () => void;
        }>,
        {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onFocus: handleFocus,
          onBlur: handleBlur,
        }
      );
    }

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      className,
      side = "top",
      align = "center",
      sideOffset = 4,
      children,
      ...props
    },
    ref
  ) => {
    const { open } = useTooltipContext();

    if (!open) return null;

    const sideClasses = {
      top: "bottom-full mb-2",
      bottom: "top-full mt-2",
      left: "right-full mr-2",
      right: "left-full ml-2",
    };

    const alignClasses: Record<typeof side, Record<typeof align, string>> = {
      top: {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0",
      },
      bottom: {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0",
      },
      left: {
        start: "top-0",
        center: "top-1/2 -translate-y-1/2",
        end: "bottom-0",
      },
      right: {
        start: "top-0",
        center: "top-1/2 -translate-y-1/2",
        end: "bottom-0",
      },
    };

    const sideStyles = `${sideClasses[side]} ${alignClasses[side][align]}`;

    return (
      <div
        ref={ref}
        className={cn(
          "bg-primary text-primary-foreground absolute z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs",
          "animate-in fade-in-0 zoom-in-95",
          sideStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
