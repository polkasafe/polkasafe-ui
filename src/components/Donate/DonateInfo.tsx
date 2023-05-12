// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React from 'react';
import polkasafeLogo from 'src/assets/polkasafe-logo-white.svg';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExternalLinkIcon, WalletIcon } from 'src/ui-components/CustomIcons';

import QR from './QR';

const DonateInfo = () => {
	return (
		<>
			<div className='flex flex-col gap-y-10 md:flex-row md:gap-x-20 items-center text-white'>
				<article className='flex flex-col justify-between h-full'>
					<p className='text-sm font-normal'>
						If you like the product, feel free to Donate us!
					</p>
					<div className='flex items-center justify-center my-10'>
						<img src={polkasafeLogo} alt="polkadot logo" />
					</div>
					<div className='text-normal text-sm max-w-[367px] leading-4'>
						Polkasafe is built for the ecosystem using grants from treasury & community.
					</div>
				</article>
				<article>
					<QR/>
				</article>
			</div>
			<Divider className='bg-text_secondary my-8' />
			<div className='flex items-center gap-x-5 gap-y-5 flex-col md:flex-row justify-between text-white'>
				<p className='flex gap-x-2 flex-col xl:flex-row xl:items-center'>
					<span className='text-sm font-normal leading-[15px]'>
                        If you don{'\''}t have a polkadot wallet, don{'\''}t worry, you can create one for free at
					</span>
					<span className='text-primary'>
						<a href='https://polkadot.js.org/extension/' target={'_blank'} rel="noreferrer" className='flex items-center'>
							Polkadot{'{.js}'}
							<ExternalLinkIcon className='w-[11px] h-[11px] ml-[6.62px]' />
						</a>
					</span>
				</p>
				<a href='https://polkadot.js.org/extension/' rel="noreferrer" target={'_blank'} className='text-primary px-[10px] py-2 bg-highlight rounded-lg flex items-center border-none outline-none gap-x-[10.83px]'>
					<WalletIcon className='text-base'/>
					<span className='font-bold text-sm cursor-pointer'>
                        Create Wallet
					</span>
				</a>
			</div>
		</>
	);
};

export default DonateInfo;