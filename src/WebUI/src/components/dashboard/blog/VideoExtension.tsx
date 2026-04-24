import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

// 1. The React Component for the Node
const VideoComponent = (props: NodeViewProps) => {
  return (
    <NodeViewWrapper className="video-node-view group relative my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
      <div className="w-full relative bg-black aspect-video" contentEditable={false}>
        <video
          src={props.node.attrs.src}
          poster={props.node.attrs.poster}
          controls={props.node.attrs.controls}
          className="w-full h-full object-contain"
        />
      </div>
      {props.node.attrs.caption && (
        <div className="p-2 text-center text-sm text-slate-500 bg-slate-50 border-t border-slate-100">
          {props.node.attrs.caption}
        </div>
      )}
    </NodeViewWrapper>
  );
};

// 2. The Tiptap Extension Definition
export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; poster?: string; caption?: string; controls?: boolean }) => ReturnType;
    };
  }
}

export const VideoExtension = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      caption: { default: null },
      controls: { default: true }
    };
  },
  parseHTML() {
    return [{ tag: 'video' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },
  addCommands() {
    return {
      setVideo: (options) => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: options });
      },
    };
  },
});
