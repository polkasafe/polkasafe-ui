// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';

import { PlusCircleOutlined } from '@ant-design/icons';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AutoComplete, Button, Divider, Dropdown, Form, Input, Modal, Skeleton, Spin, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import { EFieldType, NotificationStatus } from 'src/types';
import AddressComponent from 'src/ui-components/AddressComponent';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import { CircleArrowDownIcon, CopyIcon, DeleteIcon, LineIcon, OutlineCloseIcon, SquareDownArrowIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { addToAddressBook } from 'src/utils/addToAddressBook';
import copyText from 'src/utils/copyText';
import customCallDataTransaction from 'src/utils/customCallDataTransaction';
import decodeCallData from 'src/utils/decodeCallData';
import formatBnBalance from 'src/utils/formatBnBalance';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import initMultisigTransfer, { IMultiTransferResponse, IRecipientAndAmount } from 'src/utils/initMultisigTransfer';
import { inputToBn } from 'src/utils/inputToBn';
import { setSigner } from 'src/utils/setSigner';
import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

import SelectTransactionType from './SelectTransactionType';
import TransactionFailedScreen from './TransactionFailedScreen';
import TransactionSuccessScreen from './TransactionSuccessScreen';
import UploadAttachment from './UploadAttachment';

export enum ETransactionType {
	SEND_TOKEN='Send Token',
	CALL_DATA='Call Data'
}

interface ISendFundsFormProps {
	onCancel?: () => void;
	className?: string;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>
	defaultSelectedAddress?: string
}

export interface ISubfieldAndAttachment {
	[subfield: string]: {
		file: any
	}
}

const SendFundsForm = ({ className, onCancel, defaultSelectedAddress, setNewTxn }: ISendFundsFormProps) => {

	const { activeMultisig, multisigAddresses, addressBook, address, isProxy, loggedInWallet, transactionFields } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();
	const { records } = useActiveMultisigContext();
	const [note, setNote] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState(new BN(0));
	const [recipientAndAmount, setRecipientAndAmount] = useState<IRecipientAndAmount[]>([{ amount: new BN(0), recipient: defaultSelectedAddress ? getEncodedAddress(defaultSelectedAddress, network) || '' : address || '' }]);
	const [callData, setCallData] = useState<string>('');
	const [transferKeepAlive, setTransferKeepAlive] = useState<boolean>(true);
	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>([]);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);

	const [validRecipient, setValidRecipient] = useState<boolean[]>([true]);
	const [form] = Form.useForm();

	const [multisigBalance, setMultisigBalance] = useState<string>('');

	const [loadingMessages, setLoadingMessages] = useState<string>('');

	const [transactionData, setTransactionData] = useState<any>({});

	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

	const [totalDeposit, setTotalDeposit] = useState<BN>(new BN(0));

	const [totalGas, setTotalGas] = useState<BN>(new BN(0));

	const [initiatorBalance, setInitiatorBalance] = useState<BN>(new BN(0));

	const [tip, setTip] = useState<BN>(new BN(0));

	const [fetchBalancesLoading, setFetchBalancesLoading] = useState<boolean>(false);

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<{category: string, subfields: {[subfield: string]: { name: string, value: string }}}>({ category: 'none', subfields: {} });

	const multisig = multisigAddresses?.find((multisig) => multisig.address === activeMultisig || multisig.proxy === activeMultisig);

	const [category, setCategory] = useState<string>('none');

	const [subfieldAttachments, setSubfieldAttachments] = useState<ISubfieldAndAttachment>({});

	const [transactionType, setTransactionType] = useState<ETransactionType>(ETransactionType.SEND_TOKEN);

	const [selectType, setSelectType] = useState<boolean>(true);

	const [callHash, setCallHash] = useState<string>('');

	const onRecipientChange = (value: string, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.recipient = value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onAmountChange = (amount: BN, i: number) => {
		setRecipientAndAmount((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.amount = amount;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddRecipient = () => {
		setRecipientAndAmount((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ amount: new BN(0), recipient: '' });
			return copyOptionsArray;
		});
	};

	const onRemoveRecipient = (i: number) => {
		const copyOptionsArray = [...recipientAndAmount];
		copyOptionsArray.splice(i, 1);
		setRecipientAndAmount(copyOptionsArray);
	};

	useEffect(() => {
		if(!api || !apiReady || transactionType !== ETransactionType.CALL_DATA || !callData) return;

		const { data, error } = decodeCallData(callData, api);
		if(error || !data) return;

		setCallHash(data.decoded?.method.hash.toHex() || '');

	}, [api, apiReady, callData, network, transactionType]);

	// Set address options for recipient
	useEffect(() => {
		const allAddresses: string[] = [];
		if(records){
			Object.keys(records).forEach((address) => {
				allAddresses.push(getEncodedAddress(address, network) || address);
			});
		}
		addressBook.forEach(item => {
			if(!allAddresses.includes(getEncodedAddress(item.address, network) || item.address)){
				allAddresses.push(item.address);
			}
		});
		setAutoCompleteAddresses(allAddresses.map(address => ({
			label: <AddressComponent address={address} />,
			value: address
		})));

	}, [address, addressBook, network, records]);

	useEffect(() => {
		setTransactionFieldsObject({ category, subfields: {} });
	}, [category]);

	useEffect(() => {
		if(!recipientAndAmount) return;

		recipientAndAmount.forEach((item, i) => {
			if(item.recipient && (!getSubstrateAddress(item.recipient) || recipientAndAmount.indexOf(recipientAndAmount.find(a => getSubstrateAddress(item.recipient) === getSubstrateAddress(a.recipient)) as IRecipientAndAmount) !== i)){
				setValidRecipient(prev => {
					const copyArray = [...prev];
					copyArray[i] = false;
					return copyArray;
				});
			}
			else {
				setValidRecipient(prev => {
					const copyArray = [...prev];
					copyArray[i] = true;
					return copyArray;
				});
			}
		});
	}, [recipientAndAmount]);

	useEffect(() => {

		if(!api || !apiReady || transactionType !== ETransactionType.SEND_TOKEN || !recipientAndAmount || recipientAndAmount.some((item) => item.recipient === '' || item.amount.isZero())) return;

		const batch = api.tx.utility.batch(recipientAndAmount.map((item) => transferKeepAlive ?  api.tx.balances.transferKeepAlive(item.recipient, item.amount.toString()) : api.tx.balances.transfer(item.recipient, item.amount.toString())));
		let tx: SubmittableExtrinsic<'promise'>;
		if(isProxy && multisig?.proxy){
			tx = api.tx.proxy.proxy(multisig.proxy, null, batch);
			setCallData(tx.method.toHex());
		}
		else {
			setCallData(batch.method.toHex());
		}

	}, [amount, api, apiReady, isProxy, multisig, recipientAndAmount, transactionType, transferKeepAlive]);

	useEffect(() => {
		const fetchBalanceInfos = async () => {
			if(!api || !apiReady || !address || !recipientAndAmount[0].recipient){
				return;
			}
			setFetchBalancesLoading(true);
			//deposit balance
			const depositBase = api.consts.multisig.depositBase.toString();
			const depositFactor = api.consts.multisig.depositFactor.toString();
			setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));

			//gas fee
			if(!['westend', 'rococo', 'kusama'].includes(network)){
				const txn = transferKeepAlive ? api.tx.balances.transferKeepAlive(recipientAndAmount[0].recipient, amount) : api.tx.balances.transfer(recipientAndAmount[0].recipient, amount);
				const gasInfo = await txn.paymentInfo(address);
				setTotalGas(new BN(gasInfo.partialFee.toString()));
			}

			//initiator balance
			const initiatorBalance = await api.query.system.account(address);
			setInitiatorBalance(new BN(initiatorBalance.data.free.toString()));
			setFetchBalancesLoading(false);
		};
		fetchBalanceInfos();
	}, [address, amount, api, apiReady, network, recipientAndAmount, transferKeepAlive]);

	//calculate total amount
	useEffect(() => {
		const total = recipientAndAmount.reduce((sum,item) => sum.add(item.amount), new BN(0));
		setAmount(total);
	}, [recipientAndAmount]);

	const handleSubmit = async () => {
		if(!api || !apiReady || !address){
			return;
		}

		await setSigner(api, loggedInWallet);

		if(!multisig) return;

		setLoading(true);
		try {
			let queueItemData: IMultiTransferResponse = {} as any;
			if(transactionType === ETransactionType.SEND_TOKEN){
				if(recipientAndAmount.some((item) => item.recipient === '' || item.amount.isZero()) || !amount){
					queueNotification({
						header: 'Error!',
						message: 'Invalid Input.',
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}
				queueItemData = await initMultisigTransfer({
					api,
					attachments: subfieldAttachments,
					initiatorAddress: address,
					isProxy,
					multisig,
					network,
					note,
					recipientAndAmount,
					setLoadingMessages,
					tip,
					transactionFields: transactionFieldsObject,
					transferKeepAlive
				});
			}
			else {
				queueItemData = await customCallDataTransaction({
					api,
					attachments: subfieldAttachments,
					callDataString: callData,
					initiatorAddress: address,
					isProxy,
					multisig,
					network,
					note,
					setLoadingMessages,
					tip,
					transactionFields: transactionFieldsObject
				});
			}
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

	const AddAddressModal = ({ defaultAddress }: { defaultAddress: string }) => {
		const [addAddressName, setAddAddressName] = useState('');
		const [addAddressLoading, setAddAddressLoading] = useState(false);

		const handleAddAddress = async () => {
			setAddAddressLoading(true);
			const newAddresses = await addToAddressBook({
				address: defaultAddress,
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
			<>
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
									defaultValue={defaultAddress}
									disabled={true}
								/>
							</Form.Item>
						</div>
						<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
							<CancelBtn onClick={() => setShowAddressModal(false)}/>
							<ModalBtn loading={addAddressLoading} disabled={!addAddressName || !defaultAddress} title='Add' onClick={handleAddAddress} />
						</div>
					</Form>
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
					recipients={transactionType === ETransactionType.SEND_TOKEN ? recipientAndAmount.map((item) => item.recipient) : []}
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
						{selectType ? <SelectTransactionType onContinue={() => setSelectType(false)} transactionType={transactionType} setTransactionType={setTransactionType}  /> :
							<>
								{initiatorBalance.lte(totalDeposit.add(totalGas)) && !fetchBalancesLoading ? <section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
									<WarningCircleIcon />
									<p>The Free Balance in your logged in account {addressBook.find((item) => item.address === address)?.name} is less than the Minimum Deposit({formatBnBalance(totalDeposit.add(totalGas), { numberAfterComma: 3, withUnit: true }, network)}) required to create a Transaction.</p>
								</section>
									:
									<Skeleton className={`${!fetchBalancesLoading && 'opacity-0'}`} active paragraph={{ rows: 0 }}/>
								}
								{transactionType !== ETransactionType.CALL_DATA && amount.gt((new BN(multisigBalance)).sub(inputToBn(`${chainProperties[network].existentialDeposit}`, network, false)[0])) && <section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
									<WarningCircleIcon />
									<p>The Multisig Balance will Drop below its Existential Deposit and it won&apos;t be onchain anymore, you may also lose your assets in it.</p>
								</section>
								}
								<Form
									className={classNames('max-h-[68vh] overflow-y-auto px-2')}
									form={form}
									validateMessages={
										{ required: "Please add the '${name}'" }
									}
								>
									<section>
										<p className='text-primary font-normal text-xs leading-[13px]'>From</p>
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
									{transactionType === ETransactionType.CALL_DATA
										?
										<>
											<section className={`${className}`}>
												<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Call Data</label>
												<div className='flex items-center gap-x-[10px]'>
													<article className='w-full'>
														<Form.Item
															className='border-0 outline-0 my-0 p-0'
															name="call-data"
															rules={[{ required: true }]}
															validateStatus={!callData || !callHash ? 'error' : 'success'}
															help={(!callData || !callHash) && ('Please enter Valid Call Data')}
														>
															<Input
																id="call-data"
																onChange={(e) => setCallData(e.target.value)}
																placeholder={'Enter Call Data'}
																value={callData}
																className="w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20"
															/>
														</Form.Item>
													</article>
												</div>
											</section>
										</>
										:
										<>

											<section className=''>
												<div className='flex items-start gap-x-[10px]'>
													<div>
														<div className='flex flex-col gap-y-3 mb-2'>
															{recipientAndAmount.map(({ recipient }, i) => (
																<article key={recipient} className='w-[500px] flex items-start gap-x-2'>
																	<AddAddressModal defaultAddress={recipient} />
																	<div className='w-[55%]'>
																		<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient*</label>
																		<Form.Item
																			name="recipient"
																			rules={[{ required: true }]}
																			help={(!recipient && 'Recipient Address is Required') || (!validRecipient[i] && 'Please add a valid Address')}
																			className='border-0 outline-0 my-0 p-0'
																			validateStatus={recipient && validRecipient[i] ? 'success' : 'error'}
																		>
																			<div className='h-[50px]'>
																				{recipient && autocompleteAddresses.some((item) => item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(recipient)) ?
																					<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
																						{autocompleteAddresses.find((item) => item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(recipient))?.label}
																						<button
																							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
																							onClick={() => {
																								onRecipientChange('', i);
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
																							return inputValue && options?.value ? getSubstrateAddress(String(options?.value) || '') === getSubstrateAddress(inputValue) : true;
																						}}
																						notFoundContent={validRecipient[i] && <Button icon={<PlusCircleOutlined className='text-primary' />} className='bg-transparent border-none outline-none text-primary text-sm flex items-center' onClick={() => setShowAddressModal(true)} >Add Address to Address Book</Button>}
																						options={autocompleteAddresses.filter((item) => !recipientAndAmount.some((r) => r.recipient && item.value && getSubstrateAddress(r.recipient) === getSubstrateAddress(String(item.value) || '')))}
																						id='recipient'
																						placeholder="Send to Address.."
																						onChange={(value) => onRecipientChange(value, i)}
																						value={recipientAndAmount[i].recipient}
																						defaultValue={defaultSelectedAddress || ''}
																					/>
																				}
																			</div>
																		</Form.Item>
																	</div>
																	<div className='flex items-center gap-x-2 w-[45%]'>
																		<BalanceInput label='Amount*' fromBalance={multisigBalance} onChange={(balance) => onAmountChange(balance, i)} />
																		{i !== 0 && <Button
																			onClick={() => onRemoveRecipient(i)}
																			className='text-failure border-none outline-none bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
																			<DeleteIcon />
																		</Button>}
																	</div>
																</article>
															))}
														</div>
														<Button icon={<PlusCircleOutlined className='text-primary' />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center' onClick={onAddRecipient} >Add Another Recipient</Button>
													</div>
													<div className='flex flex-col gap-y-4'>
														<article className='w-[412px] flex items-center'>
															<span className='-mr-1.5 z-0'>
																<LineIcon className='text-5xl' />
															</span>
															<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>The beneficiary will have access to the transferred fees when the transaction is included in a block.</p>
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
												</div>
											</section>

											{callData && !recipientAndAmount.some(item => item.recipient === '' || item.amount.isZero()) &&
												<section className='mt-[15px]'>
													<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Call Data</label>
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
										</>
									}

									<section className='mt-[15px]'>
										<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Existential Deposit</label>
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
										<div className='flex items-center gap-x-[10px]'>
											<div className='w-[500px]'>
												<BalanceInput placeholder='1' label='Tip' fromBalance={initiatorBalance} onChange={(balance) => setTip(balance)} />
											</div>
											<article className='w-[412px] flex items-center'>
												<span className='-mr-1.5 z-0'>
													<LineIcon className='text-5xl' />
												</span>
												<p className='p-3 w-full bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>
												Speed up transactions by including a Tip.
												</p>
											</article>
										</div>
									</section>

									<section className='mt-[15px] w-[500px]'>
										<label className='text-primary font-normal text-xs block mb-[5px]'>Category*</label>
										<Form.Item
											name='category'
											rules={[{ message: 'Required', required: true }]}
											className='border-0 outline-0 my-0 p-0'
										>
											<Dropdown
												trigger={['click']}
												className={'border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'}
												menu={{
													items: [
														...Object.keys(transactionFields).filter(c => c !== 'none').map((c) => ({
															key: c,
															label: <span className='text-white'>{transactionFields[c]?.fieldName}</span>
														})),
														{
															key: 'none',
															label: <span className='text-white'>Other</span>
														}
													],
													onClick: (e) => setCategory(e.key)
												}}
											>
												<div className="flex justify-between items-center text-white">
													{transactionFields[category]?.fieldName}
													<CircleArrowDownIcon className='text-primary' />
												</div>
											</Dropdown>
										</Form.Item>
									</section>

									{transactionFields[category] && transactionFields[category].subfields && Object.keys(transactionFields[category].subfields).map((subfield) => {
										const subfieldObject = transactionFields[category].subfields[subfield];
										return (
											<section key={subfield} className='mt-[15px]'>
												<label className='text-primary font-normal text-xs block mb-[5px]'>{subfieldObject.subfieldName}{subfieldObject.required && '*'}</label>
												<div className=''>
													<article className='w-[500px]'>
														{subfieldObject.subfieldType === EFieldType.SINGLE_SELECT && subfieldObject.dropdownOptions ?
															<Form.Item
																name={`${subfieldObject.subfieldName}`}
																rules={[{ message: 'Required', required: subfieldObject.required }]}
																className='border-0 outline-0 my-0 p-0'
																// help={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required && `${subfieldObject.subfieldName} is Required.`}
																// validateStatus={(!transactionFieldsObject.subfields[subfield]?.value) && subfieldObject.required ? 'error' : 'success'}
															>
																<Dropdown
																	trigger={['click']}
																	className={'border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'}
																	menu={{
																		items: subfieldObject.dropdownOptions?.filter((item) => !item.archieved).map((item) => ({
																			key: item.optionName,
																			label: <span className='text-white'>{item.optionName}</span>
																		})),
																		onClick: (e) => {
																			setTransactionFieldsObject(prev => ({
																				category: transactionFields[category].fieldName,
																				subfields: {
																					...prev.subfields,
																					[subfield]: {
																						name: subfieldObject.subfieldName,
																						value: e.key
																					}
																				}
																			}));
																		}
																	}}
																>
																	<div className="flex justify-between items-center text-white">
																		{transactionFieldsObject.subfields[subfield]?.value ? transactionFieldsObject.subfields[subfield]?.value : <span className='text-text_secondary'>Select {subfieldObject.subfieldName}</span>}
																		<CircleArrowDownIcon className='text-primary' />
																	</div>
																</Dropdown>
															</Form.Item>
															:
															subfieldObject.subfieldType === EFieldType.ATTACHMENT
																?
																<UploadAttachment setSubfieldAttachments={setSubfieldAttachments} subfield={subfield} />
																:
																<Form.Item
																	name={subfield}
																	rules={[{ message: 'Required', required: subfieldObject.required }]}
																	className='border-0 outline-0 my-0 p-0'
																>
																	<div className='flex items-center h-[40px]'>
																		<Input
																			placeholder={`${subfieldObject.subfieldName}`}
																			className="w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24 resize-none"
																			id={subfield}
																			value={transactionFieldsObject.subfields[subfield]?.value}
																			onChange={(e) => setTransactionFieldsObject(prev => ({
																				category: transactionFields[category].fieldName,
																				subfields: {
																					...prev.subfields,
																					[subfield]: {
																						name: subfieldObject.subfieldName,
																						value: e.target.value
																					}
																				}
																			}))}
																		/>
																	</div>
																</Form.Item>}
													</article>
												</div>
											</section>
										);
									})}

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
												<Switch checked={transferKeepAlive} onChange={checked => setTransferKeepAlive(checked)}  size='small' className='text-primary' />
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
									<ModalBtn disabled={
										(transactionType === ETransactionType.SEND_TOKEN && (
											recipientAndAmount.some((item) => item.recipient === '' || item.amount.isZero() || item.amount.gte(new BN(multisigBalance)))
								|| (transferKeepAlive && amount.gt((new BN(multisigBalance)).sub(inputToBn(`${chainProperties[network].existentialDeposit}`, network, false)[0])))
								|| amount.gt(new BN(multisigBalance))
								|| validRecipient.includes(false)
								|| initiatorBalance.lt(totalDeposit.add(totalGas))
										))
								||
								(transactionType === ETransactionType.CALL_DATA && (!callData || !callHash))
								|| Object.keys(transactionFields[category].subfields).some((key) => (transactionFields[category].subfields[key].subfieldType === EFieldType.ATTACHMENT ? (transactionFields[category].subfields[key].required && !subfieldAttachments[key]?.file) :  (!transactionFieldsObject.subfields[key]?.value && transactionFields[category].subfields[key].required)))}
									loading={loading}
									onClick={handleSubmit}
									className='w-[250px]'
									title='Make Transaction'
									/>
								</section>
							</>}
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
		height: 100% !important;
	}
	.ant-select-selector {
		border: none !important;
		height: 50px !important; 
		box-shadow: none !important;
	}

	.ant-select {
		height: 50px !important;
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

	.ant-dropdown {
		transform: scale(0.9) !important;
		transform-origin: center !important;
	}
`;
