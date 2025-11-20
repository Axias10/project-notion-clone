import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { EditorBlock } from "@/components/EditorBlock";
import { BoardView } from "@/components/BoardView";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Block {
  id: string;
  type: "heading" | "paragraph" | "list" | "checkbox";
  content: string;
}

export default function Page() {
  const { pageId } = useParams();
  const [pageTitle, setPageTitle] = useState("Getting Started");
  const [pageIcon, setPageIcon] = useState("📝");
  const [view, setView] = useState<"editor" | "board">("editor");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "heading", content: "Welcome to your workspace" },
    { id: "2", type: "paragraph", content: "Start typing to add content..." },
  ]);

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  return (
    <div className="min-h-screen bg-editor">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <PageHeader
          title={pageTitle}
          icon={pageIcon}
          onTitleChange={setPageTitle}
          onIconChange={setPageIcon}
        />

        <Tabs defaultValue="editor" className="w-full" onValueChange={(v) => setView(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-1">
            {blocks.map((block) => (
              <EditorBlock
                key={block.id}
                type={block.type}
                content={block.content}
                onUpdate={(content) => updateBlock(block.id, content)}
                onDelete={() => deleteBlock(block.id)}
              />
            ))}

            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground mt-4"
              onClick={() => addBlock("paragraph")}
            >
              <Plus className="h-4 w-4" />
              Add a block
            </Button>
          </TabsContent>

          <TabsContent value="board">
            <BoardView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
