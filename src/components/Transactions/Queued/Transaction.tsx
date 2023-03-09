// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Signer } from '@polkadot/api/types';
import { Collapse, Divider } from 'antd';
import BN from 'bn.js';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon,  PolkadotIcon } from 'src/ui-components/CustomIcons';
import { approveMultisigTransfer } from 'src/utils/approveMultisigTransfer';
import { cancelMultisigTransfer } from 'src/utils/cancelMultisigTransfer';
import decodeCallData from 'src/utils/decodeCallData';
import formatBnBalance from 'src/utils/formatBnBalance';
import getNetwork from 'src/utils/getNetwork';

import ReceivedInfo from './ReceivedInfo';
import SentInfo from './SentInfo';

interface ITransactionProps {
	status: 'Approval' | 'Cancelled' | 'Executed';
	type: 'Sent' | 'Received';
	date: string;
	approvals: string[];
	threshold: number;
	callData: string;
	callHash: string
}

const network = getNetwork();

const Transaction: FC<ITransactionProps> = ({ approvals, callData, callHash, date, status, type, threshold }) => {
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);

	const { activeMultisig, multisigAddresses, address } = useGlobalUserDetailsContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] = useState(false);
	const { accountsMap, noAccounts, signersMap } = useGetAllAccounts();
	const { api, apiReady } = useGlobalApiContext();
	const [callDataString, setCallDataString] = useState<string>(callData || '');
	const [decodedCallData, setDecodedCallData] = useState<any>(null);

	const token = chainProperties[network].tokenSymbol;

	useEffect(() => {
		if(!api || !apiReady) return;
		const { data, error } = decodeCallData(callDataString, api);
		if(error || !data) return;
		setDecodedCallData(data.extrinsicCall?.toJSON());
	}, [api, apiReady, callDataString]);

	const handleApproveTransaction = async () => {
		if(!api || !apiReady || noAccounts || !signersMap || !address){
			return;
		}

		const wallet = accountsMap[address];
		if(!signersMap[wallet]) return;

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		const multisig = multisigAddresses.find((multisig) => multisig.address === activeMultisig);

		if(!multisig) return;

		setLoading(true);
		try {
			if(!decodedCallData || !decodedCallData?.args?.value || !decodedCallData?.args?.dest?.id){
				return;
			}
			await approveMultisigTransfer({
				amount: new BN(decodedCallData.args.value),
				api,
				approvingAddress: address,
				multisig,
				network,
				recipientAddress: decodedCallData.args.dest.id
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancelTransaction = async () => {
		if(!api || !apiReady || noAccounts || !signersMap || !address){
			return;
		}

		const wallet = accountsMap[address];
		if(!signersMap[wallet]) return;

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		const multisig = multisigAddresses.find((multisig) => multisig.address === activeMultisig);

		if(!multisig) return;

		setLoading(true);
		try {
			if(!decodedCallData || !decodedCallData?.args || !decodedCallData?.args?.value || !decodedCallData?.args?.dest?.id){
				return;
			}
			await cancelMultisigTransfer({
				amount: new BN(decodedCallData.args.value),
				api,
				approvingAddress: address,
				callHash,
				multisig,
				network,
				recipientAddress: decodedCallData.args.dest.id
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Collapse
			className='bg-bg-secondary rounded-lg p-3'
			bordered={false}
		>
			<Collapse.Panel showArrow={false} key={date} header={
				<div
					onClick={() => {
						toggleTransactionVisible(!transactionInfoVisible);
					}}
					className={classNames(
						'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
					)}
				>
					<p className='col-span-3 flex items-center gap-x-3'>
						{
							type === 'Sent'?
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
						<PolkadotIcon className='text-base' />
						<span
							className={classNames(
								'font-normal text-xs leading-[13px] text-failure',
								{
									'text-success': type === 'Received'
								}
							)}
						>
							{type === 'Sent'? '-': '+'}{formatBnBalance(new BN(decodedCallData?.args?.value), { numberAfterComma: 2, withUnit: true }, network)}
						</span>
					</p>
					{/* <p className='col-span-2'>
					{time}
				</p> */}
					<p className='col-span-2 flex items-center justify-end gap-x-4'>
						<span className='text-success'>
							{status}
						</span>
						<span className='text-white text-sm'>
							{
								transactionInfoVisible?
									<CircleArrowUpIcon />:
									<CircleArrowDownIcon />
							}
						</span>
					</p>
				</div>
			}>

				<div
				// className={classNames(
				// 'h-0 transition-all overflow-hidden',
				// {
				// 'h-auto overflow-auto': transactionInfoVisible
				// }
				// )}
				>
					<Divider className='bg-text_secondary my-5' />
					{
						type === 'Received'?
							<ReceivedInfo
								amount={decodedCallData?.args?.value || ''}
								amountType={token}
								date={date}
							/>
							:
							<SentInfo
								amount={decodedCallData?.args?.value || ''}
								callHash={callHash}
								callDataString={callDataString}
								callData={callData}
								date={date}
								approvals={approvals}
								threshold={threshold}
								loading={loading}
								recipientAddress={decodedCallData?.args?.dest?.id}
								setCallDataString={setCallDataString}
								handleApproveTransaction={handleApproveTransaction}
								handleCancelTransaction={handleCancelTransaction}
							/>
					}
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;