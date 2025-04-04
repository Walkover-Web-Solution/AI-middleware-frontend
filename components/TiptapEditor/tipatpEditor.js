import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Mention from "@tiptap/extension-mention";
import suggestion from "./Suggestion";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { useCustomSelector } from "@/customHooks/customSelector";
import randomColor from "randomcolor";
import "@/app/globals.css"; // Ensure this path is correct
import HardBreak from "@tiptap/extension-hard-break";
import { Maximize2, Minimize2 } from "lucide-react";

const EditorComponent = ({ params, provider, ydoc}) => {
  const variablesRef = useRef([]);
  const editorRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { name, variables } = useCustomSelector((state) => ({
    name: state?.userDetailsReducer?.userDetails?.name || "My Name",
    variables:
      state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]
        ?.variables?.map((variable) => ({
          key: variable.key,
          value: variable.value,
        })) || [],
  }));

  const toggleFullScreen = () => {
    const editorContainer = editorRef.current;
    if (!editorContainer) return;

    if (!isFullScreen) {
      editorContainer.classList.add('h-[90vh]');
      // Scroll to the editor when entering full screen
      editorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      editorContainer.classList.remove('h-[90vh]');
    }
    setIsFullScreen(!isFullScreen);
  };

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    extensions: [
      Document,
      Paragraph,
      Text,
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
          const cursor = document.createElement("span");
          cursor.classList.add("collaboration-cursor");
          cursor.style.borderBottom = `2px solid ${user.color}`;
          cursor.style.position = "relative";
          cursor.style.zIndex = "10";

          const label = document.createElement("div");
          label.style.position = "absolute";
          label.style.top = "-1.5em";
          label.style.left = "0";
          label.style.backgroundColor = user.color;
          label.style.color = "white";
          label.style.padding = "0.2em 0.5em";
          label.style.borderRadius = "4px";
          label.style.fontSize = "0.75em";
          label.style.whiteSpace = "nowrap";
          label.style.zIndex = "100";
          label.textContent = user.name;

          cursor.appendChild(label);
          return cursor;
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      Text,
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.setHardBreak(), // Add line break on Enter
            "Shift-Enter": () => this.editor.commands.setHardBreak(), // Add line break on Shift+Enter
          };
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "variables",
        },
        suggestion: suggestion({
          getVariables: () => variablesRef.current, // Dynamically fetch variables
        }),
      }),
    ],
  });

  useEffect(() => {
    return () => {
      ydoc.destroy();
      provider.destroy();
    };
  }, [provider, ydoc, params.version]);

  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  useEffect(() => {
    if (!editor) return;

    const mentionExtension = editor.extensionManager.extensions.find(
      (ext) => ext.name === "mention"
    );

    if (mentionExtension) {
      mentionExtension.options.suggestion = suggestion({
        getVariables: () => variablesRef.current, // Use ref to get the latest variables
      });
    }
  }, [variables, editor]);

  return (
    <>
      <div ref={editorRef} className="editor-container relative">
        <div className="absolute top-2 right-2 z-10">
          <div className="tooltip" data-tip={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}>
            <button
              onClick={toggleFullScreen}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors bg-white shadow-sm"
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
        <EditorContent
          editor={editor}
          className="editor-content"
          style={{ height: isFullScreen ? 'calc(100vh - 64px)' : '400px' }}
        />
      </div>
    </>
  );
};

export default EditorComponent;
