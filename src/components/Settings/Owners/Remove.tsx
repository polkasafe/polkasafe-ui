// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import RemoveBtn from 'src/components/Settings/RemoveBtn';

const RemoveOwner = () => {
	return (
		<Form
			className='my-0'
		>
			<p className='text-white font-medium text-sm leading-[15px]'>
                Are you sure you want to permanently remove
				<span className='text-primary mx-1.5'>
                    Jaski - 1
				</span>
                as a owner?
			</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn />
				<RemoveBtn/>
			</div>
		</Form>
	);
};

export default RemoveOwner;