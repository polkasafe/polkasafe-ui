// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import AddressCard from 'src/components/Home/AddressCard';
import DashboardCard from 'src/components/Home/DashboardCard';
import EmailBadge from 'src/components/Home/EmailBadge';
import TxnCard from 'src/components/Home/TxnCard';

import UserFlow from '../UserFlow';

const Home = () => {
	// TODO: Get multisigs from firebase
	const multisigs = [];
	return (
		<>
			{multisigs.length>0? <div>
				<EmailBadge/>
				<div className="grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1">
					<div className='col-start-1 col-end-13 xl:col-end-10'>
						<DashboardCard className='mt-3' />
					</div>
					<div className='col-start-1 col-end-13 xl:col-start-10'>
						<AddressCard className='mt-3' />
					</div>
				</div>
				<div className="grid grid-cols-12 gap-4 my-3 grid-row-2 lg:grid-row-1">
					<div className='col-start-1 col-end-13 lg:col-end-13'>
						<TxnCard />
					</div>
				</div>
			</div>:<UserFlow/>}
		</>
	);
};

export default Home;