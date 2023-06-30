import { convert } from 'html-to-text';
import ejs from 'ejs';
import TurndownService from 'turndown';
import { NOTIFICATION_SOURCE } from '../notification_engine_constants';
import getSourceFirebaseAdmin from './getSourceFirebaseAdmin';
import getTriggerTemplate from './getTriggerTemplate';
import isValidTemplateArgs from './isValidTemplateArgs';

export default async function getTemplateRender(
	source: NOTIFICATION_SOURCE,
	trigger: string,
	options: {[index: string]: any}
) {
	const { firestore_db } = getSourceFirebaseAdmin(source);

	const triggerTemplateData = await getTriggerTemplate(firestore_db, source, trigger);
	if (!triggerTemplateData) throw Error(`Template not found for trigger: ${trigger}`);

	const { subject, template, args } = triggerTemplateData;

	if (args.length > 0 && !isValidTemplateArgs(options, args)) throw Error(`Invalid arguments for trigger template : ${trigger}`);

	const htmlMessage = ejs.render(template, options);

	const bodyStartIndex = htmlMessage.indexOf('<body>') + 6;
	const bodyEndIndex = htmlMessage.indexOf('</body>');
	const bodyHtml = htmlMessage.substring(bodyStartIndex, bodyEndIndex);

	const textMessage = convert(bodyHtml);

	const turndownService = new TurndownService();
	const markdownMessage = turndownService.turndown(bodyHtml);

	return { htmlMessage, markdownMessage, textMessage, subject };
}
