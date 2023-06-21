// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { bnToBn } from '@polkadot/util';
import { EthersAdapter, Web3Adapter } from '@safe-global/protocol-kit';
import { Collapse, Divider, message,Skeleton } from 'antd';
import BN from 'bn.js';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import  { useNavigate } from 'react-router-dom';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { GnosisSafeService } from 'src/services';
import { IMultisigAddress, IQueueItem, ITxNotification } from 'src/types';
import { ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon } from 'src/ui-components/CustomIcons';
import LoadingModal from 'src/ui-components/LoadingModal';
import { approveAddProxy } from 'src/utils/approveAddProxy';
import { approveMultisigTransfer } from 'src/utils/approveMultisigTransfer';
import { approveProxy } from 'src/utils/approveProxy';
import { cancelMultisigTransfer } from 'src/utils/cancelMultisigTransfer';
import { cancelProxy } from 'src/utils/cancelProxy';
import decodeCallData from 'src/utils/decodeCallData';
import parseDecodedValue from 'src/utils/parseDecodedValue';
import { setSigner } from 'src/utils/setSigner';

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
	refetch?: () => void;
	setQueuedTransactions?: React.Dispatch<React.SetStateAction<IQueueItem[]>>
	numberOfTransactions: number;
	notifications?:ITxNotification;
}

