// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function formatUSDWithUnits (usd:String) {
	// Nine Zeroes for Billions
	const formattedUSD = Math.abs(Number(usd)) >= 1.0e+9

		? (Math.abs(Number(usd)) / 1.0e+9).toFixed(2) + 'B'
	// Six Zeroes for Millions
		: Math.abs(Number(usd)) >= 1.0e+6

			? (Math.abs(Number(usd)) / 1.0e+6).toFixed(2) + 'M'
		// Three Zeroes for Thousands
			: Math.abs(Number(usd)) >= 1.0e+3

				? (Math.abs(Number(usd)) / 1.0e+3).toFixed(2) + 'K'

				: Math.abs(Number(usd));

	return formattedUSD.toString();
}
