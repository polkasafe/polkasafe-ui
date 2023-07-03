export default function createDiscordEmbed(subject: string, markdownString: string) {
	return {
		title: subject,
		description: markdownString,
		color: 0xE5017A
	};
}