const Transaction: FC<ITransactionProps> = ({ note, approvals, refetch, amountUSD, callData, callHash, date, setQueuedTransactions, numberOfTransactions, threshold, notifications }) => {
	const [messageApi, contextHolder] = message.useMessage();
	const navigate = useNavigate();

	const { activeMultisig, multisigAddresses, address, setUserDetailsContextState, loggedInWallet } = useGlobalUserDetailsContext();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);
	const [getMultiDataLoading, setGetMultisigDataLoading] = useState(false);
	const [loadingMessages, setLoadingMessages] = useState('');
	const [openLoadingModal, setOpenLoadingModal] = useState(false);
	const { api, apiReady, network } = useGlobalApiContext();
	const { web3AuthUser, ethProvider , web3Provider} = useGlobalWeb3Context();

	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [callDataString, setCallDataString] = useState<string>(callData || '');
	const [decodedCallData, setDecodedCallData] = useState<any>(null);
	const [isProxyApproval, setIsProxyApproval] = useState<boolean>(false);
	const [isProxyAddApproval, setIsProxyAddApproval] = useState<boolean>(false);
	const [isProxyRemovalApproval, setIsProxyRemovalApproval] = useState<boolean>(false);

	const token = chainProperties[network].tokenSymbol;
	const location = useLocation();
	const hash = location.hash.slice(1);

	const multisig = multisigAddresses?.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

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

	useEffect(() => {
		const fetchMultisigData = async (newMultisigAddress: string) => {
			const getNewMultisigData = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigDataByMultisigAddress`, {
				body: JSON.stringify({
					multisigAddress: newMultisigAddress,
					network
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: newMultisigData, error: multisigFetchError } = await getNewMultisigData.json() as { data: IMultisigAddress, error: string };

			if(multisigFetchError || !newMultisigData || !multisig) {
				setGetMultisigDataLoading(false);
				return;
			}

			// if approval is for removing old multisig from proxy
			if(dayjs(newMultisigData?.created_at).isBefore(multisig.created_at)){
				setGetMultisigDataLoading(false);
				setIsProxyRemovalApproval(true);
			}
			else {
				setGetMultisigDataLoading(false);
				setIsProxyAddApproval(true);
			}
		};
		if(decodedCallData && decodedCallData?.args?.proxy_type){
			setIsProxyApproval(true);
		}
		else if(decodedCallData && decodedCallData?.args?.call?.args?.delegate?.id){
			setGetMultisigDataLoading(true);
			fetchMultisigData(decodedCallData?.args?.call?.args?.delegate?.id);
		}
	}, [decodedCallData, multisig, multisigAddresses, network]);

	const handleApproveTransaction = async () => {
		try {
			const signer = ethProvider.getSigner();
			const ethAdapter = new EthersAdapter({
				ethers: ethProvider,
				signerOrProvider: signer
			});

			const web3Adapter = new Web3Adapter({
				signerAddress: web3AuthUser!.accounts[0],
				web3: web3Provider
			})
			const txUrl = 'https://safe-transaction-goerli.safe.global';
			const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
			const response = await gnosisService.signAndConfirmTx(callHash, activeMultisig);
			const updateTx = {
				txSignature: response.signature,
				txHash: callHash,
				signer: web3AuthUser!.accounts[0]
			}
			await fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransaction`, {
				headers: {
					'Accept': 'application/json',
					'Acess-Control-Allow-Origin': '*',
					'Content-Type': 'application/json',
					'x-address': web3AuthUser!.accounts[0],
					'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
					'x-signature': localStorage.getItem('signature')!,
					'x-source': 'polkasafe'
				},
				method: 'POST',
				body: JSON.stringify(updateTx)
			}).then(res => res.json());

			const rec = await gnosisService.executeTx(callHash, activeMultisig);

			console.log(rec);


		} catch (error) {
			console.log(error);
		}
	};

	const handleCancelTransaction = async () => {
		if(!api || !apiReady || !address){
			return;
		}

		await setSigner(api, loggedInWallet);

		const multisig = multisigAddresses?.find((multisig) => multisig.address === activeMultisig || multisig.proxy === activeMultisig);

		if(!multisig) return;

		setLoading(true);
		setOpenLoadingModal(true);
		try {
			if((!decodedCallData || !decodedCallData?.args?.value || !decodedCallData?.args?.dest?.id) && !decodedCallData?.args?.proxy_type && (!decodedCallData?.args?.call?.args?.value || !decodedCallData?.args?.call?.args?.dest?.id) && (!decodedCallData?.args?.call?.args?.delegate || !decodedCallData?.args?.call?.args?.delegate?.id) ){
				return;
			}
			if(decodedCallData?.args?.proxy_type){
				await cancelProxy({
					api,
					approvingAddress: address,
					callHash,
					multisig,
					network,
					setLoadingMessages
				});
			}
			else{
				await cancelMultisigTransfer({
					api,
					approvingAddress: address,
					callHash,
					multisig,
					network,
					recipientAddress: decodedCallData.args.dest?.id || decodedCallData?.args?.call?.args?.dest?.id || '',
					setLoadingMessages
				});
			}
			setLoading(false);
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
				setOpenLoadingModal(false);
			}, 5000);
			if(!openLoadingModal){
				document.getElementById(callHash)?.remove();
				if(numberOfTransactions < 2 && setQueuedTransactions){
					setQueuedTransactions([]);
				}
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
			setFailure(true);
			setTimeout(() => {
				setFailure(false);
				setOpenLoadingModal(false);
			}, 5000);
		}
	};

	return (
		<>
			{ contextHolder }

			<Collapse
				className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'
				bordered={false}
				defaultActiveKey={[`${hash}`]}
			>
				<Collapse.Panel
					showArrow={false}
					key={`${callHash}`}
					header={
						getMultiDataLoading ? <Skeleton active paragraph={{ rows: 0 }} /> :
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
										className={`flex items-center justify-center w-9 h-9 ${isProxyApproval || isProxyAddApproval || isProxyRemovalApproval ? 'bg-[#FF79F2] text-[#FF79F2]' : 'bg-success text-red-500'} bg-opacity-10 p-[10px] rounded-lg`}
									>
										<ArrowUpRightIcon />
									</span>

									<span>
										{isProxyApproval ? 'Proxy' : isProxyAddApproval ? 'Adding New Signatories to Multisig' : isProxyRemovalApproval ? 'Remove Old Multisig From Proxy' : 'Sent'}
									</span>
								</p>
								{!isProxyApproval && !isProxyAddApproval && !isProxyRemovalApproval &&
							<p className='col-span-2 flex items-center gap-x-[6px]'>
								<ParachainIcon src={chainProperties[network].logo} />
								<span
									className={'font-normal text-xs leading-[13px] text-failure'}
								>
									- {decodedCallData && (decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value) ? parseDecodedValue({
										network,
										value: String(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value),
										withUnit: true
									}) : `? ${token}`}
								</span>
							</p>
								}
								<p className='col-span-2'>
									{dayjs(date).format('lll')}
								</p>
								<p className={`${isProxyApproval || isProxyAddApproval || isProxyRemovalApproval ? 'col-span-4' : 'col-span-2'} flex items-center justify-end gap-x-4`}>
									<span className='text-waiting'>
										{/* {!approvals.includes(address) && 'Awaiting your Confirmation'} ({approvals.length}/{threshold}) */}
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
					}
				>
					<LoadingModal message={loadingMessages} loading={loading} success={success} failed={failure} open={openLoadingModal} onCancel={() => setOpenLoadingModal(false)} />

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
							amount={decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value || ''}
							amountUSD={amountUSD}
							callHash={callHash}
							callDataString={callDataString}
							callData={callData}
							date={date}
							approvals={approvals}
							threshold={threshold}
							loading={loading}
							getMultiDataLoading={getMultiDataLoading}
							recipientAddress={decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id}
							setCallDataString={setCallDataString}
							handleApproveTransaction={handleApproveTransaction}
							handleCancelTransaction={handleCancelTransaction}
							note={note}
							isProxyApproval={isProxyApproval}
							isProxyAddApproval={isProxyAddApproval}
							delegate_id={decodedCallData?.args?.call?.args?.delegate?.id}
							isProxyRemovalApproval={isProxyRemovalApproval}
							notifications={notifications}
						/>

					</div>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

export default Transaction;