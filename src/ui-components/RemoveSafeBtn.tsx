// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { TrashIcon } from 'src/ui-components/CustomIcons';

const RemoveSafeBtn = () => {
	return (
		<p className='flex items-center gap-x-0.5 text-red_primary'>
			<TrashIcon/>
			<span className='text-sm lg:text-base font-medium'>Remove Safe</span>
		</p>
	);
};

export default RemoveSafeBtn;