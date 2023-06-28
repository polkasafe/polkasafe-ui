// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { message } from 'antd';

/**
 * Return an address encoded for the current network
 *
 * @param text a string to copy
 * @param isAddress wether the string is an address or not
 * @param network network to encode the address string for
 *
 */
const showMessage = (): void => {
	message.config({
		top: window.innerHeight - 100
	});
	message.open({
		content: 'Copied!',
		duration: 3,
		style: {
			position: 'fixed',
			right: 0
		},
		type: 'success'
	});
};

export default function copyText(text: string) {
	navigator.clipboard.writeText(`${text}`);
	showMessage();
}
