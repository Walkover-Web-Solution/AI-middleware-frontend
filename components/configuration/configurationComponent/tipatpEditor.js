// EditorComponent.jsx
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { useCustomSelector } from '@/customHooks/customSelector';
import randomColor from 'randomcolor';
import * as Y from 'yjs';
import '@/app/globals.css';


const EditorComponent = ({ params, provider, ydoc }) => {
  const { name } = useCustomSelector((state) => ({
    name: state?.userDetailsReducer?.userDetails?.name || "My Name",
  }));

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: name,
          color: randomColor(),
        },
        render: (user) => {
          const cursor = document.createElement('span');
          cursor.classList.add('collaboration-cursor');
          cursor.style.borderBottom = `2px solid ${user.color}`;
          cursor.style.position = 'relative';
          cursor.style.zIndex = '10';

          const label = document.createElement('div');
          label.style.position = 'absolute';
          label.style.top = '-1.5em';
          label.style.left = '0';
          label.style.backgroundColor = user.color;
          label.style.color = 'white';
          label.style.padding = '0.2em 0.5em';
          label.style.borderRadius = '4px';
          label.style.fontSize = '0.75em';
          label.style.whiteSpace = 'nowrap';
          label.textContent = user.name;

          cursor.appendChild(label);
          return cursor;
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
    ]
  });

  useEffect(() => {
    return () => {
      ydoc.destroy();
      provider.destroy();
    };
  }, [provider, ydoc, params.version, params]);

  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;

    const handleBlur = () => {
      saveDocument();
    };

    editorElement.addEventListener('blur', handleBlur);

    return () => {
      editorElement.removeEventListener('blur', handleBlur);
    };
  }, [editor]);

  const saveDocument = async () => {
    if (!editor) return;

    const ydocState = Y.encodeStateAsUpdate(ydoc);
    console.log(ydocState);
    
    try {
      const response = await fetch(`http://localhost:1234/api/save-document/${params?.version}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: ydocState,
      });

      if (response.ok) {
        console.log('Document saved successfully on blur.');
      } else {
        console.error('Failed to save document on blur:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving document on blur:', error);
    }
  };

  return (
    <>
      {/* <MenuBar editor={editor} />
      {editor ? ( */}
        <EditorContent editor={editor} className="editor-content" style={{ height: '400px' }} />
      {/* ) : (
        <p>Loading editor...</p>
      )} */}
    </>
  );
};

export default EditorComponent;
