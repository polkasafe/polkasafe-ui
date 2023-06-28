export default function getMentionedUsernames(content: string): string[] {
	const pattern = /\B@[a-z0-9_-]+/gi;
	return String(content).match(pattern)?.map((mention) => mention.replace('@', '')) || [];
}
