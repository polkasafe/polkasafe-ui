// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Button } from 'antd';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { Wallet } from 'src/types';
import Balance from 'src/ui-components/Balance';
import { CircleArrowDownIcon, CopyIcon, WarningRoundedIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import shortenAddress from 'src/utils/shortenAddress';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IAddress {
	value: string;
	imgSrc: string;
}
const AddressDropdown = () => {
	const { address, addressBook, loggedInWallet, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { logout } = useGlobalWeb3Context();
	const navigate = useNavigate();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const handleDisconnect = async () => {
		localStorage.removeItem('signature');
		localStorage.removeItem('address');

		await logout();

		setUserDetailsContextState((prevState: any) => {
			return {
				...prevState,
				activeMultisig: '',
				address: '',
				addressBook: [],
				loggedInWallet: Wallet.WEB3AUTH,
				multisigAddresses: []
			};
		});
		toggleVisibility(false);
		return navigate('/', { replace: true });
	};

	if (!address) {
		return (
			<Link to={'/'} className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs'>
				<WarningRoundedIcon className='text-sm text-primary' />
				Not Connected
			</Link>
		);
	}

	return (
		<div
			className='relative'
			onBlur={() => {
				if (!isMouseEnter.current) {
					(isVisible ? toggleVisibility(false) : null);
				}
			}}
		>
			<button onClick={() => isVisible ? toggleVisibility(false) : toggleVisibility(true)} className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs'>
				<p className='flex items-center gap-x-2'>
					{<span className='bg-primary flex items-center justify-center rounded-full'>
						<Identicon size={15} value={address} theme='polkadot' />
					</span>}
					<span title={address} className='hidden md:inline-flex w-20 overflow-hidden truncate'>
						{addressBook?.find((item: any) => item.address === address)?.name || DEFAULT_ADDRESS_NAME}
					</span>
				</p>
				<CircleArrowDownIcon className={classNames('hidden md:inline-flex text-sm', {
					'text-primary': address,
					'text-white': !address
				})} />
			</button>

			<div
				className={classNames(
					'absolute scale-90 top-13 left-[-90px] rounded-xl border border-primary bg-bg-main py-[13.5px] px-3 z-40 min-w-[300px]',
					{
						'opacity-0 h-0 pointer-events-none hidden': !isVisible,
						'opacity-100 h-auto': isVisible
					}
				)}
				onMouseEnter={() => {
					isMouseEnter.current = true;
				}}
				onMouseLeave={() => {
					isMouseEnter.current = false;
				}}
			>
				<div className='flex items-center justify-center flex-col gap-y-5'>
					<div className='flex items-center justify-center flex-col gap-y-2'>
						<Identicon
							className='border-2 rounded-full bg-transparent border-primary p-1'
							value={address}
							size={50}
							theme='polkadot'
						/>
						<p className='text-white font-normal text-sm'>
							{addressBook?.find((item: any) => item.address === address)?.name}
						</p>
						<p className='bg-bg-secondary mb-1 w-[300px] font-normal gap-x-2 text-sm p-2 rounded-lg flex items-center justify-center'>
							<span className='text-text_secondary'>{shortenAddress(address)}</span>
							<button onClick={() => copyText(address)}><CopyIcon className='text-base text-primary cursor-pointer' /></button>
						</p>
						<Balance className='ml-0' address={address} />
					</div>
					<div className='w-full'>
						<p className='border-t border-text_secondary flex items-center text-normal text-sm justify-between w-full p-2'>
							<span className='text-text_secondary'>Wallet</span>
							<span className='text-white capitalize'>{loggedInWallet}</span>
						</p>
						<p className='border-t border-b border-text_secondary flex items-center text-normal text-sm justify-between w-full p-2'>
							<span className='text-text_secondary'>Network</span>
							<span className='text-white capitalize'>{network}</span>
						</p>
					</div>
					<Button onClick={handleDisconnect} className='rounded-lg outline-none border-none bg-failure bg-opacity-10 w-full flex items-center justify-center font-normal text-sm p-2 text-failure'>
						Disconnect
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddressDropdown;