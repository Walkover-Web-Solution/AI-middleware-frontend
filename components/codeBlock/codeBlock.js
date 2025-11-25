import React from 'react';
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import { prism, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useThemeManager } from '@/customHooks/useThemeManager';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);

function CodeBlock({ 
    inline,
    className,
    children,
    isDark,
    ...props }) {
    const { isDarkTheme } = useThemeManager();
    const match = /language-(\w+)/.exec(className || "");

    // Use the isDark prop if provided, otherwise use the theme manager
    const isCurrentlyDark = isDark !== undefined ? isDark : isDarkTheme;

    // DaisyUI / Tailwind based container classes
    const blockClasses = `text-sm w-full rounded-lg border border-base-300 bg-base-200 text-base-content overflow-x-auto`;    

    return !inline && match ? (
        <div className={blockClasses}>
            <SyntaxHighlighter
                startingLineNumber
                style={isCurrentlyDark ? vscDarkPlus : prism}
                /**
                 * Let DaisyUI control background / padding; keep SyntaxHighlighter
                 * background transparent so token colors are applied on top.
                 */
                customStyle={{
                    background: 'transparent',
                    margin: 0,
                    padding: '0.75rem 1rem',
                }}
                className="outline-none border-0 m-0 w-full rounded-lg font-mono font-normal"
                language={match[1]}
                wrapLongLines={true}
                codeTagProps={{
                    style: {
                        whiteSpace: "pre-wrap",
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    }
                }}
                PreTag="div"
                {...props}
            >
                {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code
            className={`${className || ''} px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono font-normal bg-base-200 text-base-content`}
            {...props}
        >
            {children}
        </code>
    );
}

export default CodeBlock
