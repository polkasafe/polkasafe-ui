// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Call, ExtrinsicPayload } from '@polkadot/types/interfaces';
import { compactToU8a, isHex, u8aConcat, u8aEq } from '@polkadot/util';

interface IExtrinsicInfo {
  decoded: SubmittableExtrinsic<'promise'> | null;
  extrinsicCall: Call | null;
  extrinsicError: string | null;
  extrinsicFn: SubmittableExtrinsicFunction<'promise'> | null;
  extrinsicHex: string | null;
  extrinsicKey: string;
  extrinsicPayload: ExtrinsicPayload | null;
  isCall: boolean;
}

const DEFAULT_INFO: IExtrinsicInfo = {
	decoded: null,
	extrinsicCall: null,
	extrinsicError: null,
	extrinsicFn: null,
	extrinsicHex: null,
	extrinsicKey: 'none',
	extrinsicPayload: null,
	isCall: true
};

export default function decodeCallData (hex: string, api: ApiPromise) : { data?: IExtrinsicInfo, error?: string } {
	if(!isHex(hex)) return {
		error: 'Invalid hex string'
	};

	try {
		let extrinsicCall: Call;
		let extrinsicPayload: ExtrinsicPayload | null = null;
		let decoded: SubmittableExtrinsic<'promise'> | null = null;
		let isCall = false;

		try {
			// cater for an extrinsic input
			const tx = api.tx(hex);

			// ensure that the full data matches here
			if (tx.toHex() === hex)  return {
				error: 'Cannot decode data as extrinsic, length mismatch'
			};

			decoded = tx;
			extrinsicCall = api.createType('Call', decoded.method);
		} catch {
			try {
				// attempt to decode as Call
				extrinsicCall = api.createType('Call', hex);

				const callHex = extrinsicCall.toHex();

				if (callHex === hex) {
					// all good, we have a call
					isCall = true;
				} else if (hex.startsWith(callHex)) {
					// this could be an un-prefixed payload...
					const prefixed = u8aConcat(compactToU8a(extrinsicCall.encodedLength), hex);

					extrinsicPayload = api.createType('ExtrinsicPayload', prefixed);

					if(u8aEq(extrinsicPayload.toU8a(), prefixed)) return {
						error: 'Unable to decode data as un-prefixed ExtrinsicPayload'
					};

					extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
				} else {
					throw new Error('Unable to decode data as Call, length mismatch in supplied data');
				}
			} catch {
				// final attempt, we try this as-is as a (prefixed) payload
				extrinsicPayload = api.createType('ExtrinsicPayload', hex);

				if(extrinsicPayload.toHex() === hex) return {
					error: 'Unable to decode input data as Call, Extrinsic or ExtrinsicPayload'
				};

				extrinsicCall = api.createType('Call', extrinsicPayload.method.toHex());
			}
		}

		const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
		const extrinsicFn = api.tx[section][method];
		const extrinsicKey = extrinsicCall.callIndex.toString();

		if (!decoded) {
			decoded = extrinsicFn(...extrinsicCall.args);
		}

		const extrinsicInfo: IExtrinsicInfo = { ...DEFAULT_INFO, decoded, extrinsicCall, extrinsicFn, extrinsicHex: hex, extrinsicKey, extrinsicPayload, isCall };

		return {
			data: extrinsicInfo
		};
	} catch (e) {
		return {
			error: (e as Error).message
		};
	}
}