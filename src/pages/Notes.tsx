import { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { noteService } from '../services/noteService';
import { Note } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { Plus, Trash2, Save } from 'lucide-react';
import '../styles/editor.css';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentNoteIdRef = useRef<number | null>(null);
  const shouldUpdateTitleRef = useRef<boolean>(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Commencez à écrire votre note...',
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Sauvegarde automatique avec debounce
      debouncedSave();
    },
  });

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (selectedNote && editor) {
      // Annuler tout timer de sauvegarde en cours
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      // Mettre à jour la ref avec l'ID de la note actuelle
      currentNoteIdRef.current = selectedNote.id;

      // Permettre la mise à jour du titre via setEditingTitle
      shouldUpdateTitleRef.current = false;

      // Charger le contenu de la note sélectionnée
      editor.commands.setContent(selectedNote.content || '');
      setEditingTitle(selectedNote.title);

      // Réactiver les mises à jour après un court délai
      setTimeout(() => {
        shouldUpdateTitleRef.current = true;
      }, 100);
    }
  }, [selectedNote, editor]);

  const loadNotes = async () => {
    setLoading(true);
    const data = await noteService.getAllNotes();
    setNotes(data);
    if (data.length > 0 && !selectedNote) {
      setSelectedNote(data[0]);
    }
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!selectedNote || !editor) return;

    setIsSaving(true);
    const content = editor.getHTML();
    const success = await noteService.updateNote(selectedNote.id, {
      title: editingTitle,
      content: content,
    });

    if (success) {
      setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, title: editingTitle, content } : n));
    }
    setIsSaving(false);
  };

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (!selectedNote || !editor || !shouldUpdateTitleRef.current) return;

    // Capturer les valeurs actuelles au moment où le timer démarre
    const noteIdAtStart = selectedNote.id;
    const titleAtStart = editingTitle;
    const contentAtStart = editor.getHTML();

    saveTimeoutRef.current = setTimeout(async () => {
      // Vérifier que la note n'a pas changé entre-temps ET que shouldUpdate est toujours true
      if (currentNoteIdRef.current === noteIdAtStart && shouldUpdateTitleRef.current) {
        setIsSaving(true);
        const success = await noteService.updateNote(noteIdAtStart, {
          title: titleAtStart,
          content: contentAtStart,
        });

        if (success) {
          setNotes(prev => prev.map(n => n.id === noteIdAtStart ? { ...n, title: titleAtStart, content: contentAtStart } : n));
        }
        setIsSaving(false);
      }
    }, 3000); // Sauvegarde après 3 secondes d'inactivité
  }, [selectedNote, editor, editingTitle]);

  const handleCreateNote = async () => {
    const newNote = {
      title: 'Nouvelle note',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const success = await noteService.addNote(newNote);
    if (success) {
      toast({ title: 'Succès', description: 'Note créée!' });

      // Recharger les notes et sélectionner la nouvelle
      const data = await noteService.getAllNotes();
      setNotes(data);

      // Sélectionner la note la plus récente (celle qu'on vient de créer)
      if (data.length > 0) {
        const newestNote = data[0]; // Les notes sont triées par updated_at DESC
        setSelectedNote(newestNote);
        setEditingTitle(newestNote.title);
        if (editor) {
          editor.commands.setContent(newestNote.content || '');
        }
      }
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      const success = await noteService.deleteNote(noteId);
      if (success) {
        toast({ title: 'Succès', description: 'Note supprimée' });
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
        loadNotes();
      }
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Liste des notes */}
      <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">📝 Notes</h2>
          <Button size="sm" onClick={handleCreateNote}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                selectedNote?.id === note.id ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {note.updated_at
                      ? new Date(note.updated_at).toLocaleDateString('fr-FR')
                      : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-8">
            Aucune note. Créez-en une !
          </div>
        )}
      </div>

      {/* Éditeur */}
      <div className="flex-1 overflow-y-auto">
        {selectedNote ? (
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-6 space-y-4">
              <Input
                value={editingTitle}
                onChange={(e) => {
                  setEditingTitle(e.target.value);
                  debouncedSave();
                }}
                className="text-3xl font-bold border-none shadow-none p-0 h-auto"
                placeholder="Titre de la note"
              />

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveNote} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                {isSaving && <span className="text-sm text-muted-foreground">Sauvegarde en cours...</span>}
              </div>
            </div>

            {/* Barre d'outils */}
            {editor && (
              <div className="mb-4 p-2 border rounded-md bg-muted/30 flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  H1
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  H2
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  H3
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('bold') ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <strong>B</strong>
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('italic') ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <em>I</em>
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('underline') ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <u>U</u>
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('link') ? 'default' : 'ghost'}
                  onClick={() => {
                    const url = window.prompt('URL:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                >
                  🔗 Lien
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  • Liste
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  1. Liste
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  " Citation
                </Button>
                <Button
                  size="sm"
                  variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                  {'<>'} Code
                </Button>
              </div>
            )}

            {/* Éditeur de contenu */}
            <Card>
              <CardContent className="p-0">
                <EditorContent editor={editor} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Sélectionnez ou créez une note pour commencer
          </div>
        )}
      </div>
    </div>
  );
}
