// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import DashboardCard from 'src/components/Home/DashboardCard';

const Home = () => {
	return (
		<div>
			<div className="grid grid-cols-12 gap-4">
				<div className='col-start-1 col-end-10'>
					<h2 className="text-3xl font-bold">
						Dashboard
					</h2>

					<DashboardCard className='mt-8' />
				</div>

				<div>Col 2</div>
			</div>
		</div>
	);
};

export default Home;