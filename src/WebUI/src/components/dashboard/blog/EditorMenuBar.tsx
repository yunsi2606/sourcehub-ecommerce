import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough, Underline,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code,
  Image as ImageIcon, Video as VideoIcon, File as FileIcon, Link as LinkIcon, Undo, Redo
} from 'lucide-react';
import { fileApi } from '@/lib/api/files';
import { useAuthStore } from '@/stores/authStore';

export function EditorMenuBar({ editor }: { editor: Editor | null }) {
  const { accessToken } = useAuthStore();

  if (!editor) {
    return null;
  }

  const handleUploadMedia = async (type: 'image' | 'video' | 'file') => {
    const input = document.createElement('input');
    input.type = 'file';
    
    if (type === 'image') input.accept = 'image/*';
    else if (type === 'video') input.accept = 'video/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        if (!accessToken) throw new Error('Not authenticated');

        const res = await fileApi.uploadMediaTemp(file, accessToken);
        
        if (type === 'image') {
          editor.chain().focus().setImage({ src: res.fullUrl, alt: res.fileName }).run();
        } else if (type === 'video') {
          editor.chain().focus().setVideo({ src: res.fullUrl }).run();
        } else {
          editor.chain().focus().setFileAttachment({ 
            src: res.fullUrl, 
            fileName: res.fileName, 
            fileSize: res.fileSize,
            mimeType: res.mimeType
          }).run();
        }
      } catch (err) {
        alert('Upload failed: ' + (err as Error).message);
      }
    };
    
    input.click();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const Button = ({ onClick, isActive, disabled, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded flex items-center justify-center transition-colors ${
        isActive ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2 sticky top-0 z-10 rounded-t-xl">
      <Button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo className="w-4 h-4" /></Button>
      
      <div className="w-px h-6 bg-slate-300 mx-1" />
      
      <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><Strikethrough className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}><Code className="w-4 h-4" /></Button>
      <Button onClick={setLink} isActive={editor.isActive('link')}><LinkIcon className="w-4 h-4" /></Button>
      
      <div className="w-px h-6 bg-slate-300 mx-1" />

      <Button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}><Heading3 className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}><Quote className="w-4 h-4" /></Button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <Button onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}><AlignLeft className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}><AlignCenter className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}><AlignRight className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}><AlignJustify className="w-4 h-4" /></Button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <Button onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="w-4 h-4" /></Button>
      <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="w-4 h-4" /></Button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <input
        type="color"
        onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0"
        title="Text Color"
      />

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <Button onClick={() => handleUploadMedia('image')}><ImageIcon className="w-4 h-4" /></Button>
      <Button onClick={() => handleUploadMedia('video')}><VideoIcon className="w-4 h-4" /></Button>
      <Button onClick={() => handleUploadMedia('file')}><FileIcon className="w-4 h-4" /></Button>
    </div>
  );
}
