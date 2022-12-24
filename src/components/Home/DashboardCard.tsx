// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import copyIcon from 'src/assets/icons/copy.svg';
import idIcon from 'src/assets/icons/image 35.svg';
import sIcon from 'src/assets/icons/image 36.svg';
import bIcon from 'src/assets/icons/image 37.svg';
import brainIcon from 'src/assets/icons/image 38.svg';
import dotIcon from 'src/assets/icons/image 39.svg';
// import multisig from 'src/assets/icons/multisig.svg';
import qrIcon from 'src/assets/icons/qrcode.svg';
// import statusbar from 'src/assets/icons/statusbar.svg';
// import transfer from 'src/assets/icons/transfer.svg';
// import wallet from 'src/assets/icons/wallet.svg';
import PrimaryButton from 'src/ui-components/PrimaryButton';

const DashboardCard = ({ className }: { className?: string }) => {
	return (
		<div>
			<h2 className="text-lg font-bold">Dashboard</h2>
			{/* TODO: Empty state */}
			{/* <div className={`${className} flex flex-row justify-between items-center rounded-lg px-8 py-5 bg-white shadow-lg h-72 mt-3`}>
				<div><img className='w-[100px]' src={wallet} alt="wallet" /><p>Connect Wallet</p></div>
				<img src={statusbar} alt="statusbar" />
				<div><img className='w-[100px]' src={multisig} alt="multisig" /><p>Add Multisig</p></div>
				<img src={statusbar} alt="statusbar" />
				<div><img className='w-[100px]' src={transfer} alt="transfer" /><p>Make a Transaction</p></div>
			</div> */}
			<div className={`${className} flex flex-col justify-between rounded-lg p-5 bg-white shadow-lg h-fit mt-3`}>
				<div className="flex justify-between flex-wrap truncate">
					<div className='flex gap-x-4 items-center mb-3 flex-wrap'>
						<Avatar className='border-8 border-secondary' size={74} icon={<UserOutlined />} />
						<div>
							{/* TODO: Use dynamic values */}
							<div className='text-lg font-bold'>John Doe</div>
							<div className='text-md font-normal truncate'>3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy</div>
						</div>
					</div>
					<div className='text-right'>
						<Link to='/send-funds'>
							<PrimaryButton className='text-md my-2' onClick={() => { }}>&#43; New Transaction</PrimaryButton>
						</Link>
						{/* TODO: use getNetworkName() */}
						<div className='text-[#A3A2FF] text-md font-normal mt-3'>Polkadot</div>
					</div>
				</div>
				<div className="flex flex-wrap">
					<div className='m-2'>
						<div className='text-[#A3A1FF]'>Tokens</div>
						<div className='font-bold text-xl'>2</div>
					</div>
					<div className='m-2'>
						<div className='text-[#A3A1FF]'>USD Amount</div>
						<div className='font-bold text-xl'>1000</div>
					</div>
					<div className='m-2'>
						<div className='text-[#A3A1FF]'>Multi Config</div>
						<div className='font-bold text-xl'>4/4</div>
					</div>
				</div>
				<div className="flex justify-between flex-wrap">
					<div className="flex gap-x-4 my-3 overflow-auto items-center">
						<img src={copyIcon} alt="icon" />
						<img src={qrIcon} alt="icon" />
						<img src={bIcon} alt="icon" />
						<img src={idIcon} alt="icon" />
						<img src={dotIcon} alt="icon" />
						<img src={brainIcon} alt="icon" />
						<img src={sIcon} alt="icon" />
					</div>
					<div className="text-right">
						<PrimaryButton onClick={() => { }}>Details</PrimaryButton>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardCard;

