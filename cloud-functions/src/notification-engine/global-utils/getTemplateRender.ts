import { convert } from 'html-to-text';
import ejs from 'ejs';
import TurndownService from 'turndown';

export default function getTemplateRender(template:string, options: {[index: string]: any}) {
	const htmlMessage = ejs.render(template, options);
	const textMessage = convert(htmlMessage);

	const bodyStartIndex = htmlMessage.indexOf('<body>') + 6;
	const bodyEndIndex = htmlMessage.indexOf('</body>');
	const bodyHtml = htmlMessage.substring(bodyStartIndex, bodyEndIndex);

	const turndownService = new TurndownService();
	const markdownMessage = turndownService.turndown(bodyHtml);

	return { htmlMessage, markdownMessage, textMessage };
}
