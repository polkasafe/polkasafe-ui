import { convert } from 'html-to-text';
import ejs from 'ejs';
import TurndownService from 'turndown';

export default function getTemplateRender(template:string, options: {[index: string]: any}) {
	const htmlMessage = ejs.render(template, options);
	const textMessage = convert(htmlMessage);

	const startIndex = htmlMessage.indexOf('<div id="main-content">') + 23;
	const endIndex = htmlMessage.indexOf('<div id="end-content">');
	const bodyHtml = htmlMessage.substring(startIndex, endIndex);

	const turndownService = new TurndownService();
	const markdownMessage = turndownService.turndown(bodyHtml);

	return { htmlMessage, markdownMessage, textMessage };
}
