// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { ICompact, INumber } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import { BN_ZERO, isFunction, objectSpread } from '@polkadot/util';

type V1Weight = INumber;

interface V2Weight {
  refTime: ICompact<INumber>;
  proofSize: ICompact<INumber>;
}

interface V2WeightConstruct {
  refTime: BN | ICompact<INumber>;
}

interface Result {
  encodedCallLength: number;
  isWeightV2: boolean;
  v1Weight: BN;
  v2Weight: V2WeightConstruct;
  weight: BN | V2WeightConstruct;
}

// this is 32 bytes in length, it allows construction for both AccountId32 & AccountId20
export const ZERO_ACCOUNT = '0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef';

const EMPTY_STATE: Partial<Result> = {
	encodedCallLength: 0,
	v1Weight: BN_ZERO,
	v2Weight: { refTime: BN_ZERO },
	weight: BN_ZERO
};

// return both v1 & v2 weight structures (would depend on actual use)
export function convertWeight (weight: V1Weight | V2Weight): { v1Weight: BN, v2Weight: V2WeightConstruct } {
	if ((weight as V2Weight).proofSize) {
		// V2 weight
		const refTime = (weight as V2Weight).refTime.toBn();

		return { v1Weight: refTime, v2Weight: weight as V2Weight };
	} else if ((weight as V2Weight).refTime) {
		// V1.5 weight (when not converted)
		const refTime = (weight as V2Weight).refTime.toBn();

		return { v1Weight: refTime, v2Weight: { refTime } };
	}

	// V1 weight
	const refTime = (weight as V1Weight).toBn();

	return { v1Weight: refTime, v2Weight: { refTime } };
}

// for a given call, calculate the weight
export async function calcWeight (call: Call, api: ApiPromise): Promise<Result> {
	let val = objectSpread({
		isWeightV2: !isFunction(api.registry.createType<V1Weight>('Weight').toBn)
	}, EMPTY_STATE) as Result;

	if (call && api.call.transactionPaymentApi) {
		try {
			const { v1Weight, v2Weight } = convertWeight(
				(await api.tx(call).paymentInfo(ZERO_ACCOUNT)).weight
			);

			val = objectSpread({}, {
				encodedCallLength: call.encodedLength,
				v1Weight,
				v2Weight,
				weight: !isFunction(api.registry.createType<V1Weight>('Weight').toBn)
					? v2Weight
					: v1Weight
			});

		} catch (error) {
			console.error(error);
		}
	}

	return val;
}