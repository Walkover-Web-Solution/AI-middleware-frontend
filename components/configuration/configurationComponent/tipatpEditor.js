"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useCustomSelector } from '@/customHooks/customSelector';
import randomColor from 'randomcolor'; // Import randomcolor

const EditorComponent = ({params, provider, ydoc }) => {
  // Initialize Y.Doc
  
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
          name: name, // You can replace this with actual user data
          color: randomColor(), // Use randomcolor to generate a random color
        },
      }),
    ],
    // content: reduxPrompt,
  });  

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ydoc.destroy();
      provider.destroy();
      // provider.disconnect();
    };
  }, [provider, ydoc, params.version, params]);

  return (
    <div>
      {/* <h1>Collaborative Tiptap Editor with Hocuspocus</h1> */}
      {editor ? <EditorContent editor={editor} /> : <p>Loading editor...</p>}
      {/* {providerData && <div>Data from provider: {JSON.stringify(providerData)}</div>} */}
    </div>
  );
};

export default EditorComponent;
