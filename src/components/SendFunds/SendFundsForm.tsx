// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AutoComplete, Checkbox, Divider, Form, Input, Modal, Spin, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import classNames from 'classnames';
import React, { FC, useContext, useEffect, useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { TestContext } from 'src/context/TestContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { chainProperties } from 'src/global/networkConstants';
import { NotificationStatus } from 'src/types';
import AddressComponent from 'src/ui-components/AddressComponent';
import AddressQr from 'src/ui-components/AddressQr';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import { CopyIcon, LineIcon, QRIcon, SquareDownArrowIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { addToAddressBook } from 'src/utils/addToAddressBook';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import initMultisigTransfer from 'src/utils/initMultisigTransfer';
import { setSigner } from 'src/utils/setSigner';
import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

import TransactionSuccessScreen from './TransactionSuccessScreen';

interface ISendFundsFormProps {
	onCancel?: () => void;
	className?: string;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>
	defaultSelectedAddress?: string
}

const addRecipientHeading = () => {
	const elm = document.getElementById('recipient_list');
	if (elm) {
		const parentElm = elm.parentElement;
		if (parentElm) {
			const isElmPresent = document.getElementById('recipient_heading');
			if (!isElmPresent) {
				const recipientHeading = document.createElement('p');
				recipientHeading.textContent = 'Recent Addresses';
				recipientHeading.id = 'recipient_heading';
				recipientHeading.classList.add('recipient_heading');
				parentElm.insertBefore(recipientHeading, parentElm.firstChild!);
			}
		}
	}
};

const SendFundsForm = ({ className, onCancel, defaultSelectedAddress, setNewTxn }: ISendFundsFormProps) => {
	const { client } = useContext<any>(TestContext);

	const { activeMultisig, multisigAddresses, addressBook, address, isProxy, loggedInWallet, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { api, apiReady } = useGlobalApiContext();
	const [note, setNote] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState(new BN(0));
	const [recipientAddress, setRecipientAddress] = useState(getEncodedAddress(defaultSelectedAddress || addressBook[0]?.address, network) || '');
	const [showQrModal, setShowQrModal] = useState(false);
	const [callData, setCallData] = useState<string>('');
	const autocompleteAddresses: DefaultOptionType[] = addressBook?.map((account) => ({
		label: account.name || DEFAULT_ADDRESS_NAME,
		value: account.address
	}));
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);

	const [validRecipient, setValidRecipient] = useState(true);
	const [form] = Form.useForm();

	const [multisigBalance, setMultisigBalance] = useState<string>('');

	const [loadingMessages, setLoadingMessages] = useState<string>('');

	const [transactionData, setTransactionData] = useState<any>({});

	const [recipientNotInAddressBook, setRecipientNotInAddressBook] = useState<boolean>(false);
	const [addAddressCheck, setAddAddressCheck] = useState<boolean>(true);

	const multisig = multisigAddresses?.find((multisig) => multisig.address === activeMultisig || multisig.proxy === activeMultisig);

	useEffect(() => {
		if(!getSubstrateAddress(recipientAddress)){
			setValidRecipient(false);
			return;
		} else {
			setValidRecipient(true);
		}

		if(addressBook.some((item) => getSubstrateAddress(item.address) === getSubstrateAddress(recipientAddress))){
			setRecipientNotInAddressBook(false);
		} else {
			setRecipientNotInAddressBook(true);
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

	const handleSubmit = async () => {
		if(!api || !apiReady || !address){
			return;
		}
		console.log('coming');

		const injected = await setSigner(api, loggedInWallet);

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
			// Transfer funds need an recipient address, amount, senderAddress, injector, multisig, isProxy, and an event grabber function ::BySDK::
			const queueItemData = await client.transferFunds(recipientAddress, amount, address, multisig, isProxy, setLoadingMessages);
			console.log(queueItemData);
			// const queueItemData = await initMultisigTransfer({
			// 	amount,
			// 	api,
			// 	initiatorAddress: address,
			// 	isProxy,
			// 	multisig,
			// 	network,
			// 	note,
			// 	recipientAddress: getSubstrateAddress(recipientAddress) || recipientAddress,
			// 	setLoadingMessages,
			// 	transferKeepAlive: true
			// });
			setTransactionData(queueItemData);
			setLoading(false);
			setSuccess(true);
		} catch (error) {
			console.log(error);
			setLoading(false);
			setFailure(true);
			setTimeout(() => {
				setFailure(false);
			}, 5000);
		} finally {
			if(addAddressCheck && validRecipient && recipientNotInAddressBook){
				const newAddressBook = await addToAddressBook({
					address: recipientAddress,
					addressBook,
					name: DEFAULT_ADDRESS_NAME,
					network
				});
				if(newAddressBook){
					setUserDetailsContextState(prev => {
						return {
							...prev,
							addressBook: newAddressBook
						};
					});
				}
			}
		}
	};

	const onClick = () => {
		addRecipientHeading();
	};

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
				: failure ? <FailedTransactionLottie message='Failed!' /> :
					<Spin wrapperClassName={className} spinning={loading} indicator={<LoadingLottie message={loadingMessages} />}>
						<Form
							className={classNames('max-h-[68vh] overflow-y-auto px-2')}
							form={form}
							validateMessages={
								{ required: "Please add the '${name}'" }
							}
						>
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
											help={!validRecipient && 'Please add a valid Address.'}
											className='border-0 outline-0 my-0 p-0'
											validateStatus={recipientAddress && validRecipient ? 'success' : 'error'}
										>
											<div className="flex items-center">
												<AutoComplete
													onClick={onClick}
													options={autocompleteAddresses}
													id='recipient'
													placeholder="Send to Address.."
													onChange={(value) => setRecipientAddress(value)}
													defaultValue={getEncodedAddress(defaultSelectedAddress || addressBook[0].address, network)}
												/>
												<div className='absolute right-2'>
													<button onClick={() => copyText(recipientAddress, true, network)}>
														<CopyIcon className='mr-2 text-primary' />
													</button>
													<QrModal />
												</div>
											</div>
										</Form.Item>
										{recipientNotInAddressBook &&
											<Checkbox className='text-white mt-2 [&>span>span]:border-primary' checked={addAddressCheck} onChange={(e) => setAddAddressCheck(e.target.checked)} >
												Add Address to Address Book
											</Checkbox>
										}
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
										<BalanceInput multisigBalance={multisigBalance} onChange={(balance) => setAmount(balance)} />
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
													className="w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24"
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

							<section className='flex items-center gap-x-5 justify-center mt-10'>
								<CancelBtn className='w-[300px]' onClick={onCancel} />
								<ModalBtn disabled={!recipientAddress || !validRecipient || amount.isZero() || amount.gte(new BN(multisigBalance))} loading={loading} onClick={handleSubmit} className='w-[300px]' title='Make Transaction' />
							</section>
						</Form>
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
`;
