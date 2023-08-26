// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PlusCircleOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, Spin, Tooltip } from 'antd';
import React, { useState } from 'react';
import AddMultisigSVG from 'src/assets/add-multisig.svg';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import RemoveMultisigSVG from 'src/assets/remove-multisig.svg';
import AddProxySuccessScreen from 'src/components/Multisig/AddProxySuccessScreen';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import Loader from 'src/components/UserFlow/Loader';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress, NotificationStatus } from 'src/types';
import { WarningCircleIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import _createMultisig from 'src/utils/_createMultisig';
import { addNewMultiToProxy } from 'src/utils/addNewMultiToProxy';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { removeOldMultiFromProxy } from 'src/utils/removeOldMultiFromProxy';
import { setSigner } from 'src/utils/setSigner';
import styled from 'styled-components';

interface ISignatory{
	name: string
	address: string
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

const AddOwner = ({ onCancel, className }: { onCancel?: () => void, className?: string }) => {
	const { multisigAddresses, activeMultisig, addressBook, address, setUserDetailsContextState, loggedInWallet } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const [txnHash, setTxnHash] = useState<string>('');
	const [newThreshold, setNewThreshold] = useState<number>(multisig?.threshold || 2);

	const [signatoriesArray, setSignatoriesArray] = useState<ISignatory[]>([{ address: '', name: '' }]);

	const onSignatoryChange = (value: any, i: number) => {
		setSignatoriesArray((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.address = value;
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
								[`${multisigData.address}_${multisigData.network}`]: {
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

		await setSigner(api, loggedInWallet);

		const newSignatories = [...multisig!.signatories, ...signatoriesArray.map((item) => item.address)];

		const newMultisigAddress = _createMultisig(newSignatories, newThreshold, chainProperties[network].ss58Format);
		if(multisigAddresses.some((item) => item.address === newMultisigAddress.multisigAddress)){
			queueNotification({
				header: 'Multisig Exists',
				message: 'The new edited multisig already exists in your multisigs.',
				status: NotificationStatus.WARNING
			});
			return;
		}

		setLoading(true);
		try {
			setLoadingMessages('Please Sign The First Transaction to Add New Multisig To Proxy.');
			await addNewMultiToProxy({
				api,
				network,
				newSignatories,
				newThreshold,
				oldMultisigAddress: multisig?.address || activeMultisig,
				oldSignatories: multisig?.signatories || [],
				oldThreshold: multisig?.threshold || 2,
				proxyAddress: multisig?.proxy || '',
				recepientAddress: activeMultisig,
				senderAddress: getSubstrateAddress(address) || address,
				setLoadingMessages,
				setTxnHash
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
			await handleMultisigCreate(newSignatories, newThreshold);
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoading(false);
			setTimeout(() => setFailure(false), 5000);
		}
	};

	return (
		<>
			{success ? <AddProxySuccessScreen
				createdBy={address}
				signatories={multisig?.signatories || []}
				threshold={multisig?.threshold || 2}
				txnHash={txnHash}
				onDone={() => onCancel?.()}
				successMessage='Multisig Edit in Progress!'
				waitMessage='All threshold signatories need to sign the Transaction to Edit the Multisig.'
			/>
				:
				failure ? <FailedTransactionLottie message='Failed!'/>
					:
					<Spin spinning={loading} indicator={<LoadingLottie message={loadingMessages} />}>
						<Form
							className={`my-0 w-[560px] ${className}`}
						>
							<div className="flex justify-center gap-x-4 items-center mb-6 w-full">
								<div className='flex flex-col text-white items-center justify-center'>
									<img src={AddMultisigSVG} />
									<p className='text-text_secondary'>Add New Multisig</p>
								</div>
								<Loader className='bg-primary h-[2px] w-[80px]'/>
								<div className='flex flex-col text-white items-center justify-center'>
									<img src={RemoveMultisigSVG} />
									<p className='text-text_secondary'>Remove Old Multisig</p>
								</div>
							</div>
							<section className='mb-4 w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[16px] flex items-center gap-x-[11px]'>
								<span>
									<WarningCircleIcon className='text-base' />
								</span>
								<p>Adding Signatories would require you to sign two transactions and approval from other signatories.</p>
							</section>
							<div className="max-h-[40vh] overflow-y-auto">
								{signatoriesArray.map((signatory, i) => (
									<div className="flex flex-col gap-y-2 max-h-[20vh] overflow-y-auto" key={i}>
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
													name={`Address-${i+1}`}
													rules={[{ required: true }]}
												>
													<label
														className="text-primary text-xs leading-[13px] font-normal"
													>Address {i+1}</label>
													<AutoComplete
														onClick={addRecipientHeading}
														options={addressBook.filter((item) => !signatoriesArray.some((e) => e.address === item.address) && !multisig?.signatories.includes(item.address)).map((item) => ({
															label: item.name,
															value: item.address
														}))}
														id={`Address-${i+1}`}
														placeholder={`Address ${i+1}`}
														onChange={(value) => onSignatoryChange(value, i)}
													/>
												</Form.Item>
											</div>
											{i !== 0 && <Button className='bg-bg-secondary rounded-lg text-white border-none outline-none ' onClick={() => onRemoveSignatory(i)}>-</Button>}
											{i === signatoriesArray.length - 1 &&
												<Tooltip title='Add Another Signatory' >
													<Button size='large' onClick={() => onAddSignatory()} className='rounded-lg outline-none border-none bg-highlight text-primary flex justify-center items-center'>
														<PlusCircleOutlined />
													</Button>
												</Tooltip>
											}
										</div>
									</div>
								))}
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
										<Tooltip title={newThreshold === 2 && 'Minimum Threshold must be 2'}>
											<Button
												onClick={() => {
													if (newThreshold !== 2) {
														setNewThreshold(prev => prev - 1);
													}
												}}
												className={`p-0 outline-none border rounded-full flex items-center justify-center ${newThreshold === 2 ? 'border-text_secondary text-text_secondary' : 'text-primary border-primary'} w-[14.5px] h-[14.5px]`}>
												-
											</Button>
										</Tooltip>
										<span
											className='text-white text-sm'
										>
											{newThreshold}
										</span>
										<Tooltip title={newThreshold === (multisig?.signatories.length || 0) + signatoriesArray.length && 'Threshold must be Less than or Equal to Signatories'}>
											<Button
												onClick={() => {
													if (newThreshold < (multisig?.signatories.length || 0) + signatoriesArray.length) {
														setNewThreshold(prev => prev + 1);
													}
												}}
												className={`p-0 outline-none border rounded-full flex items-center justify-center ${newThreshold === (multisig?.signatories.length || 0) + signatoriesArray.length ? 'border-text_secondary text-text_secondary' : 'text-primary border-primary'} w-[14.5px] h-[14.5px]`}>
												+
											</Button>
										</Tooltip>
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
								<AddBtn onClick={changeMultisig} loading={loading} disabled={!signatoriesArray.length || signatoriesArray.some((item) => item.address === '' || multisig?.signatories.includes(item.address))} title='Add' />
							</div>
						</Form>
					</Spin>}
		</>
	);
};

export default styled(AddOwner)`
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