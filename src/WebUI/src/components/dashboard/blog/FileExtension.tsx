import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { File, Download } from 'lucide-react';

const FileComponent = (props: NodeViewProps) => {
  const { src, fileName, fileSize } = props.node.attrs;
  
  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <NodeViewWrapper className="file-node-view my-4" contentEditable={false}>
      <a 
        href={src} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
        onClick={(e) => e.preventDefault()}
      >
        <div className="w-10 h-10 rounded bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
          <File className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
          {fileSize > 0 && <p className="text-xs text-slate-500">{formatSize(fileSize)}</p>}
        </div>
        <div className="text-slate-400">
          <Download className="w-5 h-5" />
        </div>
      </a>
    </NodeViewWrapper>
  );
};

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (options: { src: string; fileName: string; fileSize?: number; mimeType?: string }) => ReturnType;
    };
  }
}

export const FileExtension = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',
  group: 'block',
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      fileName: { default: 'Attachment' },
      fileSize: { default: 0 },
      mimeType: { default: 'application/octet-stream' }
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="file-attachment"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'file-attachment' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FileComponent);
  },
  addCommands() {
    return {
      setFileAttachment: (options) => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: options });
      },
    };
  },
});
