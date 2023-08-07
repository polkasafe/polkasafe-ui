// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MinusCircleOutlined,PlusCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message,Modal,Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { EMAIL_REGEX } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAddressBookItem, ISharedAddressBooks, NotificationStatus } from 'src/types';
import { OutlineCloseIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import styled from 'styled-components';

interface IMultisigProps {
	className?: string
	addAddress?: string
	onCancel?: () => void
	setAddAddress?: React.Dispatch<React.SetStateAction<string>>
}

const EditAddressModal = ({ className, confirm, open, onCancel }: { open: boolean, className?: string, onCancel: () => void, confirm: () => Promise<void>}) => {
	return (
		<>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={onCancel}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'></h3>}
				open={open}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<Form
					className='my-0 w-[560px]'
				>
					<p className='text-white font-medium text-sm leading-[15px]'>
						This will update the Address book for all Signatories of this Multisig, would you like to continue?
					</p>
					<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
						<CancelBtn onClick={onCancel}/>
						<AddBtn onClick={() => { confirm(); onCancel(); }} title='Yes' />
					</div>
				</Form>
			</Modal>
		</>
	);
};

const AddAddress: React.FC<IMultisigProps> = ({ addAddress, onCancel, setAddAddress, className }) => {
	const [messageApi, contextHolder] = message.useMessage();
	const { network } = useGlobalApiContext();
	const { addressBook, activeMultisig, multisigAddresses, setUserDetailsContextState } = useGlobalUserDetailsContext();

	const [address, setAddress] = useState<string>(addAddress || '');
	const [addressValid, setAddressValid] = useState<boolean>(true);
	const [name, setName] = useState<string>('');
	const [nickName, setNickName] = useState<string>('');
	const [showNickNameField, setShowNickNameField] = useState<boolean>(false);
	const [email, setEmail] = useState<string>('');
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [roles, setRoles] = useState<string[]>([]);
	const [discord, setDiscord] = useState<string>('');
	const [telegram, setTelegram] = useState<string>('');
	const [shared, setShared] = useState<boolean>(activeMultisig ? true : false);

	const [openConfirmationModal, setOpenConfirmationModal] = useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);

	const { setActiveMultisigContextState, records } = useActiveMultisigContext();

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	useEffect(() => {
		if(email){
			const validEmail = EMAIL_REGEX.test(email);
			if(validEmail){
				setEmailValid(true);
			}
			else{
				setEmailValid(false);
			}
		}
	}, [email]);

	useEffect(() => {
		if(getSubstrateAddress(address)){
			setAddressValid(true);
		}
		else {
			setAddressValid(false);
		}
	}, [address]);

	const handlePersonalAddressBookUpdate = async () => {
		if(!address || !name) return;

		if(!getSubstrateAddress(address)){
			messageApi.warning('Invalid address');
			return;
		}

		try{
			setLoading(true);
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			else{
				if(addressBook.some((item) => getSubstrateAddress(item.address) === getSubstrateAddress(address))){
					queueNotification({
						header: 'Address Exists',
						message: 'Please try editing the address.',
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				const addAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBook`, {
					body: JSON.stringify({
						address,
						discord,
						email,
						name,
						nickName,
						roles,
						telegram
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: addAddressData, error: addAddressError } = await addAddressRes.json() as { data: IAddressBookItem[], error: string };

				if(addAddressError) {

					queueNotification({
						header: 'Error!',
						message: addAddressError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(addAddressData){

					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							addressBook: addAddressData
						};
					});

					queueNotification({
						header: 'Success!',
						message: 'Your address has been added successfully!',
						status: NotificationStatus.SUCCESS
					});
					setLoading(false);
					if(onCancel){
						onCancel();
					}
					else{
						toggleVisibility();
					}
					if(setAddAddress){
						setAddAddress('');
					}

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleSharedAddressBookUpdate = async () => {
		if(!address || !name) return;

		if(!getSubstrateAddress(address)){
			messageApi.warning('Invalid address');
			return;
		}

		try{
			setLoading(true);
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			else{
				if(Object.keys(records).includes(getSubstrateAddress(address) || address)){
					queueNotification({
						header: 'Address Exists',
						message: 'Please try editing the address.',
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				const addAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateSharedAddressBook`, {
					body: JSON.stringify({
						address,
						discord,
						email,
						multisigAddress: multisig?.proxy ? multisig.proxy : activeMultisig,
						name,
						nickName,
						roles,
						telegram
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: addAddressData, error: addAddressError } = await addAddressRes.json() as { data: ISharedAddressBooks, error: string };

				if(addAddressError) {

					queueNotification({
						header: 'Error!',
						message: addAddressError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(addAddressData){

					setActiveMultisigContextState((prevState) => {
						return {
							...prevState,
							...addAddressData
						};
					});

					const copyAddressBook = [...addressBook];
					const updateIndex = copyAddressBook.findIndex((item) => getSubstrateAddress(item.address) === getSubstrateAddress(address));
					if(updateIndex > -1){
						copyAddressBook[updateIndex].nickName = nickName;
					}else {
						copyAddressBook.push({
							address: address,
							discord,
							email,
							name,
							nickName,
							roles,
							telegram
						});
					}
					setUserDetailsContextState(prev => {
						return {
							...prev,
							addressBook: copyAddressBook
						};
					});

					queueNotification({
						header: 'Success!',
						message: 'Your address has been added successfully!',
						status: NotificationStatus.SUCCESS
					});
					setLoading(false);
					if(onCancel){
						onCancel();
					}
					else{
						toggleVisibility();
					}
					if(setAddAddress){
						setAddAddress('');
					}

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const { toggleVisibility } = useModalContext();
	return (
		<>
			{contextHolder}
			<Spin spinning={loading} indicator={<LoadingLottie noWaitMessage message={'Updating Your Address Book'} />}>
				<EditAddressModal onCancel={() => setOpenConfirmationModal(false)} open={openConfirmationModal} confirm={handleSharedAddressBookUpdate}  />
				<Form
					className={`${className} add-address my-0 w-[560px] max-h-[75vh] px-2 overflow-y-auto`}
				>
					{activeMultisig && <section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
						<WarningCircleIcon />
						<div>
							<p className='mb-1'>This will update the Address book for every signatory, if you want to add only in your personal Address book, then deselect</p>
							<Checkbox className='text-white m-0 [&>span>span]:border-primary' checked={shared} onChange={(e) => setShared(e.target.checked)} >Save for All</Checkbox>
						</div>
					</section>}
					<div className="flex flex-col gap-y-3">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="name"
						>
							Name*
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
								onChange={(e) => setName(e.target.value)}
								value={name}
							/>
							{!showNickNameField &&
							<Button onClick={() => setShowNickNameField(true)} icon={<PlusCircleOutlined className='text-primary' rev={undefined} />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'>Add Nickname</Button>
							}
						</Form.Item>
					</div>
					{
						showNickNameField &&
						<div className="flex flex-col gap-y-3 mt-5">
							<label
								className="text-primary text-xs leading-[13px] font-normal"
								htmlFor="nick-name"
							>
								Nickname
							</label>
							<Form.Item
								name="nick-name"
								rules={[
									{
										message: 'Required',
										required: true
									}
								]}
								className='border-0 outline-0 my-0 p-0'
							>
								<Input
									placeholder="Give the address a Nickname"
									className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
									id="nick-name"
									onChange={(e) => setNickName(e.target.value)}
									value={nickName}
								/>
								<Button onClick={() => { setShowNickNameField(false); setNickName(''); }} icon={<MinusCircleOutlined className='text-primary' rev={undefined} />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'>Remove Nickname</Button>
							</Form.Item>
						</div>
					}
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="address"
						>
							Address*
						</label>
						<Form.Item
							name="address"
							rules={[{ message: 'Address Required', required: true }]}
							validateStatus={(address && !addressValid) ? 'error' : 'success'}
							help={address && !addressValid && 'Please enter a valid address'}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="Unique Address"
								className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="address"
								defaultValue={addAddress || ''}
								onChange={(e) => setAddress(e.target.value)}
								value={address}
							/>
						</Form.Item>
					</div>
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="email-address"
						>
							Email
						</label>
						<Form.Item
							name="email"
							className='border-0 outline-0 my-0 p-0'
							help={email && !emailValid && 'Please enter a valid Email.'}
							validateStatus={email && !emailValid ? 'error' : 'success'}
						>
							<Input
								type='email'
								placeholder="Email"
								className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="email-address"
								onChange={(e) => setEmail(e.target.value)}
								value={email}
							/>
						</Form.Item>
					</div>
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="discord"
						>
							Discord
						</label>
						<Form.Item
							name="discord"
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="Discord"
								className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="discord"
								onChange={(e) => setDiscord(e.target.value)}
								value={discord}
							/>
						</Form.Item>
					</div>
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="telegram"
						>
							Telegram
						</label>
						<Form.Item
							name="telegram"
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="Telegram"
								className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="telegram"
								onChange={(e) => setTelegram(e.target.value)}
								value={telegram}
							/>
						</Form.Item>
					</div>
					<div className="flex flex-col gap-y-3 mt-5">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
						>
							Role
						</label>
						<Form.Item
							name="role"
							className='border-0 outline-0 my-0 p-0'
						>
							<Select
								mode="tags"
								className={className}
								onChange={(value) => setRoles(value)}
								tokenSeparators={[',']}
								placeholder='Add Roles'
								notFoundContent={false}
							/>
						</Form.Item>
					</div>
				</Form>
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn onClick={onCancel ? onCancel : toggleVisibility}/>
					<AddBtn loading={loading} disabled={!name || !address || !addressValid || (!!email && !emailValid)} title='Add' onClick={shared ? () => setOpenConfirmationModal(true) : handlePersonalAddressBookUpdate} />
				</div>
			</Spin>
		</>
	);
};

export default styled(AddAddress)`

	.ant-select-selector {
		border: none !important;
		padding: 8px 10px;
		box-shadow: none !important;
		background-color: #24272E !important;
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

	.ant-select-multiple .ant-select-selection-item {
		border: none !important;
		background: #1573FE !important;
		border-radius: 5px !important;
		color: white !important;
		margin-inline-end: 10px !important;
	}
`;