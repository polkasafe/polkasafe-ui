// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React from 'react';

import Btn from './Btn';

const SafeDetails = () => {
	return (
		<Form>
			<p className='flex flex-col gap-y-5'>
				<h3 className='text-blue_primary font-bold text-xl'>Contract Version</h3>
				<span className='text-base'>1.3.0</span>
			</p>
			<p className='flex flex-col gap-y-5 mt-10'>
				<h3 className='text-blue_primary font-bold text-xl'>Blockchain Network</h3>
				<span className='text-base'>Ethereum</span>
			</p>
			<p className='flex flex-col gap-y-5 mt-10'>
				<h3 className='text-blue_primary font-bold text-xl'>Modify Safe Name</h3>
				<span className='text-base'>You can change the name of this safe. This name is only stored locally and never shared with PolkaSafe or any third party.</span>
			</p>
			<div className="flex flex-col gap-y-1 mt-5 max-w-xs">
				<label
					className="text-blue_primary font-bold text-sm"
					htmlFor="safeName"
				>
                    Safe Name:
				</label>
				<Form.Item
					name="safeName"
				>
					<Input
						placeholder="jaski.multisig"
						className="rounded-md py-3 px-4 bg-white border-blue_primary tracking-wider"
						id="safeName"
					/>
				</Form.Item>
			</div>
			<div className='flex items-center justify-center md:justify-end'>
				<Btn title='Save' />
			</div>
		</Form>
	);
};

export default SafeDetails;