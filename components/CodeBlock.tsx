import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';  
import { vsDark, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function CodeBlock({ className, children }: { className: string, children: string }) {
    const language = /lang-(\w+)/.exec(className || ''); 
    return (
        <SyntaxHighlighter language={language ? language[1] : ''} style={vs} showLineNumbers>{children}</SyntaxHighlighter>
    ); 
}