export default function getMentionedUsernames(content: string): string[] {
	return String(content).match(/(?<=\s|^)@[^\s@]+\b(?!@)/g)?.map((mention) => mention.replace('@', '')) || [];
}
