// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const firebaseFunctionsHeader = (network: string, address?: string, signature?: string) => ({
	'Accept': 'application/json',
	'Content-Type': 'application/json',
	'x-address': address || localStorage.getItem('address') || '',
	'x-api-key': 'dd5c24c7-b015-40bf-b33c-c6af074b0823',
	'x-network': network || localStorage.getItem('network') || '',
	'x-signature': signature || localStorage.getItem('signature') || '',
	'x-source' : 'polkasafe'
});