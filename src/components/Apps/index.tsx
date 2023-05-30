// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Details from 'src/components/Settings/Details';
import Feedback from 'src/components/Settings/Feedback';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';

import AppCard from './AppCard';

const AllApps = () => {
	const { multisigAddresses, activeMultisig, address: userAddress } = useGlobalUserDetailsContext();

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	return (
		<>
			<div>
				{!multisigAddresses || !multisig ?
					<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
						<p className='text-white'>Looks Like You Don&apos;t have a Multisig. Please Create One to use our Features.</p>
					</section> : <>
						<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>

							<section className='flex items-center mt-6 justify-between flex-col gap-5 md:flex-row mb-6'>
								<AppCard/>
							</section>
						</div>
					</>}
				{userAddress &&
		<div className='mt-[30px] flex gap-x-[30px]'>
			{multisigAddresses && activeMultisig && multisig &&
			<section className='w-full'>
				<Details />
			</section>}
			<section className='w-full max-w-[50%]'>
				<Feedback />
			</section>
		</div>}
			</div>
		</>
	);
};
export default AllApps;