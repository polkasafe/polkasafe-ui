// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge, Modal } from 'antd';
import classNames from 'classnames';
import React, { FC, useEffect,useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import polkasafeLogo from 'src/assets/icons/polkasafe.svg';
import AddMultisig from 'src/components/Multisig/AddMultisig';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { AddressBookIcon, AppsIcon, AssetsIcon, HomeIcon, OutlineCloseIcon, SettingsIcon, TransactionIcon, UserPlusIcon } from 'src/ui-components/CustomIcons';

interface Props {
	className?: string;
}

const Menu: FC<Props> = ({ className }) => {
	const { multisigAddresses, activeMultisig, multisigSettings, isProxy, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [selectedMultisigAddress, setSelectedMultisigAddress] = useState(localStorage.getItem('active_multisig') || '');
	const location = useLocation();
	const userAddress = localStorage.getItem('address');

	const [openAddMultisig, setOpenAddMultisig] = useState(false);

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
		}
	];

	if(userAddress){
		menuItems.push(
			{
				icon: <SettingsIcon />,
				key: '/settings',
				title: 'Settings'
			}
		);
	}

	useEffect(() => {
		const filteredMutisigs = multisigAddresses?.filter((multisig) => multisig.network === network && !multisigSettings?.[multisig.address]?.deleted) || [];
		const multi = filteredMutisigs?.find((multisig) => multisig.address === activeMultisig || multisig.proxy === activeMultisig);
		if(multi){
			setSelectedMultisigAddress(multi.address);
		}
		else{
			if(filteredMutisigs.length) setSelectedMultisigAddress(filteredMutisigs[0].address );
			else setSelectedMultisigAddress('');
		}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisigAddresses, network]);

	useEffect(() => {
		const active = multisigAddresses.find(item => item.address === selectedMultisigAddress || item.proxy === selectedMultisigAddress);
		localStorage.setItem('active_multisig', active?.proxy && isProxy ? active.proxy : selectedMultisigAddress);
		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				activeMultisig: active?.proxy && isProxy ? active.proxy : selectedMultisigAddress
			};
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisigAddresses, selectedMultisigAddress, isProxy]);

	const AddMultisigModal: FC = () => {
		return (
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenAddMultisig(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				open={openAddMultisig}
				className={`${className} w-auto md:min-w-[500px]`}
			>
				<AddMultisig onCancel={() => setOpenAddMultisig(false)} isModalPopup = {true}  />
			</Modal>
		);
	};

	return (
		<div className={classNames(className, 'bg-bg-main flex flex-col h-full py-[30px] px-5')}>
			<AddMultisigModal/>
			<div className='flex flex-col gap-y-11 mb-3'>
				<section>
					<Link className='text-white flex items-center gap-x-2 ml-3' to='/'>
						<Badge offset={[-15, 45]} count='Beta' color='#1573FE'>
							<img src={polkasafeLogo} alt="polkasafe logo" />
						</Badge>
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
			</div>
			<section className='overflow-auto [&::-webkit-scrollbar]:hidden flex-1 mb-3'>
				<h2 className='uppercase text-text_secondary ml-3 text-xs font-primary flex items-center justify-between'>
					<span>Multisigs</span>
					<span className='bg-highlight text-primary rounded-full flex items-center justify-center h-6 w-6 font-normal text-xs'>{multisigAddresses ? multisigAddresses.filter((multisig) => (multisig.network === network && !multisigSettings?.[multisig.address]?.deleted)).length : '0'}</span>
				</h2>
				<div>
					{multisigAddresses &&
					<ul className='flex flex-col gap-y-2 py-2 text-white list-none'>
						{multisigAddresses.filter((multisig) => (multisig.network === network && !multisigSettings?.[multisig.address]?.deleted)).map((multisig) => {
							return <li className='w-full' key={multisig.address}>
								<button className={classNames('w-full flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-base', {
									'bg-highlight text-primary': multisig.address === selectedMultisigAddress
								})} onClick={() => {
									setUserDetailsContextState((prevState) => {
										return {
											...prevState,
											activeMultisig: multisig.proxy && isProxy ? multisig.proxy : multisig.address
										};
									});
									setSelectedMultisigAddress(multisig.address);
								}}>
									<Identicon
										className='image identicon mx-2'
										value={(isProxy ? multisig?.proxy : multisig.address) || multisig.address}
										size={30}
										theme={'polkadot'}
									/>
									<span className='truncate'>{multisigSettings?.[multisig.address]?.name || multisig.name}</span>
								</button>
							</li>;
						})}
					</ul>}
				</div>
			</section>
			{userAddress &&
				<section className='mt-auto'>
					<button className='text-white bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-2 cursor-pointer'
						onClick={() => setOpenAddMultisig(true)}>
						<UserPlusIcon className='text-xl' />
						<span className='font-normal text-sm'>Add Multisig</span>
					</button>
				</section>
			}
		</div>
	);
};

export default Menu;
