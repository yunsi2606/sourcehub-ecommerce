import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { VideoExtension } from './VideoExtension';
import { FileExtension } from './FileExtension';
import { EditorMenuBar } from './EditorMenuBar';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (json: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      VideoExtension,
      FileExtension,
    ],
    content: content ? JSON.parse(content) : '',
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[500px] p-4',
      },
    },
  });

  // Effect to update content if it changes externally (e.g., loaded from API)
  useEffect(() => {
    if (editor && content && content !== JSON.stringify(editor.getJSON())) {
      try {
        const parsed = JSON.parse(content);
        if (Object.keys(parsed).length > 0) {
          editor.commands.setContent(parsed);
        }
      } catch (e) {
        // invalid json, ignore
      }
    }
  }, [content, editor]);

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
      <EditorMenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[800px] bg-white tiptap-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
