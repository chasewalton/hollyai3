import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CitationTooltip = ({ children, citation }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-gray-400">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Source: {citation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CitationTooltip;