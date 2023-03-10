// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { message } from 'antd';
import classNames from 'classnames';
import React, { useRef,useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { CircleArrowDownIcon, CopyIcon, WarningRoundedIcon } from 'src/ui-components/CustomIcons';
import getNetwork from 'src/utils/getNetwork';
import logout from 'src/utils/logout';
import shortenAddress from 'src/utils/shortenAddress';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IAddress {
    value: string;
    imgSrc: string;
}
const AddressDropdown = () => {
	const { address, addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const navigate = useNavigate();
	const network = getNetwork();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);
	const handleCopy = () => {
		// navigator.clipboard.writeText(`${address}`);
		message.success('Copied!');
	};

	const handleDisconnect = () => {
		logout();
		setUserDetailsContextState(prevState => {
			return {
				...prevState,
				activeMultisig: localStorage.getItem('active_multisig') || '',
				address: '',
				addressBook: [],
				multisigAddresses: []
			};
		});
		toggleVisibility(false);
		return navigate('/', { replace: true });
	};

	if(!address){
		return (
			<Link to={'/'} className='flex items-center justify-center gap-x-3 outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-sm'>
				<WarningRoundedIcon className='text-base text-primary'/>
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
			<button onClick={() => isVisible ? toggleVisibility(false) : toggleVisibility(true)} className='flex items-center justify-center gap-x-3 outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-sm'>
				<p className='flex items-center gap-x-3'>
					{!address?<WarningRoundedIcon className='text-base text-primary'/>
						:<span className='bg-primary flex items-center justify-center rounded-full w-4 h-4'>
							<Identicon size={20} value={address} theme='polkadot' />
						</span>}
					<span className='hidden md:inline-flex w-24 overflow-hidden truncate'>
						{address? shortenAddress(address) :'Not Connected'}
					</span>
				</p>
				<CircleArrowDownIcon className={classNames('hidden md:inline-flex text-base', {
					'text-primary': address,
					'text-white': !address
				})} />
			</button>

			<div
				className={classNames(
					'absolute top-16 right-0 rounded-xl border border-primary bg-bg-main py-[13.5px] px-3 z-40 min-w-[274px]',
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
				<div className='flex items-center justify-center flex-col gap-y-9'>
					<div className='flex items-center justify-center flex-col gap-y-[10px]'>
						<Identicon
							className='border-2 rounded-full bg-transparent border-primary p-1'
							value={address}
							size={70}
							theme='polkadot'
						/>
						<p className='text-white font-normal text-sm'>
							{ addressBook.find(item => item.address === address)?.name }
						</p>
						<p className='bg-bg-secondary font-normal text-sm px-2 py-[10px] rounded-lg flex items-center gap-x-3'>
							<span className='text-text_secondary'>{address}</span>
							<button onClick={handleCopy}><CopyIcon className='text-base text-primary cursor-pointer'/></button>
						</p>
					</div>
					<div className='w-full'>
						<p className='border-t border-text_secondary flex items-center text-normal text-sm justify-between w-full p-3'>
							<span className='text-text_secondary'>Wallet</span>
							<span className='text-white'>Polkadot.js</span>
						</p>
						<p className='border-t border-b border-text_secondary flex items-center text-normal text-sm justify-between w-full p-3'>
							<span className='text-text_secondary'>Network</span>
							<span className='text-white'>{ network }</span>
						</p>
					</div>
					<button onClick={handleDisconnect} className='rounded-lg bg-failure bg-opacity-10 w-full flex items-center justify-center font-normal text-sm p-3 text-failure'>
						Disconnect
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddressDropdown;