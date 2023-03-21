// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Signer } from '@polkadot/api/types';
import { Collapse, Divider, message } from 'antd';
import BN from 'bn.js';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import { IQueueItem } from 'src/types';
import { ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon } from 'src/ui-components/CustomIcons';
import { approveMultisigTransfer } from 'src/utils/approveMultisigTransfer';
import { cancelMultisigTransfer } from 'src/utils/cancelMultisigTransfer';
import decodeCallData from 'src/utils/decodeCallData';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import parseDecodedValue from 'src/utils/parseDecodedValue';

import SentInfo from './SentInfo';

interface ITransactionProps {
	status: 'Approval' | 'Cancelled' | 'Executed';
	date: string;
	approvals: string[];
	threshold: number;
	callData: string;
	callHash: string;
	note: string;
	amountUSD: string;
	setRefetch?: React.Dispatch<React.SetStateAction<boolean>>
	setQueuedTransactions?: React.Dispatch<React.SetStateAction<IQueueItem[]>>
	numberOfTransactions: number
}

const Transaction: FC<ITransactionProps> = ({ note, approvals, amountUSD, callData, callHash, date, setQueuedTransactions, numberOfTransactions, threshold }) => {
	const [messageApi, contextHolder] = message.useMessage();

	const { activeMultisig, multisigAddresses, address } = useGlobalUserDetailsContext();
	const [loading, setLoading] = useState(false);
	const { accountsMap, noAccounts, signersMap } = useGetAllAccounts();
	const { api, apiReady, network } = useGlobalApiContext();

	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [callDataString, setCallDataString] = useState<string>(callData || '');
	const [decodedCallData, setDecodedCallData] = useState<any>(null);

	const token = chainProperties[network].tokenSymbol;
	const location = useLocation();
	const hash = location.hash.slice(1);

	useEffect(() => {
		if(!api || !apiReady) return;

		const { data, error } = decodeCallData(callDataString, api);
		if(error || !data) return;

		if(data?.extrinsicCall?.hash.toHex() !== callHash) {
			messageApi.error('Invalid call data');
			return;
		}

		setDecodedCallData(data.extrinsicCall?.toJSON());

		// store callData in BE
		(async () => {
			if(decodedCallData || callData) return; // already stored

			await fetch(`${FIREBASE_FUNCTIONS_URL}/setTransactionCallData`, {
				body: JSON.stringify({
					callData: callDataString,
					callHash,
					network
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, callDataString, callHash, network]);

	const handleApproveTransaction = async () => {
		if(!api || !apiReady || noAccounts || !signersMap || !address){
			return;
		}

		const wallet = accountsMap[getEncodedAddress(address, network) || ''];
		if(!signersMap[wallet]) return;

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		const multisig = multisigAddresses?.find((multisig) => multisig.address === activeMultisig);

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
				callDataHex: callDataString,
				callHash,
				messageApi,
				multisig,
				network,
				note: note || '',
				recipientAddress: decodedCallData.args.dest.id
			});
			document.getElementById(callHash)?.remove();
			if(numberOfTransactions < 2 && setQueuedTransactions){
				setQueuedTransactions([]);
			}
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

		const wallet = accountsMap[getEncodedAddress(address, network) || ''];
		if(!signersMap[wallet]) return;

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		const multisig = multisigAddresses?.find((multisig) => multisig.address === activeMultisig);

		if(!multisig) return;

		setLoading(true);
		try {
			await cancelMultisigTransfer({
				api,
				approvingAddress: address,
				callHash,
				messageApi,
				multisig,
				network,
				recipientAddress: decodedCallData ? decodedCallData.args.dest.id : ''
			});
			document.getElementById(callHash)?.remove();
			if(numberOfTransactions < 2 && setQueuedTransactions){
				setQueuedTransactions([]);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{ contextHolder }

			<Collapse
				className='bg-bg-secondary rounded-lg p-3'
				bordered={false}
				defaultActiveKey={[`${hash}`]}
			>
				<Collapse.Panel showArrow={false} key={`${callHash}`} header={
					<div
						onClick={() => {
							toggleTransactionVisible(!transactionInfoVisible);
						}}
						className={classNames(
							'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
						)}
					>
						<p className='col-span-3 flex items-center gap-x-3'>

							<span
								className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'
							>
								<ArrowUpRightIcon />
							</span>

							<span>
								Sent
							</span>
						</p>
						<p className='col-span-2 flex items-center gap-x-[6px]'>
							<ParachainIcon src={chainProperties[network].logo} />
							<span
								className={'font-normal text-xs leading-[13px] text-failure'}
							>
								- {decodedCallData && decodedCallData?.args?.value ? parseDecodedValue({
									network,
									value: String(decodedCallData.args.value),
									withUnit: true
								}) : `? ${token}`}
							</span>
						</p>
						<p className='col-span-2'>
							{dayjs(date).format('lll')}
						</p>
						<p className='col-span-2 flex items-center justify-end gap-x-4'>
							<span className='text-waiting'>
								{!approvals.includes(address) && 'Awaiting your Confirmation'} ({approvals.length}/{threshold})
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

						<SentInfo
							amount={decodedCallData?.args?.value || ''}
							amountUSD={amountUSD}
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
							note={note}
						/>

					</div>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

export default Transaction;