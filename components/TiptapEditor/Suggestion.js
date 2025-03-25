import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import MentionList from "./MentionList"; // Adjust path as needed
import "tippy.js/dist/tippy.css"; // Import Tippy CSS
import "@/app/globals.css";

const getFilteredMentions = (query, variables) => {
  return variables.filter((item) =>
    item.key.toLowerCase().startsWith(query.toLowerCase())
  );
};

const suggestion = ({ getVariables }) => {
  return {
    char: "{{",
    allowedPrefixes: null,
    decorationClass: "variable-suggestion",
    items: ({ query }) => {
      const variables = getVariables(); // Dynamically fetch variables
      return new Promise((resolve) => {
        resolve(getFilteredMentions(query, variables));
      });
    },

    render: () => {
      let reactRenderer;
      let popup;

      return {
        onStart: (props) => {
          const variables = getVariables(); // Dynamically fetch variables on start
          reactRenderer = new ReactRenderer(MentionList, {
            props: {
              ...props,
              items: getFilteredMentions(props.query, variables), // Use latest variables
            },
            editor: props.editor,
          });

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: reactRenderer.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });

          const tippyContent = document.querySelector(".tippy-content");
          if (tippyContent) {
            tippyContent.style.padding = "0";
          }
        },

        onUpdate(props) {
          const variables = getVariables(); // Dynamically fetch variables on update
          reactRenderer.updateProps({
            ...props,
            items: getFilteredMentions(props.query, variables), // Update with latest variables
          });

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props) {
          if (props.event.key === "Escape") {
            popup[0].hide();
            return true;
          }

          return reactRenderer.ref?.onKeyDown(props);
        },

        onExit() {
          if (popup[0]) popup[0].destroy();
          if (reactRenderer) reactRenderer.destroy();
        },
      };
    },

    shouldActivate: (context) => {
      const precedingText = context.getPrecedingText();
      return /^[{]+$/.test(precedingText); // Match "{{"
    },
  };
};

export default suggestion;
