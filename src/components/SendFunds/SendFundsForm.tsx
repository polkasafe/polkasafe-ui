// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';

import { PlusCircleOutlined } from '@ant-design/icons';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AutoComplete, Button, Divider, Form, Input, Modal, Skeleton, Spin, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import { NotificationStatus } from 'src/types';
import AddressComponent from 'src/ui-components/AddressComponent';
import AddressQr from 'src/ui-components/AddressQr';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import { CopyIcon, LineIcon, OutlineCloseIcon, QRIcon, SquareDownArrowIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { addToAddressBook } from 'src/utils/addToAddressBook';
import copyText from 'src/utils/copyText';
import formatBnBalance from 'src/utils/formatBnBalance';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import initMultisigTransfer from 'src/utils/initMultisigTransfer';
import { setSigner } from 'src/utils/setSigner';
import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

import TransactionFailedScreen from './TransactionFailedScreen';
import TransactionSuccessScreen from './TransactionSuccessScreen';

interface ISendFundsFormProps {
	onCancel?: () => void;
	className?: string;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>
	defaultSelectedAddress?: string
}

const SendFundsForm = ({ className, onCancel, defaultSelectedAddress, setNewTxn }: ISendFundsFormProps) => {

	const { activeMultisig, multisigAddresses, addressBook, address, isProxy, loggedInWallet } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();
	const [note, setNote] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState(new BN(0));
	const [recipientAddress, setRecipientAddress] = useState(defaultSelectedAddress ? getEncodedAddress(defaultSelectedAddress, network) || '' : address || '');
	const [showQrModal, setShowQrModal] = useState(false);
	const [callData, setCallData] = useState<string>('');
	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>(
		addressBook?.map((account) => ({
			label: <AddressComponent address={account.address} />,
			value: account.address
		}))
	);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);

	const [validRecipient, setValidRecipient] = useState(true);
	const [form] = Form.useForm();

	const [multisigBalance, setMultisigBalance] = useState<string>('');

	const [loadingMessages, setLoadingMessages] = useState<string>('');

	const [transactionData, setTransactionData] = useState<any>({});

	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));

	const [totalGas, setTotalGas] = useState<BN>(new BN(0));

	const [initiatorBalance, setInitiatorBalance] = useState<BN>(new BN(0));

	const [fetchBalancesLoading, setFetchBalancesLoading] = useState<boolean>(false);

	const multisig = multisigAddresses?.find((multisig) => multisig.address === activeMultisig || multisig.proxy === activeMultisig);

	useEffect(() => {
		if(!recipientAddress) return;

		if(!getSubstrateAddress(recipientAddress)){
			setValidRecipient(false);
			return;
		} else {
			setValidRecipient(true);
		}

		if(api && apiReady && recipientAddress && amount){
			const call = api.tx.balances.transferKeepAlive(recipientAddress, amount);
			let tx: SubmittableExtrinsic<'promise'>;
			if(isProxy && multisig?.proxy){
				tx = api.tx.proxy.proxy(multisig.proxy, null, call);
				setCallData(tx.method.toHex());
			}
			else {
				setCallData(call.method.toHex());
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amount, api, apiReady, recipientAddress, isProxy, multisig]);

	useEffect(() => {
		const fetchBalanceInfos = async () => {
			if(!api || !apiReady || !address || !recipientAddress){
				return;
			}
			setFetchBalancesLoading(true);
			//deposit balance
			const depositBase = api.consts.multisig.depositBase.toString();
			const depositFactor = api.consts.multisig.depositFactor.toString();
			setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));

			//gas fee
			if(!['westend', 'rococo'].includes(network)){
				const txn = api.tx.balances.transferKeepAlive(recipientAddress, amount);
				const gasInfo = await txn.paymentInfo(address);
				setTotalGas(new BN(gasInfo.partialFee.toString()));
			}

			//initiator balance
			const initiatorBalance = await api.query.system.account(address);
			setInitiatorBalance(new BN(initiatorBalance.data.free.toString()));
			setFetchBalancesLoading(false);
		};
		fetchBalanceInfos();
	}, [address, amount, api, apiReady, network, recipientAddress]);

	const handleSubmit = async () => {
		if(!api || !apiReady || !address){
			return;
		}

		await setSigner(api, loggedInWallet);

		if(!multisig || !recipientAddress || !amount){
			queueNotification({
				header: 'Error!',
				message: 'Invalid Input.',
				status: NotificationStatus.ERROR
			});
			return;
		}
		setLoading(true);
		try {
			const queueItemData = await initMultisigTransfer({
				amount,
				api,
				initiatorAddress: address,
				isProxy,
				multisig,
				network,
				note,
				recipientAddress: getSubstrateAddress(recipientAddress) || recipientAddress,
				setLoadingMessages,
				transferKeepAlive: true
			});
			setTransactionData(queueItemData);
			setLoading(false);
			setSuccess(true);
		} catch (error) {
			console.log(error);
			setTransactionData(error);
			setLoading(false);
			setFailure(true);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const QrModal: FC = () => {
		return (
			<>
				<button onClick={() => setShowQrModal(true)}><QRIcon className='text-text_secondary' /></button>
				<Modal title={<span className='font-bold text-lg text-white' >Address QR</span>} onCancel={() => setShowQrModal(false)} open={showQrModal} footer={null}>
					<AddressQr address={recipientAddress} />
				</Modal>
			</>
		);
	};

	const AddAddressModal: FC = () => {
		const [addAddressName, setAddAddressName] = useState('');
		const [addAddressLoading, setAddAddressLoading] = useState(false);

		const handleAddAddress = async () => {
			setAddAddressLoading(true);
			const newAddresses = await addToAddressBook({
				address: recipientAddress,
				addressBook,
				name: addAddressName,
				network
			});
			setAddAddressLoading(false);
			if(newAddresses){
				setAutoCompleteAddresses(newAddresses.map((item) => ({
					label: <AddressComponent name={item.name} address={item.address} />,
					value: item.address
				})));
			}
			setShowAddressModal(false);
			queueNotification({
				header: 'Successful!',
				message: 'Your Address has been Added.',
				status: NotificationStatus.SUCCESS
			});
		};
		return (
			<Modal
				centered
				title={<h3 className='text-white mb-8 text-lg font-semibold'>Add Address</h3>}
				closeIcon={<button
					className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
					onClick={() => setShowAddressModal(false)}
				>
					<OutlineCloseIcon className='text-primary w-2 h-2' />
				</button>}
				footer={null}
				open={showAddressModal}
				className='w-auto min-w-[500px] scale-90 origin-center'
			>
				<Form
					className='my-0 w-[560px]'
				>
					<div className="flex flex-col gap-y-3">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="name"
						>
							Name
						</label>
						<Form.Item
							name="name"
							rules={[
								{
									message: 'Required',
									required: true
								}
							]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="Give the address a name"
								className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="name"
								onChange={(e) => setAddAddressName(e.target.value)}
								value={addAddressName}
							/>
						</Form.Item>
					</div>
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="address"
						>
							Address
						</label>
						<Form.Item
							name="address"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								className="text-sm font-normal leading-[15px] outline-0 p-2.5 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24"
								id="address"
								defaultValue={recipientAddress}
								disabled={true}
							/>
						</Form.Item>
					</div>
					<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
						<CancelBtn onClick={() => setShowAddressModal(false)}/>
						<ModalBtn loading={addAddressLoading} disabled={!addAddressName || !recipientAddress} title='Add' onClick={handleAddAddress} />
					</div>
				</Form>
			</Modal>
		);
	};

	return (
		<>
			{success ?
				<TransactionSuccessScreen
					successMessage='Transaction in Progress!'
					waitMessage='All Threshold Signatories need to Approve the Transaction.'
					amount={amount}
					txnHash={transactionData?.callHash}
					created_at={transactionData?.created_at || new Date()}
					sender={address}
					recipient={recipientAddress}
					onDone={() => {
						setNewTxn?.(prev => !prev);
						onCancel?.();
					}}
				/>
				: failure ?
					<TransactionFailedScreen
						onDone={() => {
							setNewTxn?.(prev => !prev);
							onCancel?.();
						}}
						txnHash={transactionData?.callHash || ''}
						sender={address}
						failedMessage='Oh no! Something went wrong.'
						waitMessage='Your transaction has failed due to some technical error. Please try again...Details of the transaction are included below'
						created_at={new Date()}
					/> :
					<Spin wrapperClassName={className} spinning={loading} indicator={<LoadingLottie message={loadingMessages} />}>
						{initiatorBalance.lte(totalDeposit.add(totalGas)) && !fetchBalancesLoading ? <section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
							<WarningCircleIcon />
							<p>The balance in your logged in account {addressBook.find((item) => item.address === address)?.name} is less than the Minimum Deposit({formatBnBalance(totalDeposit.add(totalGas), { numberAfterComma: 3, withUnit: true }, network)}) required to create a Transaction.</p>
						</section>
							:
							<Skeleton className={`${!fetchBalancesLoading && 'opacity-0'}`} active paragraph={{ rows: 0 }}/>
						}
						<Form
							className={classNames('max-h-[68vh] overflow-y-auto px-2')}
							form={form}
							validateMessages={
								{ required: "Please add the '${name}'" }
							}
						>
							<AddAddressModal/>
							<section>
								<p className='text-primary font-normal text-xs leading-[13px]'>Sending from</p>
								<div className='flex items-center gap-x-[10px] mt-[14px]'>
									<article className='w-[500px] p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center justify-between'>
										<AddressComponent withBadge={false} address={activeMultisig} />
										<Balance address={activeMultisig} onChange={setMultisigBalance} />
									</article>
									<article className='w-[412px] flex items-center'>
										<span className='-mr-1.5 z-0'>
											<LineIcon className='text-5xl' />
										</span>
										<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>The transferred balance will be subtracted (along with fees) from the sender account.</p>
									</article>
								</div>
								<div className='w-[500px]'>
									<Divider className='border-[#505050]'>
										<SquareDownArrowIcon />
									</Divider>
								</div>
							</section>

							<section className=''>
								<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient</label>
								<div className='flex items-start gap-x-[10px]'>
									<article className='w-[500px]'>
										<Form.Item
											name="recipient"
											rules={[{ required: true }]}
											help={(!recipientAddress && 'Recipient Address is Required') || (!validRecipient && 'Please add a valid Address')}
											className='border-0 outline-0 my-0 p-0'
											validateStatus={recipientAddress && validRecipient ? 'success' : 'error'}
										>
											<div>
												{recipientAddress && autocompleteAddresses.some((item) => getSubstrateAddress(String(item.value)) === getSubstrateAddress(recipientAddress)) ?
													<div className='border border-solid border-primary rounded-lg p-2 flex justify-between items-center'>
														{autocompleteAddresses.find((item) => getSubstrateAddress(String(item.value)) === getSubstrateAddress(recipientAddress))?.label}
														<button
															className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
															onClick={() => {
																setRecipientAddress('');
															}}
														>
															<OutlineCloseIcon className='text-primary w-2 h-2' />
														</button>
													</div>
													:
													<AutoComplete
														autoFocus
														defaultOpen
														filterOption={(inputValue, options) => {
															return inputValue ? getSubstrateAddress(String(options?.value) || '') === getSubstrateAddress(inputValue) : true;
														}}
														notFoundContent={validRecipient && <Button icon={<PlusCircleOutlined className='text-primary' />} className='bg-transparent border-none outline-none text-primary text-sm flex items-center' onClick={() => setShowAddressModal(true)} >Add Address to Address Book</Button>}
														options={autocompleteAddresses}
														id='recipient'
														placeholder="Send to Address.."
														onChange={(value) => setRecipientAddress(value)}
														defaultValue={defaultSelectedAddress || ''}
													/>
												}
											</div>
										</Form.Item>
									</article>
									<article className='w-[412px] flex items-center'>
										<span className='-mr-1.5 z-0'>
											<LineIcon className='text-5xl' />
										</span>
										<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>The beneficiary will have access to the transferred fees when the transaction is included in a block.</p>
									</article>
								</div>
							</section>

							<section className='mt-[15px]'>
								<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Amount</label>
								<div className='flex items-start gap-x-[10px]'>
									<article className='w-[500px]'>
										<BalanceInput fromBalance={multisigBalance} onChange={(balance) => setAmount(balance)} />
									</article>
									<article className='w-[412px] flex items-center'>
										<span className='-mr-1.5 z-0'>
											<LineIcon className='text-5xl' />
										</span>
										<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px] -mb-5'>
								If the recipient account is new, the balance needs to be more than the existential deposit. Likewise if the sending account balance drops below the same value, the account will be removed from the state.
										</p>
									</article>
								</div>
							</section>

							{callData && !!Number(amount) && recipientAddress &&
					<section className='mt-[15px]'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Call Data</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-[500px]'>
								<div
									className="text-sm cursor-pointer w-full font-normal flex items-center justify-between leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white"
									onClick={() => copyText(callData)}
								>
									{shortenAddress(callData, 10)}
									<button className='text-primary'><CopyIcon /></button>
								</div>

							</article>
						</div>
					</section>
							}

							<section className='mt-[15px]'>
								<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Existential Deposit</label>
								<div className='flex items-center gap-x-[10px]'>
									<article className='w-[500px]'>
										<Form.Item
											name="existential_deposit"
											rules={[]}
											className='border-0 outline-0 my-0 p-0'
										>
											<div className='flex items-center h-[40px]'>
												<Input
													disabled={true}
													type='number'
													placeholder={String(chainProperties[network].existentialDeposit)}
													className="text-sm font-normal leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24"
													id="existential_deposit"
												/>
												<div className='absolute right-0 text-white px-3 flex items-center justify-center'>
													<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
													<span>{ chainProperties[network].tokenSymbol}</span>
												</div>
											</div>
										</Form.Item>
									</article>
								</div>
							</section>

							<section className='mt-[15px]'>
								<label className='text-primary font-normal text-xs block mb-7'>Note</label>
								<div className=''>
									<article className='w-[500px]'>
										<Form.Item
											name="note"
											rules={[]}
											className='border-0 outline-0 my-0 p-0'
										>
											<div className='flex items-center h-[40px]'>
												<Input.TextArea
													placeholder='Note'
													className="w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none"
													id="note"
													rows={4}
													value={note}
													onChange={(e) => setNote(e.target.value)}
												/>
											</div>
										</Form.Item>
									</article>
								</div>
							</section>

							<section className='mt-[15px]'>
								<div className='flex items-center gap-x-[10px]'>
									<article className='w-[500px] flex items-center gap-x-3'>
										<p className='text-white text-sm font-normal leading-[15px]'>
									Transfer with account keep-alive checks
										</p>
										<Switch disabled size='small' className='text-primary' defaultChecked />
									</article>
									<article className='w-[412px] flex items-center'>
										<span className='-mr-1.5 z-0'>
											<LineIcon className='text-5xl' />
										</span>
										<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>With the keep-alive option set, the account is protected against removal due to low balances.
										</p>
									</article>
								</div>
							</section>

							{/* <section className='mt-4 max-w-[500px] text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[13px] flex items-center gap-x-[11px]'>
						<span>
							<WarningCircleIcon className='text-base' />
						</span>
						<p className=''>
							The transaction, after application of the transfer fees, will drop the available balance below the existential deposit. As such the transfer will fail. The account needs more free funds to cover the transaction fees.
						</p>
					</section> */}

						</Form>
						<section className='flex items-center gap-x-5 justify-center mt-10'>
							<CancelBtn className='w-[250px]' onClick={onCancel} />
							<ModalBtn disabled={!recipientAddress || !validRecipient || amount.isZero() || amount.gte(new BN(multisigBalance)) || initiatorBalance.lt(totalDeposit.add(totalGas))} loading={loading} onClick={handleSubmit} className='w-[250px]' title='Make Transaction' />
						</section>
					</Spin>
			}
		</>
	);
};

export default styled(SendFundsForm)`
	.ant-select input {
		font-size: 14px !important;
		font-style: normal !important;
		line-height: 15px !important;
		border: 0 !important;
		outline: 0 !important;
		background-color: #24272E !important;
		border-radius: 8px !important;
		color: white !important;
		padding: 12px !important;
		display: block !important;
		height: auto !important;
	}
	.ant-select-selector {
		border: none !important;
		height: 40px !important; 
		box-shadow: none !important;
	}

	.ant-select {
		height: 40px !important;
	}
	.ant-select-selection-search {
		inset: 0 !important;
	}
	.ant-select-selection-placeholder{
		color: #505050 !important;
		z-index: 100;
		display: flex !important;
		align-items: center !important;
	}

	.ant-skeleton .ant-skeleton-content .ant-skeleton-title +.ant-skeleton-paragraph{
		margin-block-start: 8px !important;
	}
`;
