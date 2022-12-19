// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import PrimaryButton from 'src/ui-components/PrimaryButton';

enum EFilterType {
	INCOMING = 'Incoming',
	OUTGOING = 'Outgoing'
}

const Filter = () => {
	const [filterType, setFilterType] = useState(EFilterType.INCOMING);

	const clickOnFilterType = (selectedFilterType: EFilterType) => {
		setFilterType(selectedFilterType);
	};

	return (
		<section className='grid grid-cols-7'>
			<article className='col-span-7 md:col-span-2'>
				<p className='text-blue_secondary mt-3 md:my-3'>Transaction Type</p>
				<div className='flex items-center md:flex-col md:items-start gap-3'>
					<button
						className={classNames('text-lg font-bold', {
							'text-blue_primary': filterType === EFilterType.INCOMING,
							'text-blue_secondary': filterType !== EFilterType.INCOMING
						})}
						onClick={() => clickOnFilterType(EFilterType.INCOMING)}
					>
						{EFilterType.INCOMING}
					</button>
					<button
						className={classNames('text-lg font-bold', {
							'text-blue_primary': filterType === EFilterType.OUTGOING,
							'text-blue_secondary': filterType !== EFilterType.OUTGOING
						})}
						onClick={() => clickOnFilterType(EFilterType.OUTGOING)}
					>
						{EFilterType.OUTGOING}
					</button>
				</div>
			</article>
			<article className='col-span-7 md:col-span-5'>
				<p className='text-blue_secondary mt-5 md:my-3'>Parameters</p>
				<Form className='flex flex-col gap-y-3'>
					<div className='grid grid-cols-2 gap-x-10'>
						<div className="col-span-2 md:col-span-1 flex flex-col gap-y-1">
							<label
								className="text-blue_primary font-bold text-sm"
								htmlFor="from"
							>
                                From:
							</label>
							<Form.Item
								name="from"
							>
								<Input
									placeholder=""
									className="rounded-md py-3 w-full px-4 bg-white border-gray-300 tracking-wider"
									id="from"
									type='date'
								/>
							</Form.Item>
						</div>
						<div className="col-span-2 md:col-span-1 flex flex-col gap-y-1">
							<label
								className="text-blue_primary font-bold text-sm"
								htmlFor="to"
							>
                                To:
							</label>
							<Form.Item
								name="to"
							>
								<Input
									placeholder=""
									className="rounded-md py-3 w-full px-4 bg-white border-gray-300 tracking-wider"
									id="to"
									type='date'
								/>
							</Form.Item>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-x-10'>
						<div className="col-span-2 md:col-span-1">
							<Form.Item
								name="amount"
							>
								<Input
									placeholder="Amount"
									className="rounded-md py-3 w-full px-4 bg-white border-gray-300 tracking-wider"
									id="amount"
								/>
							</Form.Item>
						</div>
						<div className="col-span-2 md:col-span-1">
							<Form.Item
								name="tokenAddress"
							>
								<Input
									placeholder="Token Address"
									className="rounded-md py-3 w-full px-4 bg-white border-gray-300 tracking-wider"
									id="tokenAddress"
								/>
							</Form.Item>
						</div>
					</div>
					<div className='flex items-center gap-x-5'>
						<PrimaryButton
							size='middle'
							className='bg-green_primary px-7'
						>
                            Apply
						</PrimaryButton>
						<PrimaryButton
							size='middle'
							className='bg-gray-400 px-7'
						>
                            Clear
						</PrimaryButton>
					</div>
				</Form>
			</article>
		</section>
	);
};

export default Filter;