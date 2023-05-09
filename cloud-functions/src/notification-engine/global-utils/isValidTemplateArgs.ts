export default function isValidTemplateArgs(triggerArgs: any, templateArgs: string[]): boolean {
	const triggerArgsArr = Object.keys(triggerArgs as {[index: string]: any});

	return templateArgs.every((item) => triggerArgsArr.includes(item));
}
