import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import vs from 'react-syntax-highlighter/dist/esm/styles/prism/vs'

export default function CodeBlock({ language, code }: { language: string, code: string }) {
    return (
        <SyntaxHighlighter language={language} style={vs} showLineNumbers>{code}</SyntaxHighlighter>
    ); 
}