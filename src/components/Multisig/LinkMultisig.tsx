// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React from 'react';
import copyIcon from 'src/assets/icons/copy.svg';
import dotIcon from 'src/assets/icons/polkadot.svg';
import sendIcon from 'src/assets/icons/send.svg';

const LinkMultisig = () => {
	return (
		<div className='flex flex-col justify-center h-92 bg-white rounded-lg shadow-lg p-5'>
			<h1 className='text-blue_primary text-bold'>WALLET</h1>
			<hr />
			<img className='h-24 m-5 ' src={dotIcon} alt="polkadot" />
			<div className='flex justify-around items-center bg-purple_app_bg rounded-lg shadow-md px-5 py-2 mb-5'>
				<p>dot: 3J98t1..WNLy</p>
				<img className='cursor-pointer' src={copyIcon} alt="copy" />
				<img className='cursor-pointer' src={sendIcon} alt="send" />
			</div>
			<hr />
			<div className='flex flex-row justify-between my-3'>
				<p className='text-blue_primary font-bold mr-3'>WALLET</p>
				<p>Polkadot</p>
			</div>
			<hr />
			<div className='flex flex-row justify-between my-3'>
				<p className='text-blue_primary font-bold mr-3'>CONNECTED NETWORK</p>
				<p className='text-bold'>Polkadot.js</p>
			</div>
			<hr />
			<Button className='mt-5 w-1/2 font-bold self-center' style={{ background: '#C82929', color: '#fff' }}>Disconnect</Button>
		</div>
	);
};

export default LinkMultisig;