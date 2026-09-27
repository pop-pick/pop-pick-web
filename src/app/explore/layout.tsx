export default function ExploreLayout({ children, sheet }: LayoutProps<"/explore">) {
	return (
		<>
			{children}
			{sheet}
		</>
	);
}
