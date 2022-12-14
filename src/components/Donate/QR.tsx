// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import qr from 'src/assets/icons/qr.svg';
import { CopyIcon } from 'src/ui-components/CustomIcons';

const QR = () => {
	return (
		<div className='flex flex-col gap-y-5'>
			<div className='flex items-center justify-center'>
				<img className='block w-[150px] lg:w-[250px]' src={qr} alt="" />
			</div>
			<div className='flex items-center gap-x-2 justify-center'>
				<p className='bg-gray_primary1 shadow-small px-2 py-1.5 rounded-lg'>
					<span className='text-sm font-medium lg:text-base'>
                        dot:
					</span>
					<span className='ml-1 text-xs lg:text-sm'>
                        3J98t1WpEZ73C......qRhWNLy
					</span>
				</p>
				<p className='flex items-center'>
					<CopyIcon className='text-blue_primary text-lg'/>
				</p>
			</div>
		</div>
	);
};

export default QR;