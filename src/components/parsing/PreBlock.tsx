"use client";

import CodeBlock from "./CodeBlock";
import { type CodeBlockBaseProps } from "./types";

interface PreBlockProps extends CodeBlockBaseProps {
	/**
	 * The children of the pre block, the first of which should be a code block.
	 * If found the props of the code block are forwarded to a {@link CodeBlock} --
	 * otherwise, this component is rendered as `<pre>{childre}</pre>`.
	 * */
	children: React.ReactElement;

	/** Any additional props. */
	[key: string]: any;
}

/**
 * Renders a {@link CodeBlock} given its parent's `<pre><code>...</code></pre>` block.
 * @privateremarks Modified from: https://stackoverflow.com/a/68179028/20697358
 */
const PreBlock = ({ className, colorMode, children, ...props }: PreBlockProps) => {
	return "type" in children && children["type"] === "code" ? (
		<CodeBlock colorMode={colorMode} className={className} {...props}>
			{children.props.children}
		</CodeBlock>
	) : (
		<pre {...props}>{children.props.children}</pre>
	);
};

export { PreBlock as default, type PreBlockProps };
