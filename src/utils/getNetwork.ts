// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK } from 'src/global/networkConstants';

/**
 * Return the current network
 *
 */

export default function getNetwork() {
	const defaultNetwork = NETWORK.GOERLI;
	let network = localStorage.getItem('network') || defaultNetwork;

	const possibleNetworks = Object.values(network);

	if (!possibleNetworks.includes(network)) {
		network = defaultNetwork;
	}

	return network;
}
