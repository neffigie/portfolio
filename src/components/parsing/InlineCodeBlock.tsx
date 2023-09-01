"use client";

import { Code } from "@chakra-ui/react";
import { type CodeBlockProps } from "./CodeBlock";

/** An inline code block. */
const InlineCodeBlock = ({ children, props }: Omit<CodeBlockProps, "className">) => {
	return <Code {...props}>{children}</Code>;
};

export { InlineCodeBlock as default };
