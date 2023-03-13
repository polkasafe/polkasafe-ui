// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { QrDisplayAddress } from '@polkadot/react-qr';
import React from 'react';

const AddressQr = ({ address, genesisHash }: { address: string, genesisHash: string }) => {
	return (
		<div className='flex flex-col items-center'>
			<QrDisplayAddress className='h-80 w-60' address={address} genesisHash={genesisHash} />
		</div>
	);
};

export default AddressQr;