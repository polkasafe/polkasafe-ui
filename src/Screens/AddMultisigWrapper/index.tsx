// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import AddMultisig from 'src/components/Multisig/AddMultisig';

const AddMultisigWrapper = () => {
	return (
		<div className='flex justify-center items-center h-full rounded-xl flex-col  min-h-[500px] bg-bg-main
		'>
			<AddMultisig />
		</div>
	);
};

export default AddMultisigWrapper;