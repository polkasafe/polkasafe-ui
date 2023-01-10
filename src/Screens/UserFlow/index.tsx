// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React, { useState } from 'react';
import AddMultisig from 'src/components/Multisig/AddMultisig';
import Loader from 'src/components/UserFlow/Loader';
import WalletDropdown from 'src/components/UserFlow/WalletDropdown';
import { WalletIcon } from 'src/ui-components/CustomIcons';

const UserFlow = () => {
	const [show, setShow] = useState(true);

	const handleClick = () => {
		setShow(false);
	};
	return (
		<div className='min-h-[70vh] bg-bg-main flex flex-col rounded-lg'>
			{show?<div className='flex items-top pt-5 justify-evenly'>
				<Loader className='bg-primary' />
				<Loader className='bg-highlight' />
			</div>:
				<div className='flex items-top pt-5 justify-evenly'>
					<Loader className='bg-primary' />
					<Loader className='bg-primary' />
				</div>}
			{show ? <div className="h-[70vh]">
				<div className="flex flex-col items-center justify-center h-[100%] m-auto">
					<h1 className='text-xl text-white font-bold'>Get Started</h1>
					<p className='text-white m-1'>Connect your wallet</p>
					<p className='text-text_secondary m-3 mb-5'>Your first step towards creating a safe & secure MultiSig:</p>
					<WalletDropdown/>
					<Button className='flex items-center justify-center text-white border-none mt-5 py-4 w-[350px] bg-primary'
						onClick={handleClick}><WalletIcon className='text-white' />Connect Wallet</Button>
				</div>
			</div>:
				<div className="flex items-center justify-center h-full flex-1">
					<AddMultisig/>
				</div>}
		</div>
	);
};

export default UserFlow;