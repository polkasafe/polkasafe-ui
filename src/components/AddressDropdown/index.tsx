// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserOutlined } from '@ant-design/icons';
import { Avatar, message } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userAvatarIcon from 'src/assets/icons/user-avatar.svg';
import { initialUserDetailsContext, useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { CircleArrowDownIcon, CopyIcon, WarningRoundedIcon } from 'src/ui-components/CustomIcons';
import logout from 'src/utils/logout';

interface IAddress {
    value: string;
    imgSrc: string;
}

const AddressDropdown = () => {
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const navigate = useNavigate();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [selectedAddress, setSelectedAddress] = useState<IAddress>({
		imgSrc: '',
		value: '3J98t...hWNLy'
	});
	const [isVisible, toggleVisibility] = useState(false);
	const handleCopy = () => {
		// navigator.clipboard.writeText(`${address}`);
		message.success('Copied!');
	};

	const handleDisconnect = () => {
		logout();
		setUserDetailsContextState(initialUserDetailsContext);
		toggleVisibility(false);
		return navigate('/', { replace: true });
	};

	return (
		<div
			className='relative'
		>
			<button onClick={() => isVisible ? toggleVisibility(false) : toggleVisibility(true)} className='flex items-center justify-center gap-x-3 outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-sm'>
				<p className='flex items-center gap-x-3'>
					{!selectedAddress?<WarningRoundedIcon className='text-base text-primary'/>
						:<span className='bg-primary flex items-center justify-center rounded-full w-4 h-4'>
							<UserOutlined className='text-white text-[10px]' />
						</span>}
					<span className='hidden md:inline-flex w-24 overflow-hidden truncate'>
						{selectedAddress? selectedAddress.value:'Not Connected'}
					</span>
				</p>
				<CircleArrowDownIcon className={classNames('hidden md:inline-flex text-base', {
					'text-primary': selectedAddress,
					'text-white': !selectedAddress
				})} />
			</button>

			<div
				className={classNames(
					'absolute top-16 right-0 rounded-xl border border-primary bg-bg-main py-[13.5px] px-3 z-10 min-w-[274px]',
					{
						'opacity-0 h-0 pointer-events-none hidden': !isVisible,
						'opacity-100 h-auto': isVisible
					}
				)}
			>
				{selectedAddress? <div className='flex items-center justify-center flex-col gap-y-9'>
					<div className='flex items-center justify-center flex-col gap-y-[10px]'>
						<Avatar className='border-2 bg-transparent border-primary p-1' size={74} icon={<img className='cursor-pointer' src={userAvatarIcon} alt="icon" />} />
						<p className='text-white font-normal text-sm'>
                        Jaski
						</p>
						<p className='bg-bg-secondary font-normal text-sm px-2 py-[10px] rounded-lg flex items-center gap-x-3'>
							<span className='text-text_secondary'>{selectedAddress.value}</span>
							<button onClick={handleCopy}><CopyIcon className='text-base text-primary cursor-pointer'/></button>
						</p>
					</div>
					<div className='w-full'>
						<p className='border-t border-text_secondary flex items-center text-normal text-sm justify-between w-full p-3'>
							<span className='text-text_secondary'>Wallet</span>
							<span className='text-white'>Polkadot</span>
						</p>
						<p className='border-t border-b border-text_secondary flex items-center text-normal text-sm justify-between w-full p-3'>
							<span className='text-text_secondary'>Network</span>
							<span className='text-white'>Polkadot.js</span>
						</p>
					</div>
					<button onClick={handleDisconnect} className='rounded-lg bg-failure bg-opacity-10 w-full flex items-center justify-center font-normal text-sm p-3 text-failure'>
						Disconnect
					</button>
				</div>: null}
			</div>
		</div>
	);
};

export default AddressDropdown;