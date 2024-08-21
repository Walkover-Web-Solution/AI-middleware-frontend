import React from 'react';
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import { prism, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', typescript);

function CodeBlock({ 
    inline,
    className,
    children,
    isDark = false,
    ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
        <div className="text-sm m-0 rounded-sm  w-full">
            <SyntaxHighlighter
                startingLineNumber
                style={isDark ? vscDarkPlus : prism}
                customStyle={isDark ? {} : {backgroundColor: "transparent"}}
                className="outline-none border-0 m-0 w-full rounded"
                language={match[1]}
                wrapLongLines={true} // Enable word wrapping
                codeTagProps={{ style: { whiteSpace: "pre-wrap", backgroundColor: 'transparent' } }} // Ensure word wrapping
                PreTag="div"
                {...props}
            >
                {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    );
}

export default CodeBlock