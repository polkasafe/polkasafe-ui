// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React from 'react';
import polkadotLogoText from 'src/assets/icons/polkadot-logo-text.svg';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExternalLinkIcon, WalletIcon } from 'src/ui-components/CustomIcons';

import QR from './QR';

const DonateInfo = () => {
	return (
		<>
			<div className='flex flex-col gap-y-10 md:flex-row md:gap-x-20 items-center'>
				<article className='flex flex-col justify-between h-full'>
					<p className='text-sm font-normal'>
						Please feel free to donate us any amount you want.
					</p>
					<div className='flex items-center ml-[59.1px] my-20'>
						<img src={polkadotLogoText} alt="polkadot logo" />
					</div>
					<div className='text-normal text-sm max-w-[367px] leading-4'>
						<p>
							Polkadot is a consensus network that enables a new payment system and a completely digital money.
						</p>
						<p>
							From a user perspective, Polkadot is pretty much like cash for the Internet.
						</p>
					</div>
				</article>
				<article>
					<QR/>
				</article>
			</div>
			<Divider className='bg-text_secondary my-8' />
			<div className='flex items-center gap-x-5 gap-y-5 flex-col md:flex-row justify-between'>
				<p className='flex gap-x-2 flex-col xl:flex-row xl:items-center'>
					<span className='text-sm font-normal leading-[15px]'>
                        If you don{'\''}t have a polkadot wallet, don{'\''}t worry, you can create one for free at
					</span>
					<span className='text-primary'>
                        Polkadot.io
						<ExternalLinkIcon className='w-[11px] h-[11px] ml-[6.62px]' />
					</span>
				</p>
				<button className='text-primary px-[10px] py-3 bg-highlight rounded-lg flex items-center border-none outline-none gap-x-[10.83px]'>
					<WalletIcon className='text-base'/>
					<a href='https://polkadot.network/' target={'_blank'} className='font-bold text-sm cursor-pointer' rel="noreferrer">
                        Create Wallet
					</a>
				</button>
			</div>
		</>
	);
};

export default DonateInfo;