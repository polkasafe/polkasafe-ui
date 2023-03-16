// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { message } from 'antd';

import getEncodedAddress from './getEncodedAddress';

/**
 * Return an address encoded for the current network
 *
 * @param text a string to copy
 * @param isAddress wether the string is an address or not
 * @param network network to encode the address string for
 *
 */

export default function copyText(text: string, isAddress?: boolean, network?: string) {

	let textToCopy = text;

	if (isAddress && network) {
		textToCopy = getEncodedAddress(text, network) || '';
	}

	navigator.clipboard.writeText(`${textToCopy}`);
	message.success('Copied!');
}
