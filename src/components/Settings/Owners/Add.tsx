// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Signer } from '@polkadot/api/types';
import { Form, Input, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from 'src/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import { addNewMultiToProxy } from 'src/utils/addNewMultiToProxy';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { removeOldMultiFromProxy } from 'src/utils/removeOldMultiFromProxy';

const AddOwner = ({ onCancel }: { onCancel?: () => void }) => {
	const [newThreshold, setNewThreshold] = useState(2);
	const { signersMap, accountsMap } = useGetAllAccounts();
	const { multisigAddresses, activeMultisig, address } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	const [newSignatories, setNewSignatories] = useState<string[]>(multisig?.signatories || []);
	const [newAddress, setNewAddress] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');

	useEffect(() => {
		if(newAddress){
			setNewSignatories(prev => {
				const copyArray = [...prev];
				copyArray[prev.length] = newAddress;
				return copyArray;
			});
		}
	}, [newAddress]);

	const changeMultisig = async () => {
		if(!api || !apiReady || !newAddress ) return;

		const encodedSender = getEncodedAddress(address, network) || '';

		const wallet = accountsMap[encodedSender];
		if(!signersMap[wallet]) {console.log('no signer wallet'); return;}

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		setLoading(true);
		console.log('signatories', newSignatories, newThreshold);
		try {
			setLoadingMessages('Please Sign The First Transaction to Add New Multisig To Proxy.');
			await addNewMultiToProxy({
				api,
				network,
				newSignatories,
				newThreshold,
				oldSignatories: multisig?.signatories || [],
				oldThreshold: multisig?.threshold || 2,
				proxyAddress: multisig?.proxy || '',
				recepientAddress: activeMultisig,
				senderAddress: getSubstrateAddress(address) || address,
				setLoadingMessages
			});
			setLoadingMessages('Please Sign The Second Transaction to Remove Old Multisig From Proxy.');
			await removeOldMultiFromProxy({
				api,
				multisigAddress: multisig?.address || '',
				network,
				newSignatories,
				newThreshold,
				proxyAddress: multisig?.proxy || '',
				recepientAddress: activeMultisig,
				senderAddress: getSubstrateAddress(address) || address,
				setLoadingMessages
			});
			setSuccess(true);
			setLoading(false);
			setTimeout(() => {
				setSuccess(false);
				onCancel?.();
			}, 7000);
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoading(false);
			setTimeout(() => setFailure(false), 5000);
		}
	};

	return (
		<Spin spinning={loading || success || failure} indicator={loading ? <LoadingLottie message={loadingMessages} /> : success ? <SuccessTransactionLottie message='Successful'/> : <FailedTransactionLottie message='Failed!' />}>
			<Form
				className='my-0 w-[560px]'
			>
				<div className="flex flex-col gap-y-3">
					<label
						className="text-primary text-xs leading-[13px] font-normal"
						htmlFor="name"
					>
						Owner Name <sup>*</sup>
					</label>
					<Form.Item
						name="name"
						rules={[]}
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder="Give the address a name"
							className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
							id="name"
						/>
					</Form.Item>
				</div>
				<div className="flex flex-col gap-y-3 mt-5">
					<label
						className="text-primary text-xs leading-[13px] font-normal"
						htmlFor="address"
					>
						Owner Address <sup>*</sup>
					</label>
					<Form.Item
						name="address"
						rules={[{ message: 'Please add the address.', required: true }]}
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder="Unique Address"
							className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
							id="address"
							onChange={(e) => setNewAddress(e.target.value)}
						/>
					</Form.Item>
				</div>
				<div className="flex flex-col gap-y-3 mt-5">
					<label
						className="text-primary text-xs leading-[13px] font-normal"
						htmlFor="address"
					>
						Threshold
					</label>
					<div
						className='flex items-center gap-x-3'
					>
						<p
							className='flex items-center justify-center gap-x-[16.83px] p-[12.83px] bg-bg-secondary rounded-lg'
						>
							<button
								onClick={() => {
									if (newThreshold !== 2) {
										setNewThreshold(prev => prev - 1);
									}
								}}
								className='text-primary border rounded-full flex items-center justify-center border-primary w-[14.5px] h-[14.5px]'>
								-
							</button>
							<span
								className='text-white text-sm'
							>
								{newThreshold}
							</span>
							<button
								onClick={() => {
									if (newThreshold < newSignatories.length) {
										setNewThreshold(prev => prev + 1);
									}
								}}
								className='text-primary border rounded-full flex items-center justify-center border-primary w-[14.5px] h-[14.5px]'>
								+
							</button>
						</p>
						<p
							className='text-text_secondary font-normal text-sm leading-[15px]'
						>
							out of <span className='text-white font-medium'>{newSignatories.length}</span> owners
						</p>
					</div>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn onClick={onCancel} />
					<AddBtn onClick={changeMultisig} loading={loading} disabled={!newAddress} title='Add' />
				</div>
			</Form>
		</Spin>
	);
};

export default AddOwner;