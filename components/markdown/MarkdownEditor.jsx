"use client";

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/dist/mdeditor.css';
import '@uiw/react-markdown-preview/dist/markdown.css';

const MDEditor = dynamic(
  async () => (await import('@uiw/react-md-editor')).default,
  { ssr: false }
);

export default function MarkdownEditor({
  value,
  onChange,
  height = 400,
  preview = 'live', // 'edit' | 'preview' | 'live'
  placeholder = 'Write your markdown...',
  readOnly = false,
  toolbars, // not mapped directly; using default commands
  className = '',
  onFocus,
  onBlur,
}) {
  const isNumericHeight = typeof height === 'number';
  return (
    <div data-color-mode="light" className={className}>
      <MDEditor
        value={value}
        onChange={onChange}
        preview={preview}
        visibleDragbar={false}
        // @uiw uses textareaProps for placeholder/readOnly/focus handlers
        textareaProps={{ placeholder, readOnly, onFocus, onBlur }}
        height={isNumericHeight ? height : undefined}
        style={!isNumericHeight ? { height } : undefined}
      />
    </div>
  );
}
