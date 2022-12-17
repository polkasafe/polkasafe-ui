// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React from 'react';

import TransactionsBtns from './TransactionsBtns';

const TransactionsForm = () => {
	return (
		<Form>
			<div className="flex flex-col gap-y-1">
				<label
					className="text-blue_primary font-bold text-sm"
					htmlFor="account"
				>
					Send from account:
				</label>
				<Form.Item
					name="account"
				>
					<Input
						placeholder=""
						className="rounded-md py-3 w-full px-4 bg-white border-gray-300 tracking-wider"
						id="account"
					/>
				</Form.Item>
			</div>
			<div className="flex flex-col gap-y-1">
				<label
					className="text-blue_primary font-bold text-sm"
					htmlFor="recipient"
				>
					Recipient:
				</label>
				<Form.Item
					name="recipient"
				>
					<Input
						placeholder=""
						className="rounded-md py-3 px-4 bg-white border-gray-300 tracking-wider"
						id="recipient"
					/>
				</Form.Item>
			</div>
			<div className="flex flex-col gap-y-1">
				<label
					className="text-blue_primary font-bold text-sm"
					htmlFor="asset"
				>
					Select an Asset:
				</label>
				<Form.Item
					name="asset"
				>
					<Input
						placeholder=""
						className="rounded-md py-3 px-4 bg-white border-gray-300 tracking-wider"
						id="asset"
					/>
				</Form.Item>
			</div>
			<div className="flex flex-col gap-y-1">
				<label
					className="text-blue_primary font-bold text-sm"
					htmlFor="amount"
				>
					Amount:
				</label>
				<Form.Item
					name="amount"
				>
					<Input
						placeholder=""
						className="rounded-md py-3 px-4 bg-white border-gray-300 tracking-wider"
						id="amount"
					/>
				</Form.Item>
			</div>
			<TransactionsBtns/>
		</Form>
	);
};

export default TransactionsForm;