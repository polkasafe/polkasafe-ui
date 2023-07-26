// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Link } from 'react-router-dom';
import Details from 'src/components/Settings/Details';
import Feedback from 'src/components/Settings/Feedback';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { ExternalLinkIcon } from 'src/ui-components/CustomIcons';

import AppCard from './AppCard';

const currentApps = [
	{ description:'One Stop Shop For All Substrate Addresses And Balances', name: 'Sub ID' },
	{ description:'The most unified platform to discuss and vote on governance proposals, motions and referandas', name: 'Polkassembly' },
	{ description:'Astar Network is a blockchain that aims to become Polkadot\'s "smart contract hub" and serves as a parachain for Polkadot', name: 'Astar' }
];

const AllApps = () => {
	const {
		multisigAddresses,
		activeMultisig,
		address: userAddress
	} = useGlobalUserDetailsContext();

	const multisig = multisigAddresses.find(
		(item) =>
			item.address === activeMultisig || item.proxy === activeMultisig
	);
	return (
		<>
			<div>
				{!multisigAddresses || !multisig ? (
					<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
						<p className='text-white'>
                            Looks Like You Don&apos;t have a Multisig. Please
                            Create One to use our Features.
						</p>
					</section>
				) : (
					<>
						<div className='bg-bg-main p-5 rounded-xl flex flex-col gap-[25px]'>
							<div className='flex items-center mb-5'>
								<button className='rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white text-primary bg-highlight'>
                                    All Apps
								</button>
								<div className='ml-auto flex text-sm text-waiting font-medium gap-2'>
                                    Want to create an interesting app?
									<Link rel='noreferrer' to='/contact-us'>
										<div className='flex gap-1 text-primary'>
                                            Contact Us
											<ExternalLinkIcon />
										</div>
									</Link>
								</div>
							</div>
							<section className='flex flex-col gap-4 md:flex-row'>
								{currentApps.map(app => <AppCard key={app.name} {...app}/>)}
							</section>
						</div>
					</>
				)}
				{userAddress && (
					<div className='mt-[30px] flex gap-x-[30px]'>
						{multisigAddresses && activeMultisig && multisig && (
							<section className='w-full'>
								<Details />
							</section>
						)}
						<section className='w-full max-w-[50%]'>
							<Feedback />
						</section>
					</div>
				)}
			</div>
		</>
	);
};
export default AllApps;
