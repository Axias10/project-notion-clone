import { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  title: string;
  status: string;
}

const initialTasks: Task[] = [
  { id: "1", title: "Design mockups", status: "To Do" },
  { id: "2", title: "Review code", status: "In Progress" },
  { id: "3", title: "Deploy to production", status: "Done" },
];

const columns = ["To Do", "In Progress", "Done"];

export function BoardView() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column} className="flex-shrink-0 w-80">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                {column}
                <span className="text-muted-foreground font-normal">
                  {getTasksByStatus(column).length}
                </span>
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit column</DropdownMenuItem>
                  <DropdownMenuItem>Delete column</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              {getTasksByStatus(column).map((task) => (
                <Card
                  key={task.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <p className="text-sm">{task.title}</p>
                </Card>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                New task
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <Button
        variant="ghost"
        className="flex-shrink-0 w-80 justify-start gap-2 text-muted-foreground hover:text-foreground border-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add column
      </Button>
    </div>
  );
}
