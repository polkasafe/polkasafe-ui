// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import classNames from 'classnames';
import React, { FC, useEffect,useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import polkasafeLogo from 'src/assets/icons/polkasafe.svg';
import AddMultisig from 'src/components/Multisig/AddMultisig';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { AddressBookIcon, AppsIcon, AssetsIcon, HomeIcon, SettingsIcon, TransactionIcon, UserPlusIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

const menuItems = [
	{
		icon: <HomeIcon />,
		key: '/',
		title: 'Home'
	},
	{
		icon: <AssetsIcon />,
		key: '/assets',
		title: 'Assets'
	},
	{
		icon: <TransactionIcon />,
		key: '/transactions',
		title: 'Transactions'
	},
	{
		icon: <AddressBookIcon />,
		key: '/address-book',
		title: 'Address Book'
	},
	{
		icon: <AppsIcon />,
		key: '/apps',
		title: 'Apps'
	},
	{
		icon: <SettingsIcon />,
		key: '/settings',
		title: 'Settings'
	}
];

interface Props {
	className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Menu: FC<Props> = ({ className }) => {
	const { multisigAddresses, activeMultisig, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const [selectedMultisigAddress, setSelectedMultisigAddress] = useState('');
	const { openModal } = useModalContext();
	const location = useLocation();

	useEffect(() => {
		if(activeMultisig){
			setSelectedMultisigAddress(activeMultisig);
		}
		else if(multisigAddresses && multisigAddresses[0]){
			setSelectedMultisigAddress(multisigAddresses[0].address);
			setUserDetailsContextState(prevState => {
				return {
					...prevState,
					activeMultisig: multisigAddresses[0].address
				};
			});
		}
		else{
			setSelectedMultisigAddress('');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisigAddresses]);

	useEffect(() => {
		localStorage.setItem('active_multisig', selectedMultisigAddress);
	}, [selectedMultisigAddress]);

	return (
		<div className={classNames(className, 'bg-bg-main flex flex-col h-full gap-y-11 py-[30px] px-5 overflow-auto [&::-webkit-scrollbar]:hidden')}>
			<section>
				<Link className='text-white flex items-center gap-x-2 overflow-hidden ml-3' to='/'>
					<img src={polkasafeLogo} alt="polkasafe logo" />
				</Link>
			</section>
			<section>
				<h2 className='uppercase text-text_secondary ml-3 text-xs font-primary'>
					Menu
				</h2>
				<ul className='flex flex-col py-2 text-white list-none'>
					{
						menuItems.map((item) => {
							return <li className='w-full' key={item.key}>
								<Link
									className={classNames('flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-base', {
										'bg-highlight text-primary': item.key === location.pathname
									})}
									to={item.key} >
									{item.icon}
									{item.title}
								</Link>
							</li>;
						})
					}
				</ul>
			</section>
			<section>
				<h2 className='uppercase text-text_secondary ml-3 text-xs font-primary flex items-center justify-between'>
					<span>Multisigs</span>
					<span className='bg-highlight text-primary rounded-full flex items-center justify-center h-6 w-6 font-normal text-xs'>{multisigAddresses ? multisigAddresses.length : '0'}</span>
				</h2>
				<div>
					{multisigAddresses &&
					<ul className='flex flex-col gap-y-2 py-2 text-white list-none'>
						{multisigAddresses.map((multisig) => {
							return <li className='w-full' key={multisig.address}>
								<button className={classNames('w-full flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-base', {
									'bg-highlight text-primary': multisig.address === selectedMultisigAddress
								})} onClick={() => {
									setUserDetailsContextState((prevState) => {
										return {
											...prevState,
											activeMultisig: multisig.address
										};
									});
									setSelectedMultisigAddress(multisig.address);
								}}>
									<Identicon
										className='image identicon mx-2'
										value={multisig.address}
										size={30}
										theme={'polkadot'}
									/>
									{multisig.name}
								</button>
							</li>;
						})}
					</ul>}
				</div>
			</section>
			<section className='mt-auto'>
				<button className='text-white bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-2 cursor-pointer'
					onClick={() => openModal('', <AddMultisig isModalPopup = {true} />) }>
					<UserPlusIcon className='text-xl' />
					<span className='font-normal text-sm'>Add Multisig</span>
				</button>
			</section>
		</div>
	);
};

export default styled(Menu)``;
