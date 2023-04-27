// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

const ProxyImpPoints = () => {
	return (
		<div className='bg-bg-secondary rounded-lg p-3 text-text_secondary'>
			<p className='mb-2'>Adding a proxy to your account will help with the following functions:</p>
			<ul className='px-7'>
				<li>Signatories can edit the threshold.</li>
				<li>Signatories can modify the number of signatories.</li>
				<li>Signatories can create backup of their Multisig for easy transfer of assets</li>
			</ul>
		</div>
	);
};

export default ProxyImpPoints;