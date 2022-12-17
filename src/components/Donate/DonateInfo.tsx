// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React from 'react';
import polkadotLogoText from 'src/assets/icons/polkadot-logo-text.svg';
import { WalletIcon } from 'src/ui-components/CustomIcons';

import QR from './QR';

const DonateInfo = () => {
	return (
		<>
			<div className='grid grid-cols-1 gap-y-10 lg:grid-cols-5 lg:gap-x-10 items-center mb-10'>
				<article className='col-span-1 lg:col-span-3 '>
					<div>
						<h3 className='text-lg lg:text-xl font-bold tracking-wide'>
                        Scan the QR with your wallet application
						</h3>
						<p className='mt-3'>
                        Please feel free to donate us any amount you want.
						</p>
					</div>
					<div>
						<img src={polkadotLogoText} alt="polkadot logo" />
					</div>
					<div className='max-w-lg'>
						<p>
                        Polkadot is a consensus network that enables a new payment system and a completely digital money.
						</p>
						<p>
                        From a user perspective, Polkadot is pretty much like cash for the Internet.
						</p>
					</div>
				</article>
				<article className='col-span-1 lg:col-span-2'>
					<QR/>
				</article>
			</div>
			<Divider/>
			<div className='flex items-center gap-x-5 gap-y-5 mt-10 flex-col md:flex-row'>
				<p className='flex gap-x-2 flex-col xl:flex-row xl:items-center'>
					<span>
                        If you don{'\''}t have a polkadot wallet, don{'\''}t worry, you can create one for free at
					</span>
					<span className='text-blue_primary font-bold text-sm italic'>
                        Polkadot.io
					</span>
				</p>
				<p className='bg-gray_primary1 text-blue_primary shadow-small px-2 py-1.5 rounded-lg flex items-center gap-x-2'>
					<WalletIcon className='text-base'/>
					<span className='font-bold text-sm'>
                        Create Wallet
					</span>
				</p>
			</div>
		</>
	);
};

export default DonateInfo;