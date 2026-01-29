'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Palette,
  Highlighter,
  Undo,
  Redo,
  Code,
  GripHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  embeddedFields?: Array<{ id: string; label: string; placeholder: string }>;
  minHeight?: number;
}

// Toolbar Button Component
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'rounded p-1.5 transition-colors',
        isActive
          ? 'bg-brand-teal/10 text-brand-teal'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {children}
    </button>
  );
}

// Divider Component
function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-gray-200" />;
}

// Color Picker Dropdown
function ColorPicker({
  onSelect,
  currentColor,
}: {
  onSelect: (color: string) => void;
  currentColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = [
    { color: '#000000', name: 'Black' },
    { color: '#374151', name: 'Dark Gray' },
    { color: '#6B7280', name: 'Gray' },
    { color: '#DC2626', name: 'Red' },
    { color: '#EA580C', name: 'Orange' },
    { color: '#CA8A04', name: 'Yellow' },
    { color: '#16A34A', name: 'Green' },
    { color: '#0891B2', name: 'Cyan' },
    { color: '#2563EB', name: 'Blue' },
    { color: '#7C3AED', name: 'Purple' },
    { color: '#DB2777', name: 'Pink' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Text Color"
        className="flex items-center gap-1 rounded p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <Palette className="h-4 w-4" />
        <div
          className="h-2 w-4 rounded"
          style={{ backgroundColor: currentColor || '#000000' }}
        />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 rounded-lg border bg-white p-2 shadow-lg">
            <div className="mb-2 text-xs font-medium text-gray-500">Text Color</div>
            <div className="grid grid-cols-4 gap-1">
              {colors.map(({ color, name }) => (
                <button
                  key={color}
                  onClick={() => {
                    onSelect(color);
                    setIsOpen(false);
                  }}
                  title={name}
                  className={cn(
                    'h-6 w-6 rounded border transition-transform hover:scale-110',
                    currentColor === color && 'ring-2 ring-brand-teal ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Highlight Color Picker
function HighlightPicker({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = [
    { color: '#fef08a', name: 'Yellow' },
    { color: '#bbf7d0', name: 'Green' },
    { color: '#fecaca', name: 'Red' },
    { color: '#bfdbfe', name: 'Blue' },
    { color: '#ddd6fe', name: 'Purple' },
    { color: '#fed7aa', name: 'Orange' },
    { color: '#fce7f3', name: 'Pink' },
    { color: '#e5e7eb', name: 'Gray' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Highlight Text"
        className={cn(
          'flex items-center gap-1 rounded p-1.5 transition-colors',
          editor.isActive('highlight')
            ? 'bg-brand-teal/10 text-brand-teal'
            : 'text-gray-500 hover:bg-gray-100'
        )}
      >
        <Highlighter className="h-4 w-4" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 rounded-lg border bg-white p-2 shadow-lg">
            <div className="mb-2 text-xs font-medium text-gray-500">Highlight Color</div>
            <div className="grid grid-cols-4 gap-1">
              {colors.map(({ color, name }) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setIsOpen(false);
                  }}
                  title={name}
                  className="h-6 w-6 rounded border border-gray-200 transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setIsOpen(false);
                }}
                title="Remove Highlight"
                className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Embedded Fields Dropdown
function EmbeddedFieldsDropdown({
  fields,
  onInsert,
  editorHasFocus,
}: {
  fields: Array<{ id: string; label: string; placeholder: string }>;
  onInsert: (placeholder: string) => void;
  editorHasFocus: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleInsert = (placeholder: string) => {
    if (!editorHasFocus) {
      // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setIsOpen(false);
      return;
    }
    onInsert(placeholder);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
      >
        <Code className="h-3 w-3" />
        Embedded Fields
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-3 py-1.5 text-xs text-gray-400">
              Click in editor first to set cursor position
            </div>
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => handleInsert(field.placeholder)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
              >
                <span className="text-gray-700">{field.label}</span>
                <code className="text-xs text-gray-400">{field.placeholder}</code>
              </button>
            ))}
          </div>
        </>
      )}
      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 shadow-lg">
          Click in the text editor first to set cursor position
        </div>
      )}
    </div>
  );
}

// Main Editor Toolbar
function EditorToolbar({
  editor,
  embeddedFields,
  editorHasCursor,
}: {
  editor: Editor;
  embeddedFields?: Array<{ id: string; label: string; placeholder: string }>;
  editorHasCursor: boolean;
}) {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertEmbeddedField = useCallback(
    (placeholder: string) => {
      // Restore focus and insert at cursor position
      editor.chain().focus().insertContent(placeholder).run();
    },
    [editor]
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 px-2 py-1.5">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text Style */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Colors */}
      <ColorPicker
        currentColor={editor.getAttributes('textStyle').color}
        onSelect={(color) => editor.chain().focus().setColor(color).run()}
      />
      <HighlightPicker editor={editor} />

      <ToolbarDivider />

      {/* Links & Images */}
      <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Add Link">
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Add Image">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>

      {/* Embedded Fields */}
      {embeddedFields && embeddedFields.length > 0 && (
        <>
          <ToolbarDivider />
          <EmbeddedFieldsDropdown 
            fields={embeddedFields} 
            onInsert={insertEmbeddedField}
            editorHasFocus={editorHasCursor}
          />
        </>
      )}
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  embeddedFields,
  minHeight = 120,
}: RichTextEditorProps) {
  const [height, setHeight] = useState(minHeight);
  const [editorHasCursor, setEditorHasCursor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const diff = e.clientY - startY.current;
      const newHeight = Math.max(60, Math.min(400, startHeight.current + diff));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'my-1',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      setEditorHasCursor(true);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-brand-teal focus-within:ring-1 focus-within:ring-brand-teal"
    >
      <EditorToolbar editor={editor} embeddedFields={embeddedFields} editorHasCursor={editorHasCursor} />
      <div 
        className="relative overflow-y-auto"
        style={{ height: `${height}px`, maxHeight: '400px' }}
      >
        <EditorContent 
          editor={editor} 
          className="h-full [&_.ProseMirror]:min-h-full [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
        />
      </div>
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex h-4 cursor-ns-resize items-center justify-center border-t border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
        title="Drag to resize"
      >
        <GripHorizontal className="h-3 w-3 text-gray-400" />
      </div>
    </div>
  );
}
