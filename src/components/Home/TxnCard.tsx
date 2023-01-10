// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReloadOutlined } from '@ant-design/icons';
import React from 'react';
import { Link } from 'react-router-dom';
import { RightArrowOutlined } from 'src/ui-components/CustomIcons';

// import emptyTxHistory from 'src/assets/icons/tx-h-empty.svg';
// import emptyTxQueue from 'src/assets/icons/tx-q-empty.svg';
import BottomLeftArrow from '../../assets/icons/bottom-left-arrow.svg';
import TopRightArrow from '../../assets/icons/top-right-arrow.svg';

const TxnCard = () => {
	return (
		<div>
			<div className="grid grid-cols-12 gap-4 my-3 grid-row-2 lg:grid-row-1">
				{/* Txn Queue */}
				<div className='col-start-1 col-end-13 md:col-end-7'>
					<div className="flex justify-between flex-row w-full">
						<h2 className="text-xl font-bold text-white">Transaction Queue</h2>
						<Link to="/transactions" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>
					<div className="flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg mt-2 h-60 overflow-auto">
						<h1 className="text-primary text-md mb-4">Pending Transactions</h1>
						<div className="flex items-center justify-between pb-2 mb-2">
							<div className="flex items-center justify-between">
								<div className='bg-waiting bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'><ReloadOutlined className='text-waiting' /></div>
								<div className='ml-3'>
									<h1 className='text-md text-white'>Txn: 0xcac0c4e3...a5c6f465</h1>
									<p className='text-white text-xs'>In Process...</p>
								</div>
							</div>
							<div>
								<h1 className='text-md text-white'>-1000 DOT</h1>
								<p className='text-white text-right text-xs'>5173.42 USD</p>
							</div>
						</div>
						<div className="flex items-center justify-between pb-2 mb-2">
							<div className="flex items-center justify-between">
								<div className='bg-waiting bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'><ReloadOutlined className='text-waiting' /></div>
								<div className='ml-3'>
									<h1 className='text-md text-white'>Txn: 0xcac0c4e3...a5c6f465</h1>
									<p className='text-white text-xs'>In Process...</p>
								</div>
							</div>
							<div>
								<h1 className='text-md text-white'>-1000 DOT</h1>
								<p className='text-white text-right text-xs'>5173.42 USD</p>
							</div>
						</div>
						{/* Empty state */}
						{/* <div className="flex flex-col items-center justify-center mt-5">
							<img className='w-[150px] mt-3' src={emptyTxQueue} alt="tx"/>
							<p className='text-text_secondary my-2'>No queued transactions</p>
						</div> */}
					</div>
				</div>
				{/* Txn History */}
				<div className='md:col-start-7 col-start-1 col-end-13'>
					<div className="flex justify-between flex-row w-full">
						<h2 className="text-xl font-bold text-white">Transaction History</h2>
						<Link to="/transactions" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>
					<div className='bg-bg-main p-3 shadow-lg rounded-lg mt-2 h-60 overflow-auto'>
						<h1 className="text-primary text-md mb-4">Completed Transactions</h1>
						<div className="flex items-center justify-between pb-2 mb-2">
							<div className="flex items-center justify-between">
								<div className='bg-failure bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center'><img src={TopRightArrow} alt="send"/></div>
								<div>
									<h1 className='text-md text-white'>Txn: 0xcac0c4e3...a5c6f465</h1>
									<p className='text-text_secondary text-xs'>12/12/12 at 12:53 AM</p>
								</div>
							</div>
							<div>
								<h1 className='text-md text-failure'>-1000 DOT</h1>
								<p className='text-text_secondary text-right text-xs'>5173.42 USD</p>
							</div>
						</div>
						<div className="flex items-center justify-between pb-2 mb-2">
							<div className="flex items-center justify-between">
								<div className='bg-success bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center'><img src={BottomLeftArrow} alt="send"/></div>
								<div>
									<h1 className='text-md text-white'>Txn: 0xcac0c4e3...a7c6f465</h1>
									<p className='text-text_secondary text-xs'>12/12/12 at 12:53 AM</p>
								</div>
							</div>
							<div>
								<h1 className='text-md text-success'>5000 DOT</h1>
								<p className='text-text_secondary text-right text-xs'>5173.42 USD</p>
							</div>
						</div>
						<div className="flex items-center justify-between pb-2 mb-2">
							<div className="flex items-center justify-between">
								<div className='bg-failure bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center'><img src={TopRightArrow} alt="send"/></div>
								<div>
									<h1 className='text-md text-white'>Txn: 0xcac0c4e3...a5c6f465</h1>
									<p className='text-text_secondary text-xs'>12/12/12 at 12:53 AM</p>
								</div>
							</div>
							<div>
								<h1 className='text-md text-failure'>-1000 DOT</h1>
								<p className='text-text_secondary text-right text-xs'>5173.42 USD</p>
							</div>
						</div>
						{/*TODO: Empty state */}
						{/* <div className="flex flex-col items-center justify-center mt-5">
							<img className='w-[150px] mt-3' src={emptyTxHistory} alt="tx"/>
							<p className='text-text_secondary my-2'>No past transactions</p>
						</div> */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TxnCard;
