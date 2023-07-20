// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';

import { Web3Adapter } from '@safe-global/protocol-kit';
import { AutoComplete, Divider, Form, Input, Modal, Skeleton, Spin, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import classNames from 'classnames';
import { ethers } from 'ethers';
import React, { FC, useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { returnTxUrl } from 'src/global/gnosisService';
import { GnosisSafeService } from 'src/services';
import { NotificationStatus } from 'src/types';
import AddressComponent from 'src/ui-components/AddressComponent';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import { LineIcon, OutlineCloseIcon, SquareDownArrowIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { addToAddressBook } from 'src/utils/addToAddressBook';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
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

	const { activeMultisig, addressBook, address, fetchMultisigData } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { web3AuthUser, ethProvider, web3Provider } = useGlobalWeb3Context();

	const [note, setNote] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('0');
	const [recipientAddress, setRecipientAddress] = useState(defaultSelectedAddress ? getEncodedAddress(defaultSelectedAddress, network) || '' : address || '');
	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>(
		addressBook?.map((account: any) => ({
			label: <AddressComponent address={account.address} />,
			value: account.address
		}))
	);
	const [success, setSuccess] = useState(false);
	const [failure] = useState(false);

	const [form] = Form.useForm();

	const [multisigBalance, setMultisigBalance] = useState<string>('');

	const [loadingMessages] = useState<string>('');

	const [transactionData] = useState<any>({});

	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const signer = ethProvider.getSigner();
			const web3Adapter = new Web3Adapter({
				signerAddress: web3AuthUser!.accounts[0],
				web3: web3Provider as any
			});
			const txUrl = returnTxUrl(network);
			const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);

			const safeTxHash = await gnosisService.createSafeTx(activeMultisig, web3AuthUser!.accounts[0], ethers.utils.parseUnits(amount, 'ether').toString(), web3AuthUser!.accounts[0]);

			if (safeTxHash) {
				const txBody = {
					amount_token: ethers.utils.parseUnits(amount, 'ether').toString(),
					data: '0x00',
					note,
					safeAddress: activeMultisig,
					to: web3AuthUser?.accounts[0],
					txHash: safeTxHash,
					type: 'sent'
				};
				const { error: multisigError } = await fetch(`${FIREBASE_FUNCTIONS_URL}/addTransactionEth`, {
					body: JSON.stringify(txBody),
					headers: {
						'Accept': 'application/json',
						'Acess-Control-Allow-Origin': '*',
						'Content-Type': 'application/json',
						'x-address': web3AuthUser!.accounts[0],
						'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
						'x-network': network,
						'x-signature': localStorage.getItem('signature')!,
						'x-source': 'polkasafe'
					},
					method: 'POST'
				}).then(res => res.json());
				console.log('multisigError', multisigError);
				if (multisigError) {
					queueNotification({
						header: 'Error.',
						message: 'Please try again.',
						status: NotificationStatus.ERROR
					});
				}
				setSuccess(true);
				fetchMultisigData();
				queueNotification({
					header: 'Success',
					message: 'New Transaction Created.',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (err) {
			console.log(err);
			setNewTxn?.(prev => !prev);
			onCancel?.();
			queueNotification({
				header: 'Error.',
				message: 'Please try again.',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(true);

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
			if (newAddresses) {
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
						<CancelBtn onClick={() => setShowAddressModal(false)} />
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
						{/* {initiatorBalance.lte(totalDeposit.add(totalGas)) && !fetchBalancesLoading ? <section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
							<WarningCircleIcon />
							<p>The balance in your logged in account {addressBook.find((item: any) => item.address === address)?.name} is less than the Minimum Deposit({formatBnBalance(totalDeposit.add(totalGas), { numberAfterComma: 3, withUnit: true }, network)}) required to create a Transaction.</p>
						</section>
							:
							<Skeleton className={`${!fetchBalancesLoading && 'opacity-0'}`} active paragraph={{ rows: 0 }} />
						} */}
						<Form
							className={classNames('max-h-[68vh] overflow-y-auto px-2')}
							form={form}
							validateMessages={
								{ required: "Please add the '${name}'" }
							}
						>
							<AddAddressModal />
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
											className='border-0 outline-0 my-0 p-0'
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

							{/* <section className='mt-[15px]'>
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
							</section> */}

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
							<ModalBtn disabled={amount === '0' || !recipientAddress}
								// !recipientAddress || !validRecipient || amount.isZero() || amount.gte(new BN(multisigBalance)) || initiatorBalance.lt(totalDeposit.add(totalGas))
								loading={loading} onClick={handleSubmit} className='w-[250px]' title='Make Transaction' />
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
