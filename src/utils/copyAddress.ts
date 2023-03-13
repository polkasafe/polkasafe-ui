// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { message } from 'antd';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 *
 */
export default function copyAddress(address: string | null){
	navigator.clipboard.writeText(`${address ? address : ''}`);
	message.success('Copied!');
}
