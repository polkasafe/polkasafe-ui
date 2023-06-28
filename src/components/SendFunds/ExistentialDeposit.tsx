// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { AutoComplete, Form, Input, Modal, Spin } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import useGetWalletAccounts from 'src/hooks/useGetWalletAccounts';
import AddressComponent from 'src/ui-components/AddressComponent';
import AddressQr from 'src/ui-components/AddressQr';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import { CopyIcon, QRIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { setSigner } from 'src/utils/setSigner';
import { transferFunds } from 'src/utils/transferFunds';
import styled from 'styled-components';

import { ParachainIcon } from '../NetworksDropdown';
import TransactionSuccessScreen from './TransactionSuccessScreen';

const ExistentialDeposit = ({ className, onCancel, setNewTxn }: { className?: string, onCancel: () => void, setNewTxn?: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const { api, apiReady, network } = useGlobalApiContext();
	const { activeMultisig, multisigAddresses, addressBook, loggedInWallet } = useGlobalUserDetailsContext();
	const { accounts } = useGetWalletAccounts(loggedInWallet);
	const { web3AuthUser } = useGlobalWeb3Context();

	const [selectedSender, setSelectedSender] = useState(getEncodedAddress(addressBook[0].address, network) || '');
	const [amount, setAmount] = useState(new BN(0));
	const [loading, setLoading] = useState(false);
	const [showQrModal, setShowQrModal] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);
	const [isValidSender, setIsValidSender] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const [txnHash, setTxnHash] = useState<string>('');
	const [selectedAccountBalance, setSelectedAccountBalance] = useState<string>('');
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	useEffect(() => {
		if(!getSubstrateAddress(selectedSender)){
			setIsValidSender(false);
		}
		else{
			setIsValidSender(true);
		}
	}, [selectedSender]);

	const autocompleteAddresses: DefaultOptionType[] = web3AuthUser ? web3AuthUser.accounts.map(item => ({
		label: <AddressComponent name={''} address={item} />,
		value: item
	})) : accounts?.map((account) => ({
		label: <AddressComponent name={account.name} address={account.address} />,
		value: account.address
	}));

	const addSenderHeading = () => {
		const elm = document.getElementById('recipient_list');
		if (elm) {
			const parentElm = elm.parentElement;
			if (parentElm) {
				const isElmPresent = document.getElementById('recipient_heading');
				if (!isElmPresent) {
					const recipientHeading = document.createElement('p');
					recipientHeading.textContent = 'Addresses';
					recipientHeading.id = 'recipient_heading';
					recipientHeading.classList.add('recipient_heading');
					parentElm.insertBefore(recipientHeading, parentElm.firstChild!);
				}
			}
		}
	};

	const handleSubmit = async () => {
		if(!api || !apiReady ) return;

		await setSigner(api, loggedInWallet);

		setLoading(true);
		try {
			await transferFunds({
				amount: amount,
				api,
				network,
				recepientAddress: multisig?.address || activeMultisig,
				senderAddress: getSubstrateAddress(selectedSender) || selectedSender,
				setLoadingMessages,
				setTxnHash
			});
			setLoading(false);
			setSuccess(true);
		} catch (error) {
			console.log(error);
			setLoading(false);
			setFailure(true);
			setTimeout(() => setFailure(false), 5000);
		}
	};

	const QrModal: FC = () => {
		return (
			<>
				<button onClick={() => setShowQrModal(true)}><QRIcon className='text-text_secondary' /></button>
				<Modal title={<span className='font-bold text-lg text-white' >Address QR</span>} onCancel={() => setShowQrModal(false)} open={showQrModal} footer={null}>
					<AddressQr address={selectedSender} />
				</Modal>
			</>
		);
	};

	return (
		<>
			{success ? <TransactionSuccessScreen
				successMessage='Existential Deposit Successful!'
				waitMessage='Your multisig is now on-chain.
				You can now, create a proxy which will allow you to change multisig configurations later.
				'
				amount={amount}
				sender={selectedSender}
				recipients={[multisig?.address || activeMultisig]}
				created_at={new Date()}
				txnHash={txnHash}
				onDone={() => {
					setNewTxn?.(prev => !prev);
					onCancel();
				}}
			/>
				: failure ? <FailedTransactionLottie message='Failed!' />
					:
					<Spin spinning={loading} indicator={<LoadingLottie message={loadingMessages} />}>
						<div className={className}>
							<section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
								<WarningCircleIcon />
								<p>The Existential Deposit is required to get your wallet On-Chain. This allows you to create transactions and perform other activities.</p>
							</section>

							<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Recipient</p>
							{/* TODO: Make into reusable component */}
							<div className=' p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center justify-between'>
								<AddressComponent withBadge={false} address={multisig?.address || activeMultisig} />
								<Balance address={multisig?.address || activeMultisig} />
							</div>

							<Form disabled={ loading }>
								<section className='mt-6'>
									<div className='flex items-center justify-between mb-2'>
										<label className='text-primary font-normal text-xs leading-[13px] block'>Sending from</label>
										<Balance address={selectedSender} onChange={setSelectedAccountBalance}/>
									</div>
									<div className='flex items-center gap-x-[10px]'>
										<div className='w-full'>
											<Form.Item
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
														defaultValue={getEncodedAddress(addressBook[0]?.address, network) || ''}
													/>
													<div className='absolute right-2'>
														<button onClick={() => copyText(selectedSender, true, network)}>
															<CopyIcon className='mr-2 text-primary' />
														</button>
														<QrModal />
													</div>
												</div>
											</Form.Item>
										</div>
									</div>
								</section>

								<BalanceInput fromBalance={selectedAccountBalance} defaultValue={String(chainProperties[network]?.existentialDeposit)} className='mt-6' placeholder={String(chainProperties[network]?.existentialDeposit)} onChange={(balance) => setAmount(balance) } />

								<section className='mt-6'>
									<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Existential Deposit</label>
									<div className='flex items-center gap-x-[10px]'>
										<article className='w-full'>
											<Form.Item
												name="existential_deposit"
												className='border-0 outline-0 my-0 p-0'
											>
												<div className='flex items-center'>
													<Input
														disabled={true}
														type='number'
														placeholder={String(chainProperties[network].existentialDeposit)}
														className="text-sm font-normal leading-[15px] outline-0 p-2.5 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24"
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

								<section className='flex items-center gap-x-5 justify-center mt-10'>
									<CancelBtn loading={loading} className='w-[250px]' onClick={onCancel} />
									<ModalBtn disabled={!selectedSender || !isValidSender || amount.isZero() ||  amount.gte(new BN(selectedAccountBalance))}  loading={loading} onClick={handleSubmit} className='w-[250px]' title='Make Transaction' />
								</section>
							</Form>
						</div>
					</Spin>}
		</>
	);
};

export default styled(ExistentialDeposit)`
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