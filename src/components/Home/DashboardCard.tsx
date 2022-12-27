// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PlusCircleOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import brainIcon from 'src/assets/icons/brain-icon.svg';
import chainIcon from 'src/assets/icons/chain-icon.svg';
import dotIcon from 'src/assets/icons/image 39.svg';
import psIcon from 'src/assets/icons/ps-icon.svg';
import subscanIcon from 'src/assets/icons/subscan.svg';
// import multisig from 'src/assets/icons/multisig.svg';
import userAvatarIcon from 'src/assets/icons/user-avatar.svg';
import { CopyIcon, QRIcon, WalletIcon } from 'src/ui-components/CustomIcons';
// import statusbar from 'src/assets/icons/statusbar.svg';
// import transfer from 'src/assets/icons/transfer.svg';
// import wallet from 'src/assets/icons/wallet.svg';
import PrimaryButton from 'src/ui-components/PrimaryButton';

const DashboardCard = ({ className }: { className?: string }) => {
	return (
		<div>
			<h2 className="text-lg font-bold text-white">Overview</h2>
			{/* TODO: Empty state */}
			{/* <div className={`${className} flex flex-row justify-between items-center rounded-lg px-8 py-5 bg-white shadow-lg h-72 mt-3`}>
				<div><img className='w-[100px]' src={wallet} alt="wallet" /><p>Connect Wallet</p></div>
				<img src={statusbar} alt="statusbar" />
				<div><img className='w-[100px]' src={multisig} alt="multisig" /><p>Add Multisig</p></div>
				<img src={statusbar} alt="statusbar" />
				<div><img className='w-[100px]' src={transfer} alt="transfer" /><p>Make a Transaction</p></div>
			</div> */}
			<div className={`${className} bg-bg-main flex flex-col justify-between rounded-lg p-5 shadow-lg h-72 mt-3`}>
				<div className="flex justify-between flex-wrap truncate">
					<div className='flex gap-x-4 items-center mb-3 flex-wrap'>
						<Avatar className='border-8 border-secondary' size={74} icon={<img className='cursor-pointer' src={userAvatarIcon} alt="icon" />} />
						<div>
							{/* TODO: Use dynamic values */}
							<div className='text-lg font-bold text-white'>John Doe</div>
							<div className="flex">
								<div className='text-md font-normal text-text_secondary truncate'>3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy</div>
								<CopyIcon className='cursor-pointer ml-2 w-5 text-primary'/>
								<QRIcon className='cursor-pointer'/>
							</div>
						</div>
					</div>
					<div className='text-right'>
						<div className="flex gap-x-4 my-3 overflow-auto items-center">
							<img className='w-5 cursor-pointer' src={psIcon} alt="icon" />
							<img className='w-5 cursor-pointer' src={brainIcon} alt="icon" />
							<img className='w-5 cursor-pointer' src={dotIcon} alt="icon" />
							<img className='w-5 cursor-pointer' src={chainIcon} alt="icon" />
							<img className='w-5 cursor-pointer' src={subscanIcon} alt="icon" />
						</div>
					</div>
				</div>
				<div className="flex flex-wrap">
					<div className='m-2'>
						<div className='text-white'>Tokens</div>
						<div className='font-bold text-xl text-primary'>2</div>
					</div>
					<div className='m-2'>
						<div className='text-white'>USD Amount</div>
						<div className='font-bold text-xl text-primary'>1000</div>
					</div>
					<div className='m-2'>
						<div className='text-white'>NFTs</div>
						<div className='font-bold text-xl text-primary'>3</div>
					</div>
				</div>
				<div className="flex justify-around w-full mt-5">
					<Link to='/send-funds' className='w-[45%] group'>
						<PrimaryButton className='w-[100%] flex items-center justify-center py-5 bg-primary text-white text-sm' onClick={() => { }}><PlusCircleOutlined /> New Transaction</PrimaryButton>
					</Link>
					<Link to='/send-funds' className='w-[45%] group'>
						<PrimaryButton className='w-[100%] flex items-center justify-center py-5 bg-highlight text-primary text-sm' onClick={() => { }}><WalletIcon />Add Asset</PrimaryButton>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default DashboardCard;

