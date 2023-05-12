// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { Form, Input, InputNumber, Modal, Spin, Switch } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from 'src/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';
import { NotificationStatus } from 'src/types';
import { DashDotIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import ProxyImpPoints from 'src/ui-components/ProxyImpPoints';
import queueNotification from 'src/ui-components/QueueNotification';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { inputToBn } from 'src/utils/inputToBn';
import { setSigner } from 'src/utils/setSigner';
import { transferFunds } from 'src/utils/transferFunds';

import AddAddress from '../AddressBook/AddAddress';
import DragDrop from '../Multisig/DragDrop';
import Search from '../Multisig/Search';
import AddProxy from './AddProxy';
import Signatory from './Signatory';

interface IMultisigProps {
	className?: string
	onCancel?: () => void
	isModalPopup?:boolean
	homepage?: boolean
}

const CreateMultisig: React.FC<IMultisigProps> = ({ onCancel, homepage=false }) => {
	const { setUserDetailsContextState, address: userAddress, multisigAddresses, loggedInWallet } = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [uploadSignatoriesJson, setUploadSignatoriesJson] = useState(false);

	const [multisigName, setMultisigName] = useState<string>('');
	const [threshold, setThreshold] = useState<number | null>(2);
	const [signatories, setSignatories] = useState<string[]>([userAddress]);
	const { openModal, toggleVisibility } = useModalContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');
	const [addAddress, setAddAddress] = useState<string>('');
	const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
	const [cancelCreateProxy, setCancelCreateProxy] = useState<boolean>(false);
	const [form] = Form.useForm();

	const [createMultisigData, setCreateMultisigData] = useState<IMultisigAddress>({} as any);

	const createProxy = (multisigData: IMultisigAddress, create: boolean) => {
		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				activeMultisig: multisigData.address,
				multisigAddresses: [...(prevState?.multisigAddresses || []), multisigData],
				multisigSettings: {
					...prevState.multisigSettings,
					[multisigData.address]: {
						name: multisigData.name,
						deleted: false
					}
				}
			};
		});
		onCancel?.();
		if(create){
			openModal('Create Proxy', <AddProxy onCancel={() => toggleVisibility()} />);
		}
	};

	const addExistentialDeposit = async (multisigData: IMultisigAddress) => {
		if(!api || !apiReady ) return;

		await setSigner(api, loggedInWallet);

		setLoading(true);
		setLoadingMessages(`Please Sign To Add A Small (${chainProperties[network].existentialDeposit} ${chainProperties[network].tokenSymbol}) Existential Deposit To Make Your Multisig Onchain.`);
		try {
			await transferFunds({
				amount: inputToBn(`${chainProperties[network].existentialDeposit}`, network, false)[0],
				api,
				network,
				recepientAddress: multisigData.address,
				senderAddress: getSubstrateAddress(userAddress) || userAddress,
				setLoadingMessages
			});
			if(network === 'astar'){
				createProxy(multisigData, false);
			}
			else{
				setSuccess(true);
			}
			setLoading(false);
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoading(false);
			createProxy(multisigData, false);
		}
	};

	const handleMultisigCreate = async () => {
		try{
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!address || !signature) {
				console.log('ERROR');
				return;
			}
			else{
				setLoading(true);
				setLoadingMessages('Creating Your Multisig.');
				const createMultisigRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createMultisig`, {
					body: JSON.stringify({
						signatories,
						threshold,
						multisigName
					}),
					headers: firebaseFunctionsHeader(network, address, signature),
					method: 'POST'
				});

				const { data: multisigData, error: multisigError } = await createMultisigRes.json() as { error: string; data: IMultisigAddress};

				if(multisigError) {
					queueNotification({
						header: 'Error!',
						message: multisigError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					setFailure(true);
					return;
				}

				if(multisigData){
					if(multisigAddresses?.some((item) => item.address === multisigData.address && !item.disabled)){
						queueNotification({
							header: 'Multisig Exist!',
							message: 'Please try adding a different multisig.',
							status: NotificationStatus.WARNING
						});
						setLoading(false);
						return;
					}
					queueNotification({
						header: 'Success!',
						message: `Your Multisig ${multisigName} has been created successfully!`,
						status: NotificationStatus.SUCCESS
					});
					setCreateMultisigData(multisigData);
					await addExistentialDeposit(multisigData);
				}

			}
		} catch (error){
			console.log('ERROR', error);
		}
	};

	const AddAddressModal: FC = () => {
		return (
			<>
				<PrimaryButton onClick={() => setShowAddressModal(true)} className='bg-primary text-white w-fit'>
					<p className='font-normal text-sm'>Add</p>
				</PrimaryButton>
				<Modal width={600} onCancel={() => setShowAddressModal(false)} footer={null} open={showAddressModal}>
					<AddAddress setSignatories={setSignatories} onCancel={() => setShowAddressModal(false)} addAddress={addAddress} setAddAddress={setAddAddress} />
				</Modal>
			</>
		);
	};

	const CreateMultisigSuccessScreen: FC = () => {
		return (
			<div className='flex flex-col h-full'>
				<SuccessTransactionLottie message='Multisig created successfully!'/>
				<div className='w-full flex justify-center my-3 flex-1 text-left'>
					<ProxyImpPoints />
				</div>
				<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
					<CancelBtn onClick={() => setCancelCreateProxy(true)}/>
					<AddBtn title='Create Proxy' onClick={() => createProxy(createMultisigData, true)} />
				</div>
			</div>
		);
	};

	const CancelProxyCreation: FC = () => {
		return (
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setCancelCreateProxy(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Cancel Create Proxy</h3>}
				open={cancelCreateProxy}
				className={' w-auto md:min-w-[500px]'}
			>
				<div className='flex flex-col h-full'>
					<div className='w-full flex justify-center my-3 flex-1'>
						<ProxyImpPoints />
					</div>
					<div className='text-white'>Are you sure you don&apos;t want to create proxy right now?</div>
					<div className='flex items-center justify-between mt-[40px]'>
						<CancelBtn onClick={() => createProxy(createMultisigData, false)}/>
						<AddBtn title='No, Create Proxy' onClick={() => setCancelCreateProxy(false)} />
					</div>
				</div>
			</Modal>
		);
	};

	return (
		<>
			<Spin spinning={loading || success || failure} indicator={loading ? <LoadingLottie message={loadingMessages} /> : success ? <CreateMultisigSuccessScreen/> : <FailedTransactionLottie message='Failed!' />}>
				<CancelProxyCreation/>
				<Form
					form={form}
					validateMessages={
						{ required: "Please add the '${name}'" }
					}
				>
					<div className={`flex flex-col relative ${!homepage && 'max-h-[68vh] overflow-y-auto px-3 py-2'}`}>
						<div className={classNames(
							`${homepage ? '' : 'w-[80vw]'}  flex justify-between items-end`,
							{
								'w-auto':onCancel
							}
						)}>
							<div className='relative'>
								<div className='flex items-center justify-between'>
									{!uploadSignatoriesJson?<div className="flex items-center justify-between w-[45vw] gap-x-4">
										<Search addAddress={addAddress} setAddAddress={setAddAddress} />
										<AddAddressModal/>
									</div>:null}
									<div className='flex flex-col items-end justify-center absolute top-1 right-1 z-50'>
										<div className='flex items-center justify-center mb-2'>
											<p className='mx-2 text-white'>Upload JSON file with signatories</p><Switch size='small' onChange={(checked) => setUploadSignatoriesJson(checked)} />
										</div>
									</div>
								</div>
								<Form.Item
									name="signatories"
									rules={[{ required: true }]}
									help={signatories.length < 2 && 'Multisig Must Have Atleast 2 Signatories.'}
									className='border-0 outline-0 my-0 p-0'
									validateStatus={signatories.length < 2 ? 'error' : 'success'}
								>
									<div className='w-full flex items-center justify-between'>
										{!uploadSignatoriesJson? <Signatory homepage={homepage} filterAddress={addAddress} setSignatories={setSignatories} signatories={signatories}/> : <DragDrop setSignatories={setSignatories} />}
										<DashDotIcon className='mt-5'/>
										<div className='w-[40%] overflow-auto'>
											<br />
											{!uploadSignatoriesJson? <p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary'>The signatories has the ability to create transactions using the multisig and approve transactions sent by others. Once the threshold is reached with approvals, the multisig transaction is enacted on-chain.
										Since the multisig function like any other account, once created it is available for selection anywhere accounts are used and needs to be funded before use.
											</p> : <p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary'>Supply a JSON file with the list of signatories.</p>}
										</div>
									</div>
								</Form.Item>
								<div className='flex items-start justify-between'>
									<Form.Item
										name="threshold"
										rules={[{ required: true }]}
										help={(!threshold || threshold < 2) ? 'Threshold Must Be More Than 1.' : (threshold > signatories.length && signatories.length > 1) ? 'Threshold Must Be Less Than Or Equal To Selected Signatories.' : ''}
										className='border-0 outline-0 my-0 p-0'
										validateStatus={(!threshold || threshold < 2 || (threshold > signatories.length && signatories.length > 1) ) ? 'error' : 'success'}
									>
										<div className='w-[45vw]'>
											<p className='text-primary'>Threshold</p>
											<InputNumber onChange={(val) => setThreshold(val)} value={threshold} className= 'bg-bg-secondary placeholder:text-[#505050] text-white outline-none border-none w-full mt-2 py-2' placeholder='0' />
										</div>
									</Form.Item>
									<DashDotIcon className='mt-5'/>
									<div className='w-[40%] overflow-auto'>
										<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>The threshold for approval should be less or equal to the number of signatories for this multisig.</p>
									</div>
								</div>
								<div className='flex items-center justify-between'>
									<div className='w-[45vw]'>
										<p className='text-primary'>Name</p>
										<Input onChange={(e) => setMultisigName(e.target.value)} value={multisigName}  className= 'bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none w-full mt-2 py-2' placeholder='Give the MultiSig a unique name' />
									</div>
									<DashDotIcon className='mt-5'/>
									<div className='w-[40%] overflow-auto'>
										<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>The name is for unique identification of the account in your owner lists.</p>
									</div>
								</div>
							</div>
						</div>
						<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
							<CancelBtn onClick={onCancel}/>
							<AddBtn disabled={signatories.length < 2 || !threshold || threshold < 2 || threshold > signatories.length || !multisigName} loading={loading} title='Create Multisig' onClick={handleMultisigCreate} />
						</div>
					</div>
				</Form>
			</Spin>
		</>
	);
};

export default CreateMultisig;
