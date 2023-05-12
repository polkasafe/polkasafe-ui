import { convert } from 'html-to-text';
import ejs from 'ejs';

export default function getTemplateRender(template:string, options: {[index: string]: any}) {
	const htmlMessage = ejs.render(template, options);
	const textMessage = convert(htmlMessage);

	return { htmlMessage, textMessage };
}
