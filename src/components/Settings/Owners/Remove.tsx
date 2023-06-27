// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Button, Form, Spin, Tooltip } from 'antd';
import React, { useState } from 'react';
import AddMultisigSVG from 'src/assets/add-multisig.svg';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import RemoveMultisigSVG from 'src/assets/remove-multisig.svg';
import AddProxySuccessScreen from 'src/components/Multisig/AddProxySuccessScreen';
import CancelBtn from 'src/components/Settings/CancelBtn';
import RemoveBtn from 'src/components/Settings/RemoveBtn';
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

const RemoveOwner = ({ addressToRemove, oldThreshold, oldSignatoriesLength, onCancel }: { addressToRemove: string, oldThreshold: number, oldSignatoriesLength: number, onCancel: () => void }) => {
	const [newThreshold, setNewThreshold] = useState(oldThreshold === oldSignatoriesLength ? oldThreshold - 1 : oldThreshold);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const { multisigAddresses, activeMultisig, address: userAddress, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [txnHash] = useState<string>('');

	const multisig = multisigAddresses.find((item: any) => item.address === activeMultisig || item.proxy === activeMultisig);

	const handleMultisigCreate = async (newSignatories: string[], newThreshold: number) => {
		try {
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if (!address || !signature || !newSignatories || !newThreshold) {
				console.log('ERROR');
				return;
			}
			else {
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

				const { data: multisigData, error: multisigError } = await createMultisigRes.json() as { error: string; data: IMultisigAddress };

				if (multisigError) {
					return;
				}

				if (multisigData) {
					setUserDetailsContextState((prevState: any) => {
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
		} catch (error) {
			console.log('ERROR', error);
		}
	};

	const changeMultisig = async () => {

		const newSignatories = multisig && multisig.signatories.filter((item: any) => item !== addressToRemove) || [];

		const newMultisigAddress = _createMultisig(newSignatories, newThreshold, chainProperties[network].decimals);
		if (multisigAddresses.some((item: any) => item.address === newMultisigAddress.multisigAddress)) {
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
			setLoadingMessages('Please Sign The Second Transaction to Remove Old Multisig From Proxy.');

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
			{
				success ? <AddProxySuccessScreen
					createdBy={userAddress}
					signatories={multisig?.signatories || []}
					threshold={multisig?.threshold || 2}
					txnHash={txnHash}
					onDone={() => { onCancel?.(); setSuccess(false); }}
					successMessage='Multisig Edit in Progress!'
					waitMessage='All threshold signatories need to sign the Transaction to Edit the Multisig.'
				/>
					:
					failure ? <FailedTransactionLottie message='Failed!' />
						:
						<Spin spinning={loading} indicator={<LoadingLottie message={loadingMessages} />}>
							<Form
								className='my-0'
							>
								<div className="flex justify-center gap-x-4 items-center mb-6 w-full">
									<div className='flex flex-col text-white items-center justify-center'>
										<img src={AddMultisigSVG} />
										<p className='text-text_secondary'>Add New Multisig</p>
									</div>
									<Loader className='bg-primary h-[2px] w-[80px]' />
									<div className='flex flex-col text-white items-center justify-center'>
										<img src={RemoveMultisigSVG} />
										<p className='text-text_secondary'>Remove Old Multisig</p>
									</div>
								</div>
								<section className='mb-4 w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[16px] flex items-center gap-x-[11px]'>
									<span>
										<WarningCircleIcon className='text-base' />
									</span>
									<p>Removing a signatory would require you to sign two transactions and approval from other signatories.</p>
								</section>
								<div className='text-primary text-sm mb-2'>Remove Signatory*</div>
								<div className='flex items-center p-3 mb-4 text-text_secondary border-dashed border-2 border-bg-secondary rounded-lg gap-x-5'>
									<Identicon size={20} theme='polkadot' value={addressToRemove} />
									{addressToRemove}
								</div>
								<div className='text-primary text-sm mb-2'>New Threshold</div>
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
												className={`p-0 outline-none border rounded-full flex items-center justify-center ${newThreshold === 2 ? 'border-text_secondary text-text_secondary' : 'text-primary border-primary'} w-[14.5px] h-[14.5px]`}
											>
												-
											</Button>
										</Tooltip>
										<span
											className='text-white text-sm'
										>
											{newThreshold}
										</span>
										<Tooltip title={newThreshold === oldSignatoriesLength - 1 && 'Threshold must be Less than or Equal to Signatories'}>
											<Button
												onClick={() => {
													if (newThreshold < oldSignatoriesLength - 1) {
														setNewThreshold(prev => prev + 1);
													}
												}}
												className={`p-0 outline-none border rounded-full flex items-center justify-center ${newThreshold === oldSignatoriesLength - 1 ? 'border-text_secondary text-text_secondary' : 'text-primary border-primary'} w-[14.5px] h-[14.5px]`}>
												+
											</Button>
										</Tooltip>
									</p>
									<p
										className='text-text_secondary font-normal text-sm leading-[15px]'
									>
										out of <span className='text-white font-medium'>{oldSignatoriesLength - 1}</span> owners
									</p>
								</div>
								<div className='flex items-center justify-between gap-x-4 mt-[30px]'>
									<CancelBtn onClick={onCancel} />
									<RemoveBtn loading={loading} onClick={changeMultisig} />
								</div>
							</Form>
						</Spin>
			}
		</>
	);
};

export default RemoveOwner;