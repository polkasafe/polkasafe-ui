// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import type { Option, StorageKey } from '@polkadot/types';
import type { H256, Multisig } from '@polkadot/types/interfaces';

export async function getMultisigInfo(address: string, api: ApiPromise): Promise<[H256, Multisig][] | undefined> {
	let multiInfos;
	await api.query.multisig?.multisigs
		.entries(address)
		.then((infos: [StorageKey, Option<Multisig>][]): void => {
			multiInfos = (
				infos
					.filter(([, opt]) => opt.isSome)
					.map(([key, opt]) => [key.args[1] as H256, opt.unwrap()])
			);
		})
		.catch(console.error);

	return multiInfos;
}
