// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Signer } from '@polkadot/api/types';
import Identicon from '@polkadot/react-identicon';
import { AutoComplete, Form, Modal, Spin } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from 'src/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { chainProperties } from 'src/global/networkConstants';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import AddressQr from 'src/ui-components/AddressQr';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import { CopyIcon, QRIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { transferFunds } from 'src/utils/transferFunds';
import styled from 'styled-components';

const FundMultisig = ({ className, onCancel, setNewTxn }: { className?: string, onCancel: () => void, setNewTxn?: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const { api, apiReady, network } = useGlobalApiContext();
	const { activeMultisig, multisigAddresses, addressBook } = useGlobalUserDetailsContext();

	const { accounts, accountsMap, noAccounts, signersMap } = useGetAllAccounts();

	const [selectedSender, setSelectedSender] = useState(getEncodedAddress(addressBook[0].address, network) || '');
	const [amount, setAmount] = useState(new BN(0));
	const [loading, setLoading] = useState(false);
	const [showQrModal, setShowQrModal] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);
	const [isValidSender, setIsValidSender] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState<string>('');

	useEffect(() => {
		if(!getSubstrateAddress(selectedSender)){
			setIsValidSender(false);
		}
		else{
			setIsValidSender(true);
		}
	}, [selectedSender]);

	const autocompleteAddresses: DefaultOptionType[] = accounts?.map((account) => ({
		label: addressBook?.find((item) => item.address === account.address)?.name || account.name || DEFAULT_ADDRESS_NAME,
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
		if(!api || !apiReady || noAccounts || !signersMap ) return;

		const encodedSender = getEncodedAddress(selectedSender, network) || '';

		const wallet = accountsMap[encodedSender];
		if(!signersMap[wallet]) {console.log('no signer wallet'); return;}

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		setLoading(true);
		try {
			await transferFunds({
				amount: amount,
				api,
				network,
				recepientAddress: activeMultisig,
				senderAddress: getSubstrateAddress(selectedSender) || selectedSender,
				setLoadingMessages
			});
			setLoading(false);
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
				onCancel();
				if(setNewTxn){
					setNewTxn(prev => !prev);
				}
			}, 7000);
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
		<Spin spinning={loading || success || failure} indicator={loading ? <LoadingLottie width={300} message={loadingMessages} /> : success ? <SuccessTransactionLottie message='Successful!'/> : <FailedTransactionLottie message='Failed!' />}>
			<div className={className}>

				<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Recipient</p>
				{/* TODO: Make into reusable component */}
				<div className=' p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center gap-x-4'>
					<div className='flex items-center justify-center w-10 h-10'>
						<Identicon
							className='image identicon mx-2'
							value={activeMultisig}
							size={30}
							theme={'polkadot'}
						/>
					</div>
					<div className='flex flex-col gap-y-[6px]'>
						<h4 className='font-medium text-sm leading-[15px] text-white'>{multisigAddresses?.find(a => a.address === activeMultisig)?.name }</h4>
						<p className='text-text_secondary font-normal text-xs leading-[13px]'>{activeMultisig}</p>
					</div>
					<Balance address={activeMultisig} />
				</div>

				<Form disabled={ loading }>
					<section className='mt-6'>
						<div className='flex items-center justify-between mb-2'>
							<label className='text-primary font-normal text-xs leading-[13px] block'>Sending from</label>
							<Balance address={selectedSender} />
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

					<BalanceInput className='mt-6' placeholder={String(chainProperties[network]?.existentialDeposit)} onChange={(balance) => setAmount(balance)} />

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
						<CancelBtn loading={loading} className='w-[300px]' onClick={onCancel} />
						<ModalBtn disabled={!selectedSender || !isValidSender || amount.isZero()} loading={loading} onClick={handleSubmit} className='w-[300px]' title='Make Transaction' />
					</section>
				</Form>
			</div>
		</Spin>
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