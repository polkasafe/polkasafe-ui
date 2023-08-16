// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Spin } from 'antd';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { NotificationStatus } from 'src/types';
import AddressComponent from 'src/ui-components/AddressComponent';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import TransactionSuccessScreen from './TransactionSuccessScreen';

const FundMultisig = ({ className, onCancel, setNewTxn }: { className?: string, onCancel: () => void, setNewTxn?: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const { network } = useGlobalApiContext();
	const { activeMultisig, addressBook, fetchMultisigData } = useGlobalUserDetailsContext();

	const { sendNativeToken } = useGlobalWeb3Context();

	const [selectedSender] = useState(addressBook[0].address);
	const [amount, setAmount] = useState('0');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure] = useState(false);
	const [loadingMessages] = useState<string>('');
	const [txnHash] = useState<string>('');
	const [selectedAccountBalance, setSelectedAccountBalance] = useState<string>('');

	const handleSubmit = async () => {
		setLoading(true);
		try {
			const { transactionHash, to } = await sendNativeToken(activeMultisig, ethers.utils.parseUnits(amount, 'ether'));
			await fetch(`${FIREBASE_FUNCTIONS_URL}/addTransactionEth`, {
				body: JSON.stringify({
					amount_token: ethers.utils.parseUnits(amount.toString(), 'ether').toString(),
					// eslint-disable-next-line sort-keys
					from: selectedSender, safeAddress: activeMultisig, data: '', txHash: transactionHash, to, note: '', type: 'fund', executed: true
				}),
				headers: firebaseFunctionsHeader(network, localStorage.getItem('address')!, localStorage.getItem('signature')!),
				method: 'POST'
			}).then(res => res.json());
			await fetchMultisigData();
			queueNotification({
				header: 'Success!',
				message: 'You have successfully completed the transaction. ',
				status: NotificationStatus.SUCCESS
			});
			setSuccess(true);
		} catch (err) {
			console.log('error from handleSubmit sendNativeToken', err);
			setNewTxn?.(prev => !prev);
			onCancel();
			queueNotification({
				header: 'Error!',
				message: 'Please try again',
				status: NotificationStatus.ERROR
			});

		}

		setLoading(false);
	};

	return (
		<>
			{success ? <TransactionSuccessScreen
				successMessage='Transaction Successful!'
				amount={amount}
				sender={selectedSender}
				recipient={activeMultisig}
				created_at={new Date()}
				txnHash={txnHash}
				onDone={() => {
					setNewTxn?.(prev => !prev);

				}}
			/>
				: failure ? <FailedTransactionLottie message='Failed!' />
					:
					<Spin spinning={loading} indicator={<LoadingLottie width={300} message={loadingMessages} />}>
						<div className={className}>

							<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Recipient</p>
							{/* TODO: Make into reusable component */}
							<div className=' p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center justify-between'>
								<AddressComponent withBadge={false} address={activeMultisig} />
								<Balance address={activeMultisig} />
							</div>

							<Form disabled={loading}>
								<section className='mt-6'>
									<div className='flex items-center justify-between mb-2'>
										<label className='text-primary font-normal text-xs leading-[13px] block'>Sending from</label>
										<Balance address={selectedSender} onChange={setSelectedAccountBalance} />
									</div>
									<div className='flex items-center gap-x-[10px]'>
										<div className='w-full'>
											{/* <Form.Item
												name="sender"
												rules={[{ required: true }]}
												help={!isValidSender && 'Please add a valid Address.'}
												className='border-0 outline-0 my-0 p-0'
												validateStatus={selectedSender && isValidSender ? 'success' : 'error'}
											>
												<div className="flex items-center">
													<AutoComplete
														filterOption={true}
														onClick={addSenderHeading}
														options={autocompleteAddresses}
														id='sender'
														placeholder="Send from Address.."
														onChange={(value) => setSelectedSender(value)}
														defaultValue={addressBook[0]?.address}
													/>
													<div className='absolute right-2'>
														<button onClick={() => copyText(selectedSender)}>
															<CopyIcon className='mr-2 text-primary' />
														</button>
														<QrModal />
													</div>
												</div>
											</Form.Item> */}
										</div>
									</div>
								</section>

								<BalanceInput fromBalance={selectedAccountBalance} className='mt-6' placeholder={'5'} onChange={(balance) => setAmount(balance)} />

								{/* <section className='mt-6'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Existential Deposit</label>
						<div className='flex items-center gap-x-[10px]'>
							<article className='w-full'>
								<Form.Item
									name="existential_deposit"
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
					</section> */}

								<section className='flex items-center gap-x-5 justify-center mt-10'>
									<CancelBtn loading={loading} className='w-[250px]' onClick={onCancel} />
									<ModalBtn
										disabled={amount == '0'}
										loading={loading} onClick={handleSubmit} className='w-[250px]' title='Make Transaction' />
								</section>
							</Form>
						</div>
					</Spin>
			}
		</>
	);
};

export default styled(FundMultisig)`
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