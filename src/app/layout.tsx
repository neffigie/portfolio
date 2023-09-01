import { StyleJsxGlobal, Providers, ColorModeScript } from "chakra";
import { Header } from "components";
import { HandleOnComplete } from "router";
import { MainContainer } from "./MainContainer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning /** https://github.com/chakra-ui/chakra-ui/issues/7040#issuecomment-1655818781 */>
			<body suppressHydrationWarning>
				<ColorModeScript />
				<HandleOnComplete />
				<StyleJsxGlobal />
				<Providers>
					<MainContainer>
						<Header />
						{children}
					</MainContainer>
				</Providers>
			</body>
		</html>
	);
}
