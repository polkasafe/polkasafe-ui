// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import SendFundsForm from 'src/components/SendFunds/SendFundsForm';

const SendFunds = () => {
	return (
		<div>
			<h1 className='text-lg font-bold'>Send Funds</h1>
			<SendFundsForm />
		</div>
	);
};

export default SendFunds;
