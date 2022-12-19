// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowUpOutlined, RightOutlined } from '@ant-design/icons';
import React from 'react';
import polkassembly from 'src/assets/icons/polkassembly.svg';
import transfer from 'src/assets/icons/transfer.svg';

const TxnCard = () => {
	return (
		<div>
			<div className="grid grid-cols-12 gap-4 my-3 grid-row-2 lg:grid-row-1">
				<div className='col-start-1 col-end-13 md:col-end-7'>
					<div className="flex justify-between flex-row w-full">
						<h2 className="text-lg font-bold">Transaction History</h2>
						<RightOutlined />
					</div>
					<div className='bg-white p-3 shadow-lg rounded-lg mt-2 h-60 overflow-auto'>
						<h1 className='text-base text-[#645ADF] font-bold'>AUG 10, 2022</h1>
						<div className='flex flex-row justify-between p-3'>
							<p>3</p>
							<div className="flex justify-center items-center"><ArrowUpOutlined style={{ color: '#C82929' }} className='mx-2' /><p>Sent</p></div>
							<div className='flex'><img className='w-5 mx-3' src={polkassembly} alt="polkassembly" /><p>-10,000 USDC</p></div>
							<p>12:43 PM</p>
						</div>
						<hr className="divide-black" />
						<div className='flex flex-row justify-between p-3'>
							<p>3</p>
							<div className="flex justify-center items-center"><ArrowUpOutlined style={{ color: '#C82929' }} className='mx-2' /><p>Sent</p></div>
							<div className='flex'><img className='w-5 mx-3' src={polkassembly} alt='polkassembly' /><p>-10,000 USDC</p></div>
							<p>12:43 PM</p>
						</div>
						<hr className="divide-black" />
						<div className='flex flex-row justify-between p-3'>
							<p>3</p>
							<div className="flex justify-center items-center"><ArrowUpOutlined style={{ color: '#C82929' }} className='mx-2' /><p>Sent</p></div>
							<div className='flex'><img className='w-5 mx-3' src={polkassembly} alt='polkassembly' /><p>-10,000 USDC</p></div>
							<p>12:43 PM</p>
						</div>
						<hr className="divide-black" />
						<div className='flex flex-row justify-between p-3'>
							<p>3</p>
							<div className="flex justify-center items-center"><ArrowUpOutlined style={{ color: '#C82929' }} className='mx-2' /><p>Sent</p></div>
							<div className='flex'><img className='w-5 mx-3' src={polkassembly} alt='polkassembly' /><p>-10,000 USDC</p></div>
							<p>12:43 PM</p>
						</div>
						<hr className="divide-black" />
					</div>
					{/*TODO: Empty state */}
					{/* <div className="bg-white p-3 shadow-lg rounded-lg mt-2 h-60 flex flex-col justify-center items-center">
						<img className='w-[100px]' src={transfer} alt="queue" />
						<p>No transactions have been made yet</p>
					</div> */}
				</div>
				<div className='md:col-start-7 col-start-1 col-end-13 '>
					<div className="flex justify-between flex-row w-full">
						<h2 className="text-lg font-bold">Transaction Queue</h2>
						<RightOutlined />
					</div>
					<div className='bg-white p-3 shadow-lg rounded-lg h-60 flex flex-col mt-2 justify-center items-center'>
						<img className='w-[100px]' src={transfer} alt="queue" />
						<p>No queued transactions</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TxnCard;
