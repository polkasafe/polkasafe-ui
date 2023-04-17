// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Signer } from '@polkadot/api/types';
import { Button, Form, Input, Spin } from 'antd';
import React, { useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from 'src/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import Loader from 'src/components/UserFlow/Loader';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import { IMultisigAddress } from 'src/types';
import { addNewMultiToProxy } from 'src/utils/addNewMultiToProxy';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { removeOldMultiFromProxy } from 'src/utils/removeOldMultiFromProxy';

interface ISignatory{
	name: string
	address: string
}

const AddOwner = ({ onCancel }: { onCancel?: () => void }) => {
	const [newThreshold, setNewThreshold] = useState(2);
	const { signersMap, accountsMap } = useGetAllAccounts();
	const { multisigAddresses, activeMultisig, address, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');

	const [signatoriesArray, setSignatoriesArray] = useState<ISignatory[]>([{ address: '', name: '' }]);

	const onSignatoryChange = (event: any, i: number) => {
		setSignatoriesArray((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.address = event.target.value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onNameChange = (event: any, i: number) => {
		setSignatoriesArray((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.name = event.target.value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddSignatory = () => {
		setSignatoriesArray((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ address: '', name: '' });
			return copyOptionsArray;
		});
	};

	const onRemoveSignatory = (i: number) => {
		const copyOptionsArray = [...signatoriesArray];
		copyOptionsArray.splice(i, 1);
		setSignatoriesArray(copyOptionsArray);
	};

	const handleMultisigCreate = async (newSignatories: string[], newThreshold: number) => {
		try{
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!address || !signature || !newSignatories || !newThreshold) {
				console.log('ERROR');
				return;
			}
			else{
				setLoadingMessages('Creating Your Proxy.');
				const createMultisigRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createMultisig`, {
					body: JSON.stringify({
						disabled: true,
						multisigName: multisig?.name,
						signatories: newSignatories,
						threshold: newThreshold
					}),
					headers: firebaseFunctionsHeader(network, address, signature),
					method: 'POST'
				});

				const { data: multisigData, error: multisigError } = await createMultisigRes.json() as { error: string; data: IMultisigAddress};

				if(multisigError) {
					return;
				}

				if(multisigData){
					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							multisigAddresses: [...(prevState?.multisigAddresses || []), multisigData],
							multisigSettings: {
								...prevState.multisigSettings,
								[multisigData.address]: {
									deleted: false,
									name: multisigData.name
								}
							}
						};
					});
				}

			}
		} catch (error){
			console.log('ERROR', error);
		}
	};

	const changeMultisig = async () => {
		if(!api || !apiReady ) return;

		const encodedSender = getEncodedAddress(address, network) || '';

		const wallet = accountsMap[encodedSender];
		if(!signersMap[wallet]) {console.log('no signer wallet'); return;}

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		const newSignatories = [...multisig!.signatories, ...signatoriesArray.map((item) => item.address)];

		setLoading(true);
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
			await handleMultisigCreate(newSignatories, newThreshold);
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
				<div className="flex justify-center gap-x-4 items-center mb-6 w-full">
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>1</div>
						<p className='text-text_secondary'>Add New Multisig</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p className='text-text_secondary'>Remove Old Multisig</p>
					</div>
				</div>
				<>
					{signatoriesArray.map((signatory, i) => (
						<div className="flex flex-col gap-y-2" key={i}>
							<div className="flex items-center gap-x-4">
								<div className='flex-1 flex items-start gap-x-4'>
									<Form.Item>
										<label
											className="text-primary text-xs leading-[13px] font-normal"
										>Name {i+1}</label>
										<Input
											placeholder={`Name ${i+1}`}
											className=" text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
											value={signatory.name}
											onChange={(e) => onNameChange(e, i)}
										/>
									</Form.Item>
									<Form.Item
										className='w-full'
										name={`Address ${i+1}`}
										rules={[{ message: 'This is Required', required: true }]}
									>
										<label
											className="text-primary text-xs leading-[13px] font-normal"
										>Address {i+1}</label>
										<Input
											id={`Address ${i+1}`}
											placeholder={`Address ${i+1}`}
											className=" text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
											value={signatory.address}
											onChange={(e) => onSignatoryChange(e, i)}
										/>
									</Form.Item>
								</div>
								{i !== 0 && <Button className='bg-bg-secondary rounded-lg text-white border-none outline-none ' onClick={() => onRemoveSignatory(i)}>-</Button>}
							</div>
						</div>
					))}
					<div className='w-full flex justify-end'>
						<Button
							className='border-none text-white bg-primary'
							onClick={() => onAddSignatory()}>+</Button>
					</div>
				</>
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
									if (newThreshold < (multisig?.signatories.length || 0) + signatoriesArray.length) {
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
							out of <span className='text-white font-medium'>{(multisig?.signatories.length || 0) + signatoriesArray.length}</span> owners
						</p>
					</div>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn onClick={onCancel} />
					<AddBtn onClick={changeMultisig} loading={loading} disabled={!signatoriesArray.length || signatoriesArray.some((item) => item.address === '')} title='Add' />
				</div>
			</Form>
		</Spin>
	);
};

export default AddOwner;