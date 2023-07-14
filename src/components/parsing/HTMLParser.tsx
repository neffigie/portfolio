import parse, { Element, domToReact } from 'html-react-parser';
import { CodeBlock, CodeBlockBaseProps, InlineCodeBlock, PreBlock } from './CodeBlock';

interface MarkdownProps {

    /** The markdown body. */
    body: string; 

    /** Whether or not to render in a dark theme. */
    darkTheme: boolean; 
}

/**
 * Renders HTML with custom settings.
 */
const HTMLParser = ({ body, darkTheme }: MarkdownProps) => {
    return parse(body, {
        replace:  node => {
            if (node instanceof Element && node.attribs) {
                const children = domToReact(node.children) as React.ReactElement;
                switch (node.name) {
                    case 'pre':
                        return <PreBlock 
                            darkTheme={darkTheme}
                            className={node.attribs.class as CodeBlockBaseProps['className']}
                            children={children}
                        />
                    case 'code': 
                        return <InlineCodeBlock
                            darkTheme={darkTheme}
                            children={children}
                        />
                    default: return node;
                }
            }
        }
    });
}

export { HTMLParser };
