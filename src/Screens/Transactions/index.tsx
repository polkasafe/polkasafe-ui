// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import RejectTransaction from 'src/components/Transactions/RejectTransaction';
import TransactionsCard from 'src/components/Transactions/TransactionsCard';
import ContentHeader from 'src/ui-components/ContentHeader';
import ContentWrapper from 'src/ui-components/ContentWrapper';

const Transactions = () => {
	const [isReject] = useState(true);
	return (
		<div className='grid md:grid-cols-2 gap-5 lg:gap-10'>
			{isReject?
				<RejectTransaction/>
				:<>
					<div>
						<ContentHeader
							title='Send Funds'
							subTitle={
								<h3 className='ml-2 text-sm font-normal'>
							/Step 1 of 2
								</h3>
							}
							rightElm={
								<span className='font-bold text-base text-blue_primary'>
							Polkadot
								</span>
							}
						/>
						<ContentWrapper>
							<TransactionsCard/>
						</ContentWrapper>
					</div>
					<div>
						<ContentHeader
							title='Send Funds'
							subTitle={
								<h3 className='ml-2 text-sm font-normal'>
							/Step 2 of 2
								</h3>
							}
							rightElm={
								<span className='font-bold text-base text-blue_primary'>
							Polkadot
								</span>
							}
						/>
						<ContentWrapper>
							<TransactionsCard/>
						</ContentWrapper>
					</div>
				</>}
		</div>
	);
};

export default Transactions;