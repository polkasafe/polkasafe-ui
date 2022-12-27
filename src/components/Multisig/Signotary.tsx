// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import React from 'react';

const Signotary = () => {
	return (
		<div className="flex w-[45vw]">
			<div className="flex w-[100%] items-center justify-center">
				<div className="flex flex-col my-2 pd-2 w-1/2 mr-1">
					<h1 className='text-primary'>Available Signatory</h1>
					<div className='flex flex-col bg-bg-secondary p-4 rounded-lg my-1 h-[30vh] overflow-auto'>
						<p className='bg-bg-main p-2 m-1 rounded-md'>Polka-test 1</p>
						<p className='bg-bg-main p-2 m-1 rounded-md'>Polka-test 2</p>
						<p className='bg-bg-main p-2 m-1 rounded-md'>MultiSig test</p>
					</div>
				</div>
				<SwapOutlined className='text-primary' />
				<div className="flex flex-col my-2 pd-2 w-1/2 ml-2">
					<h1 className='text-primary'>Selected Signatory</h1>
					<div className='flex flex-col bg-bg-secondary p-2 rounded-lg my-1 h-[30vh] overflow-auto'></div>
				</div>
			</div>
		</div>
	);
};

export default Signotary;