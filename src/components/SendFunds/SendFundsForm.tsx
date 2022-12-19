// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';
import { Input, Select, Switch } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

const selectAfter = (
	<Select defaultValue=".com">
		<Option value=".com">Dot</Option>
		<Option value=".jp">Kusama</Option>
	</Select>
);

const SendFundsForm = () => {
	const [disabled, setDisabled] = useState(false);

	const onChange = (checked: boolean) => {
		setDisabled(checked);
	};
	return (
		<div>
			<div className="grid grid-cols-12 gap-4">
				<div className='col-start-1 lg:col-end-9 col-end-13'>
					<div className='h-full rounded-lg px-8 py-5 bg-white shadow-lg mt-3'>
						<div className="my-5">
							<div className='flex justify-between'>
								<p className='text-blue_primary'>Send from account:</p>
								<p className='text-blue_primary'>Transferrable 0.00 DOT</p>
							</div>
							<Input placeholder="5743578" />
						</div>
						<div className="my-5">
							<div className='flex justify-between'>
								<p className='text-blue_primary'>Send to address:</p>
								<p className='text-blue_primary'>Transferrable 0.00 DOT</p>
							</div>
							<Input placeholder="1u59" />
						</div>
						<div>
							<p className='text-blue_primary'>Amount:</p>
							<Input addonAfter={selectAfter} />
						</div>
						<div className="my-5">
							<p className='text-blue_primary'>Existential Deposit::</p>
							<Input suffix="Dot" />
						</div>
						<div className='flex items-center justify-end'>
							<p>Transfer with account keep alive check</p>
							<Switch className='m-3' size="small" checked={disabled} onChange={onChange} />
						</div>
						{/* TODO:Fix warning element */}
						{/* <div className='flex items-center justify-around border rounded-md border-amber-300 m-auto p-3'>
							<WarningOutlined style={{ color: '#645ADF', fontSize: '48px' }} />
							<p className='w-[75%]' style={{ color: '#645ADF' }}>A The transaction, after application of the transfer fees, will drop the available balance below the existential deposit.
								As such the transfer will fail. The account needs more free funds to cover the transaction fees.</p>
						</div> */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SendFundsForm;
