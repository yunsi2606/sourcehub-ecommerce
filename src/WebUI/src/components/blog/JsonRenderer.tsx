import React, { JSX } from 'react';
import { File, Download } from 'lucide-react';

const renderMarks = (node: any, children: React.ReactNode) => {
  if (!node.marks || node.marks.length === 0) return children;

  let current = children;

  // Sort marks so link is innermost or outermost as needed, though Tiptap handles it.
  for (const mark of node.marks) {
    switch (mark.type) {
      case 'bold':
        current = <strong key={`bold-${Math.random()}`}>{current}</strong>;
        break;
      case 'italic':
        current = <em key={`italic-${Math.random()}`}>{current}</em>;
        break;
      case 'strike':
        current = <del key={`strike-${Math.random()}`}>{current}</del>;
        break;
      case 'code':
        current = <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-sm" key={`code-${Math.random()}`}>{current}</code>;
        break;
      case 'link':
        current = (
          <a
            href={mark.attrs.href}
            target={mark.attrs.target}
            className="text-primary hover:underline"
            key={`link-${Math.random()}`}
          >
            {current}
          </a>
        );
        break;
      case 'textStyle':
        current = (
          <span
            style={{
              color: mark.attrs.color,
              backgroundColor: mark.attrs.backgroundColor,
              fontSize: mark.attrs.fontSize,
              fontFamily: mark.attrs.fontFamily
            }}
            key={`style-${Math.random()}`}
          >
            {current}
          </span>
        );
        break;
    }
  }
  return current;
};

const renderNode = (node: any, index: number): React.ReactNode => {
  if (node.type === 'text') {
    return renderMarks(node, node.text);
  }

  const children = node.content ? node.content.map((child: any, i: number) => renderNode(child, i)) : null;

  switch (node.type) {
    case 'paragraph':
      const hasBlockChild = node.content?.some((child: any) => ['image', 'video', 'fileAttachment'].includes(child.type));
      if (hasBlockChild) {
        return (
          <div key={index} style={{ textAlign: node.attrs?.textAlign }} className="mb-4 leading-relaxed">
            {children || <br />}
          </div>
        );
      }
      return (
        <p key={index} style={{ textAlign: node.attrs?.textAlign }} className="mb-4 leading-relaxed">
          {children || <br />}
        </p>
      );
    case 'heading':
      const Tag = `h${node.attrs?.level || 2}` as keyof JSX.IntrinsicElements;
      const classes = {
        1: "text-3xl font-bold mt-8 mb-4",
        2: "text-2xl font-bold mt-8 mb-4",
        3: "text-xl font-bold mt-6 mb-3",
        4: "text-lg font-bold mt-6 mb-2",
        5: "text-base font-bold mt-4 mb-2",
        6: "text-sm font-bold mt-4 mb-2",
      }[node.attrs?.level as number] || "text-xl font-bold mt-6 mb-4";

      return (
        <Tag key={index} className={classes} style={{ textAlign: node.attrs?.textAlign }}>
          {children}
        </Tag>
      );
    case 'bulletList':
      return <ul key={index} className="list-disc pl-6 mb-4 space-y-2">{children}</ul>;
    case 'orderedList':
      return <ol key={index} className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
    case 'listItem':
      return <li key={index}>{children}</li>;
    case 'blockquote':
      return (
        <blockquote key={index} className="border-l-4 border-slate-200 pl-4 py-1 mb-4 text-slate-600 italic bg-slate-50 rounded-r-lg">
          {children}
        </blockquote>
      );
    case 'codeBlock':
      return (
        <pre key={index} className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto mb-4 text-sm font-mono">
          <code>{children}</code>
        </pre>
      );
    case 'image':
      return (
        <figure key={index} className="my-8">
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || ''}
            title={node.attrs?.title || ''}
            className="w-full h-auto rounded-xl border border-slate-100"
          />
          {node.attrs?.caption && (
            <figcaption className="text-center text-sm text-slate-500 mt-2">{node.attrs.caption}</figcaption>
          )}
        </figure>
      );
    case 'video':
      return (
        <figure key={index} className="my-8 rounded-xl overflow-hidden border border-slate-200 bg-black">
          <video
            src={node.attrs?.src}
            controls={node.attrs?.controls !== false}
            poster={node.attrs?.poster}
            className="w-full aspect-video"
          />
          {node.attrs?.caption && (
            <figcaption className="text-center text-sm text-slate-500 bg-slate-50 p-2">{node.attrs.caption}</figcaption>
          )}
        </figure>
      );
    case 'fileAttachment':
      const formatSize = (bytes: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
      };
      return (
        <a
          key={index}
          href={node.attrs?.src}
          download={node.attrs?.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors my-4 no-underline group"
        >
          <div className="w-10 h-10 rounded bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
            <File className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate m-0">{node.attrs?.fileName || 'Attachment'}</p>
            {node.attrs?.fileSize > 0 && <p className="text-xs text-slate-500 m-0 mt-0.5">{formatSize(node.attrs.fileSize)}</p>}
          </div>
          <div className="text-slate-400 group-hover:text-primary transition-colors">
            <Download className="w-5 h-5" />
          </div>
        </a>
      );
    case 'horizontalRule':
      return <hr key={index} className="my-8 border-slate-200" />;
    default:
      // Fallback for unknown nodes
      return children ? <div key={index}>{children}</div> : null;
  }
};

export const JsonRenderer = ({ contentJson }: { contentJson: string }) => {
  if (!contentJson) return null;

  try {
    const doc = JSON.parse(contentJson);
    if (doc.type !== 'doc' || !doc.content) return null;

    return (
      <div className="prose prose-slate max-w-none text-slate-700">
        {doc.content.map((node: any, index: number) => renderNode(node, index))}
      </div>
    );
  } catch (e) {
    console.error('Failed to parse blog content JSON', e);
    return <div className="text-red-500">Nội dung không hợp lệ.</div>;
  }
};
