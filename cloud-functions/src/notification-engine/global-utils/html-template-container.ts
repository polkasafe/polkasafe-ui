import { NOTIFICATION_SOURCE } from '../notification_engine_constants';

export const htmlTemplateContainer = (source: NOTIFICATION_SOURCE, content: string): string => {
	let notificationSettingsLink = '';
	let header = '';

	switch (source) {
	case NOTIFICATION_SOURCE.POLKASSEMBLY:
		notificationSettingsLink = 'https://polkadot.polkassembly.io/settings?tab=notifications';
		header = 'https://firebasestorage.googleapis.com/v0/b/polkassembly-backend.appspot.com/o/email%2Fpolkassembly-header.png?alt=media';
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
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<style type="text/css">
		body,
		p,
		div {
			font-family: arial, helvetica, sans-serif;
			font-size: 14px;
			color: #000000;
		}
		body a {
			color: #1188e6;
			text-decoration: none;
		}
		p {
			margin: 0;
			padding: 0;
		}
		.main-container {
			max-width: 680px;
			margin: auto;
		}
		.inner-container {
			padding: 44px 52px;
			display: flex;
			flex-direction: column;
			gap: 16px;
			padding-bottom: 0;
		}
		.content-container {
			background-color: #fef7fb;
			padding: 24px 50px;
			display: flex;
			flex-direction: column;
			gap: 14px;
		}
		.link-button {
			border: 1px solid black;
			padding: 10px;
			background: white;
			border-radius: 5px;
		}
		footer {
			background-color:${source === NOTIFICATION_SOURCE.POLKASSEMBLY ?
		'#4e0f1f' : source === NOTIFICATION_SOURCE.POLKASAFE ?
			'#12146F' : '#09162D'};
			height: 80px;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 0 0 44px 44px;
		}
		.common-tag {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 120px;
			text-align: center;
			border-top: 1px solid black;
			margin: 0px 52px;
		}
		.link {
			color: #000000;
			text-decoration: underline;
			font-size: 12px;
			font-weight: 500;
		}
	</style>
</head>
		<body>
		<div class="main-container">
			<header>
                <img
                    src=${header}
                    alt=""
                    width="100%"
                />
            </header>
			<div class="inner-container">
				<div id="main-content">
					${content}
					<div id="end-content"></div>
				</div>
				<br/><br/>
				<div style="text-align: center">
                    <a href="${notificationSettingsLink} class="link">Change your notification settings</a>
                </div>
                <hr />
				<div>
                    <p>Thanks,</p>
                    <p>Polkassembly Team</p>
                    <br>
                </div>
			</div>
			<div class="common-tag">
				<h1 style="font-size: 24px; margin: 0">
					A House of Commons Initiative
				</h1>
			</div>
			<footer>
				<h1 style="font-weight: 400; font-size: 24px; color: white">
					@${source}
				</h1>
			</footer>
		</div>
		</body>
	</html>
`;
};
