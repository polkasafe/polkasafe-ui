// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React from 'react';
import ContentHeader from 'src/ui-components/ContentHeader';
import ContentWrapper from 'src/ui-components/ContentWrapper';

import TransactionsBtns from './TransactionsBtns';

const RejectTransaction = () => {
	return (
		<div>
			<ContentHeader
				title='Reject Transaction'
				rightElm={
					<span className='font-bold text-base text-blue_primary'>
							Polkadot
					</span>
				}
			/>
			<ContentWrapper>
				<p className='font-bold text-base'>
                    This action  will reject a transaction. A separate transaction will be performed to submit the rejection.
				</p>
				<Form>
					<div className="flex flex-col gap-y-1 mt-5">
						<label
							className="text-blue_primary font-bold text-sm"
							htmlFor="transactionNonce"
						>
                            Transaction nonce:
						</label>
						<Form.Item
							name="transactionNonce"
						>
							<Input
								placeholder="e.g 4"
								className="rounded-md py-3 px-4 bg-white border-gray-300 tracking-wider"
								id="transactionNonce"
							/>
						</Form.Item>
						<Form.Item
							name=""
							className='mt-3'
						>
							<Input
								placeholder=""
								className="rounded-md py-3 px-4 bg-white border-gray-300 tracking-wider"
								id=""
							/>
						</Form.Item>
					</div>
					<TransactionsBtns/>
				</Form>
			</ContentWrapper>
		</div>
	);
};

export default RejectTransaction;