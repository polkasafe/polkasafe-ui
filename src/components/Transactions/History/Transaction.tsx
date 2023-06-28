// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Collapse, Divider } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { ITransaction } from 'src/types';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon } from 'src/ui-components/CustomIcons';

import ReceivedInfo from './ReceivedInfo';
import SentInfo from './SentInfo';

const LocalizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(LocalizedFormat);

const Transaction: FC<ITransaction> = ({ amount_token, token, created_at, to, from, callHash, amount_usd }) => {
	const { network } = useGlobalApiContext();

	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [note, setNote] = useState<string>('');
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const multisig = multisigAddresses.find((item: any) => item.address === activeMultisig || item.proxy === activeMultisig);
	const type: 'Sent' | 'Received' = multisig?.address === from || multisig?.proxy === from ? 'Sent' : 'Received';
	const location = useLocation();
	const hash = location.hash.slice(1);

	const handleGetHistoryNote = async () => {
		try {
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else {
				setLoading(true);
				const noteRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getTransactionNote`, {
					body: JSON.stringify({
						callHash
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: noteData, error: noteError } = await noteRes.json() as { data: string, error: string };

				if (noteError) {
					console.log('error', noteError);
					setLoading(false);
					return;
				} else {
					setLoading(false);
					setNote(noteData);
				}

			}
		} catch (error) {
			setLoading(false);
			console.log('ERROR', error);
		}
	};

	console.log('amount token', amount_token);

	return (
		<>
			<Collapse
				className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'
				bordered={false}
				defaultActiveKey={[`${hash}`]}
			>
				<Collapse.Panel showArrow={false} key={`${callHash}`} header={
					<div
						onClick={() => {
							if (!transactionInfoVisible) {
								handleGetHistoryNote();
							}
							toggleTransactionVisible(!transactionInfoVisible);
						}}
						className={classNames(
							'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
						)}
					>
						<p className='col-span-3 flex items-center gap-x-3'>
							{
								type === 'Sent' ?
									<span
										className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'
									>
										<ArrowUpRightIcon />
									</span>
									:
									<span
										className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'
									>
										<ArrowDownLeftIcon />
									</span>
							}
							<span>
								{type}
							</span>
						</p>
						<p className='col-span-2 flex items-center gap-x-[6px]'>
							<ParachainIcon src={chainProperties[network].logo} />
							<span
								className={classNames(
									'font-normal text-xs leading-[13px] text-failure',
									{
										'text-success': type === 'Received'
									}
								)}
							>
								{type === 'Sent' ? '-' : '+'}{ethers.utils.formatEther(amount_token.toString()).toString()} {token}
							</span>
						</p>
						<p className='col-span-2'>
							{dayjs(created_at).format('lll')}
						</p>
						<p className='col-span-2 flex items-center justify-end gap-x-4'>
							<span className='text-success'>
								Success
							</span>
							<span className='text-white text-sm'>
								{
									transactionInfoVisible ?
										<CircleArrowUpIcon /> :
										<CircleArrowDownIcon />
								}
							</span>
						</p>
					</div>
				}>

					<div>
						<Divider className='bg-text_secondary my-5' />
						{
							type === 'Received' ?
								<ReceivedInfo
									amount={String(amount_token)}
									amountType={token}
									date={dayjs(created_at).format('llll')}
									from={from}
									callHash={callHash}
									note={note}
									loading={loading}
									amount_usd={amount_usd}
									to={to}
								/>
								:
								<SentInfo
									amount={String(amount_token)}
									amountType={token}
									date={dayjs(created_at).format('llll')}
									recipient={to}
									callHash={callHash}
									note={note}
									from={from}
									loading={loading}
									amount_usd={amount_usd}
								/>
						}
					</div>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

export default Transaction;