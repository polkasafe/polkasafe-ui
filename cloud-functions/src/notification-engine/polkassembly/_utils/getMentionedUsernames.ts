export default function getMentionedUsernames(content: string): string[] {
	// matches for spaces around it and/or html tags, except for the anchor tag
	const mentionedUsernamesPattern = /(?<=(?:^|\s+|<((?!a\b)\w+)>|&nbsp;)@)\w+(?=(?:\s+|&nbsp;|<\/((?!a\b)\w+)>))/g;
	return String(content).match(mentionedUsernamesPattern) || [];
}
