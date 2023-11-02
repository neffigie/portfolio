import PreBlock from "./PreBlock";
import InlineCodeBlock from "./InlineCodeBlock";
import { CodeBlockBaseProps } from "./types";
import { NavLink, Text, HeadingLink } from "components";
import { generateSlug } from "shared/parsing";

import parse, { DOMNode, Element, attributesToProps, domToReact } from "html-react-parser";
import { ColorMode, Divider, Stack } from "@chakra-ui/react";

interface MarkdownProps {
    /** The HTML. */
    body: string;

    /** The current color mode. */
    colorMode: ColorMode;
}

/** Renders HTML. */
const HTMLParser = ({ body, colorMode }: MarkdownProps) => {
    if (!body) return "";

    /** replaces a {@link DOMNode} with the appropriate element or `undefined` if the `node` is an instance of the domhandler's `Element`. */
    const replace = (node: DOMNode) => {
        if (node instanceof Element && node.attribs) {
            const props = attributesToProps(node.attribs) as any;
            switch (node.name as keyof HTMLElementTagNameMap) {
                case "pre":
                    return (
                        <PreBlock
                            colorMode={colorMode}
                            className={node.attribs.class as CodeBlockBaseProps["className"]}
                            {...props}
                        >
                            {domToReact(node.children) as React.ReactElement}
                        </PreBlock>
                    );
                case "code":
                    return (
                        <InlineCodeBlock colorMode={colorMode} {...props}>
                            {domToReact(node.children)}
                        </InlineCodeBlock>
                    );
                case "h2":
                    const children = domToReact(node.children);
                    if (children === "\xa0" /** &nbsp */) return <></>;
                    return (
                        // @ts-ignore TODO - Argument of type ChildNode is not assignable to parameter of type ChildNode | Node | ParentNode
                        <HeadingLink slugSource={generateSlug(node.children[0])} text={children} {...props} />
                    );
                case "p":
                    return (
                        <Text as="div" fontSize="md" lineHeight={6} {...props}>
                            {domToReact(node.children, { replace: replace })}
                        </Text>
                    );
                case "sub":
                    return (
                        <Text as="sub" {...props}>
                            {domToReact(node.children)}
                        </Text>
                    );
                case "a":
                    return (
                        <NavLink {...props} variant="external">
                            {domToReact(node.children)}
                        </NavLink>
                    );
                case "blockquote":
                    return (
                        <Stack direction="row" padding={4} alignItems="center">
                            <Divider orientation="vertical" height="250px" paddingLeft={2} />
                            <Text as="i">{domToReact(node.children)}</Text>
                        </Stack>
                    );
                default:
                    return node;
            }
        }
    };

    return parse(body, { replace: replace });
};

export { HTMLParser as default };
