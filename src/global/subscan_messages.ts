// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
export const responseMessages = {
	missing_headers: 'Missing headers.',
	invalid_headers: 'Invalid headers.',
	missing_params: 'Missing parameters.',
	invalid_params: 'Invalid parameters passed to the function call.',
	invalid_signature: 'Invalid signature.',
	internal: 'Internal error occured.',
	min_singatories: 'Minimum number of signatories is 2.',
	invalid_threshold: 'Threshold should be a number less than or equal to the number of signatories.',
	multisig_exists: 'Multisig already exists.',
	multisig_create_error: 'Error while creating multisig.',
	onchain_multisig_fetch_error: 'Error while fetching multisig from chain.',
	multisig_not_found: 'Multisig not found.',
	duplicate_signatories: 'Duplicate signatories.',
	invalid_limit: 'Min. and max. limit that can be fetched per page is 1 and 100 respectively.',
	invalid_page: 'Min. value for page is 1.',
	transfers_fetch_error: 'Error while fetching transfers.',
	queue_fetch_error: 'Error while fetching queue.',
	assets_fetch_error: 'Error while fetching assets.',
	success: 'Success'
};
