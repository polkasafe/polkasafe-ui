import { NOTIFICATION_SOURCE } from '../notification_engine_constants';

export const htmlTemplateContainer = (source: NOTIFICATION_SOURCE, content: string): string => {
	let notificationSettingsLink = '';

	switch (source) {
	case NOTIFICATION_SOURCE.POLKASSEMBLY:
		notificationSettingsLink = 'https://polkadot.polkassembly.io/settings?tab=notifications';
		break;
	case NOTIFICATION_SOURCE.POLKASAFE:
		notificationSettingsLink = 'https://app.polkasafe.xyz/notification-settings';
		break;
		// TODO: fix townhall links
	case NOTIFICATION_SOURCE.TOWNHALL:
		notificationSettingsLink = 'https://townhallgov.com/notification-settings';
		break;
	}

	return `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<style type="text/css">
				body, p, div {
					font-family: arial,helvetica,sans-serif;
					font-size: 14px;
					color: #000000;
				}
				body a {
					color: #1188E6;
					text-decoration: none;
				}
				p { margin: 0; padding: 0; }
				.content-container {
					margin: 0 auto;
					max-width: 600px;
				}
			</style>
		</head>
		<body>
			<div class="content-container">
				${content}
				<br/><br/>
				You can deactivate this notification in your <a href="${notificationSettingsLink}">notification settings</a>.<br />
				${source.charAt(0).toUpperCase()}${source.slice(1)} Team
			</div>
		</body>
	</html>
`;
};
