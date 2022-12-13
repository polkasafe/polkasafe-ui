// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { AddressBookIcon, AppsIcon, AssetsIcon, HomeIcon, KeyIcon, MenuIcon, MultisigLockIcon, PolkasafeLogoIcon, PolkasafeTextIcon, SettingsIcon, TransactionIcon, UserPlusIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

const menuItems = [
	{
		icon: <HomeIcon/>,
		key: '/',
		title: 'Home'
	},
	{
		icon: <AssetsIcon/>,
		key: '/assets',
		title: 'Assets'
	},
	{
		icon: <TransactionIcon/>,
		key: '/transactions',
		title: 'Transactions'
	},
	{
		icon: <AddressBookIcon/>,
		key: '/address-book',
		title: 'Address Book'
	},
	{
		icon: <AppsIcon/>,
		key: '/apps',
		title: 'Apps'
	},
	{
		icon: <SettingsIcon/>,
		key: '/settings',
		title: 'Settings'
	}
];

interface Props {
    className?: string;
}

const Menu: FC<Props> = ({ className }) => {
	const addresses = [
		{
			address: 'John Doe'
		},
		{
			address: 'John Doe'
		},
		{
			address: 'John Doe'
		}
	];
	return (
		<div className={className}>
			<section>
				<Link to='/'>
					<p className='flex items-center gap-x-2 overflow-hidden h-[75px] justify-center'>
						<PolkasafeLogoIcon className='text-[42px]'/>
						<PolkasafeTextIcon className='text-[100px]'/>
					</p>
				</Link>
			</section>
			<section className='mt-3'>
				<h2 className='px-6 flex items-center gap-x-2'>
					<MenuIcon className='text-lg' />
					<span className='font-bold text-lg'>Menu</span>
				</h2>
				<ul className='flex flex-col py-2'>
					{
						menuItems.map((item) => {
							return <li className='w-full pr-5' key={item.key}>
								<Link className='flex items-center gap-x-3 menu-item-active' to={item.key} >
									<p className='w-[5px] h-9'></p>
									<p className='px-3 py-2.5 font-bold text-base text-blue_secondary flex items-center gap-x-2 flex-1 rounded-md'>
										{item.icon}
										{item.title}
									</p>
								</Link>
							</li>;
						})
					}
				</ul>
			</section>
			<section>
				<h2 className='px-6 flex items-center gap-x-2'>
					<MultisigLockIcon className='text-lg' />
					<span className='font-bold text-lg'>Your Multisigs</span>
				</h2>
				<div>
					<ul className='flex flex-col py-2'>
						{addresses.map(({ address }) => {
							return <li className='w-full pr-5' key={address}>
								<Link className='flex items-center gap-x-3 menu-item-active' to={address} >
									<p className='w-[5px] h-8'></p>
									<p className='px-3 py-1.5 font-normal text-base text-blue_secondary flex items-center gap-x-2 flex-1 rounded-md'>
										<KeyIcon />
										{address}
									</p>
								</Link>
							</li>;
						})}
					</ul>
					<div className='px-5 py-2'>
						<article className='flex flex-col items-center gap-y-4 pt-8 pb-6 rounded-md bg-gradient-primary shadow-siderBox'>
							<UserPlusIcon className='text-5xl' />
							<p className='text-white max-w-[100px] text-center font-bold'>
                                Add New Multisig
							</p>
						</article>
					</div>
				</div>
			</section>
		</div>
	);
};

export default styled(Menu)`
    background-color: white;
    .menu-item-active:focus {
        p:first-child {
            border-top-right-radius: 1rem;
            border-bottom-right-radius: 1rem;
            background-color: #645ADF !important;
        }
        p:last-child {
            background-color: #FBFAFC !important;
            box-shadow: -2px 3px 6px #CAC9F9;
            color: #645ADF !important;
            span {
                color: #645ADF !important;
            }
        }
    }
`;