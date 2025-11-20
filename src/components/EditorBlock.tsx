import { useState } from "react";
import { GripVertical, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorBlockProps {
  type: "heading" | "paragraph" | "list" | "checkbox";
  content: string;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

export function EditorBlock({ type, content, onUpdate, onDelete }: EditorBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getPlaceholder = () => {
    switch (type) {
      case "heading":
        return "Heading";
      case "paragraph":
        return "Type '/' for commands";
      case "list":
        return "List item";
      case "checkbox":
        return "To-do";
      default:
        return "Type something...";
    }
  };

  const getClassName = () => {
    const base = "w-full bg-transparent border-0 outline-none resize-none";
    switch (type) {
      case "heading":
        return `${base} text-3xl font-bold font-display`;
      case "paragraph":
        return `${base} text-base`;
      case "list":
        return `${base} text-base pl-4`;
      default:
        return base;
    }
  };

  return (
    <div
      className="group relative py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-2">
        {(isHovered || isFocused) && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {type === "checkbox" && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1.5 h-4 w-4 rounded border-border"
              />
              <textarea
                value={content}
                onChange={(e) => onUpdate(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={getPlaceholder()}
                className={getClassName()}
                rows={1}
              />
            </div>
          )}
          
          {type !== "checkbox" && (
            <textarea
              value={content}
              onChange={(e) => onUpdate(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholder()}
              className={getClassName()}
              rows={1}
            />
          )}
        </div>
      </div>
    </div>
  );
}
