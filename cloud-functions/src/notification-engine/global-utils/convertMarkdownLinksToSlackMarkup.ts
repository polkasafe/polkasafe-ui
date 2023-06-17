export default function convertMarkdownLinksToSlackMarkup(markdown: string): string {
	const regex = /\[(.*?)\]\((.*?)\)/g;
	return markdown.replace(regex, '<$2|$1>');
}
