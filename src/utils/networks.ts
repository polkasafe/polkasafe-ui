// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import kusamaIcon from 'src/assets/parachains-icons/kusama.svg';
import polkadotIcon from 'src/assets/parachains-icons/polkadot.svg';
export interface INetwork {
	icon: string;
	title: string;
	to: string;
	token: string;
}

export const networks: INetwork[] = [
	{
		icon: polkadotIcon,
		title: 'Polkadot',
		to: '/',
		token: 'DOT'
	},
	{
		icon: kusamaIcon,
		title: 'Kusama',
		to: '/',
		token: 'KSM'
	}
];
