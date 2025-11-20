import { useState } from "react";
import { MoreHorizontal, Star, Share2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageHeaderProps {
  title: string;
  icon: string;
  onTitleChange: (title: string) => void;
  onIconChange: (icon: string) => void;
}

export function PageHeader({ title, icon, onTitleChange, onIconChange }: PageHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="h-4 w-4" />
          <span>Last edited 2 minutes ago</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Star className="h-4 w-4" />
            Favorite
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Move to</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2">
        <button
          className="text-5xl hover:bg-muted/50 rounded px-1 transition-colors"
          onClick={() => {
            const newIcon = prompt("Enter an emoji:", icon);
            if (newIcon) onIconChange(newIcon);
          }}
        >
          {icon}
        </button>
        
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            className="text-4xl font-bold font-display w-full bg-transparent border-0 outline-none"
            autoFocus
          />
        ) : (
          <h1
            className="text-4xl font-bold font-display cursor-text hover:bg-muted/50 rounded px-1 transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h1>
        )}
      </div>
    </div>
  );
}
