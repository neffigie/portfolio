"use client";

import { Box, Container } from "@chakra-ui/react";

export function MainContainer({ children }: React.PropsWithChildren) {
	return (
		<Container maxWidth="4xl" centerContent>
			<Box padding="2">{children}</Box>
		</Container>
	);
}
