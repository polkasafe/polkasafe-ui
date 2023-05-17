import { NOTIFICATION_SOURCE } from '../notification_engine_constants';

export const emailTemplateContainer = (source: NOTIFICATION_SOURCE, content: string): string => {
	let privacyPolicyLink = '';
	let domain = '';

	switch (source) {
	case NOTIFICATION_SOURCE.POLKASSEMBLY:
		privacyPolicyLink = 'https://polkadot.polkassembly.io/privacy';
		domain = 'https://polkadot.polkassembly.io';
		break;
	case NOTIFICATION_SOURCE.POLKASAFE:
		privacyPolicyLink = 'https://app.polkasafe.xyz/privacy-policy';
		domain = 'https://app.polkasafe.xyz';
		break;
		// TODO: fix townhall links
	case NOTIFICATION_SOURCE.TOWNHALL:
		privacyPolicyLink = 'https://premiurly.in/policy/privacy-policy/';
		domain = 'https://premiurly.in';
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
				.polk-container {
					margin: 0 auto;
					max-width: 600px;
				}
				.footer {
					margin-top: 20px;
					font-size: 10px;
					text-align: center;
					color: #313638;
				}
			</style>
		</head>
		<body>
			<div class="polk-container">
				${content}
				<br/><br/>
				You can deactivate this notification in your <a href="${domain}/notification-settings">notification settings</a>.<br /><br />
				${source.charAt(0).toUpperCase()}${source.slice(1)} Team
			</div>
			<div class="footer">
				Registered Address: Polka Labs PTE. LTD., 3 Fraser Street, #05-25, Duo Tower, Singapore (189352)<br />
				<a target="_blank" href="${privacyPolicyLink}">Privacy Policy</a>
			</div>
		</body>
	</html>
`;
};
