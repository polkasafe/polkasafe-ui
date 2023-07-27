// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { MinusCircleOutlined,PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { EMAIL_REGEX } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAddressBookItem, ISharedAddressBooks } from 'src/types';
import { NotificationStatus } from 'src/types';
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import styled from 'styled-components';

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
						This will update the Address book of all Signatories of this Multisig, would you like to continue?
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

const EditAddress = ({ className, onCancel, addressToEdit, nameToEdit, nickNameToEdit, discordToEdit, emailToEdit, telegramToEdit, rolesToEdit, shared, personalToShared }: { personalToShared?: boolean, className?: string, addressToEdit: string, nameToEdit?: string, nickNameToEdit?: string, discordToEdit?: string, emailToEdit?: string, telegramToEdit?: string, rolesToEdit?: string[], onCancel: () => void, shared: boolean }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const { activeMultisig, addressBook, multisigAddresses, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { setActiveMultisigContextState } = useActiveMultisigContext();
	const [newName, setNewName] = useState<string>(nameToEdit || '');
	const [nickName, setNickName] = useState<string>(nickNameToEdit || '');
	const [showNickNameField, setShowNickNameField] = useState<boolean>(nickNameToEdit ? true : false);
	const [email, setEmail] = useState<string>(emailToEdit || '');
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [roles, setRoles] = useState<string[]>(rolesToEdit || []);
	const [discord, setDiscord] = useState<string>(discordToEdit || '');
	const [telegram, setTelegram] = useState<string>(telegramToEdit || '');
	const { network } = useGlobalApiContext();
	const [openConfirmationModal, setOpenConfirmationModal] = useState<boolean>(false);
	const [onlyNickNameChanged, setOnlyNickNameChanged] = useState<boolean>(false);
	const [noChange, setNoChange] = useState<boolean>(true);

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
		if(newName === nameToEdit && email === emailToEdit && discord === discordToEdit && telegram === telegramToEdit && roles.toString() === rolesToEdit?.toString()){
			if(nickName === nickNameToEdit){
				setNoChange(true);
				setOnlyNickNameChanged(false);
			}
			else{
				setNoChange(false);
				setOnlyNickNameChanged(true);
			}
		}
		else {
			setNoChange(false);
		}
	}, [discord, discordToEdit, email, emailToEdit, nameToEdit, newName, nickName, nickNameToEdit, roles, rolesToEdit, telegram, telegramToEdit]);

	const handlePersonalAddressBookUpdate = async () => {
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

				const addAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBook`, {
					body: JSON.stringify({
						address: addressToEdit,
						discord,
						email,
						name: newName,
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
					onCancel();

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleSharedAddressBookUpdate = async () => {
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

				const addAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateSharedAddressBook`, {
					body: JSON.stringify({
						address: addressToEdit,
						discord,
						email,
						multisigAddress: multisig?.proxy ? multisig.proxy : activeMultisig,
						name: newName,
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
					const updateIndex = copyAddressBook.findIndex((item) => getSubstrateAddress(item.address) === getSubstrateAddress(addressToEdit));
					if(updateIndex > -1){
						copyAddressBook[updateIndex].nickName = nickName;
					}
					else {
						copyAddressBook.push({
							address: addressToEdit,
							discord,
							email,
							name: newName,
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
					onCancel();

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<>
			<Spin spinning={loading && !personalToShared} indicator={<LoadingLottie message={'Updating Your Address Book'} />}>
				<EditAddressModal onCancel={() => setOpenConfirmationModal(false)} open={openConfirmationModal} confirm={handleSharedAddressBookUpdate}  />
				{personalToShared ?
					<Form
						className='my-0 w-[560px]'
					>
						<p className='text-white font-medium text-sm leading-[15px]'>
							This will update the Address Book for All Signatories, do you want to proceed?
						</p>
					</Form>
					:
					<Form
						className={`${className} my-0 w-[560px] max-h-[75vh] py-1 px-2 overflow-y-auto`}
						disabled={loading}
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
								rules={[]}
								className='border-0 outline-0 my-0 p-0'
							>
								<Input
									placeholder="Give the address a name"
									required
									className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
									id="name"
									onChange={(e) => setNewName(e.target.value)}
									value={newName}
									defaultValue={newName}
								/>
								{!showNickNameField &&
									<Button onClick={() => setShowNickNameField(true)} icon={<PlusCircleOutlined className='text-primary' />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'>Add Nickname</Button>
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
								<Button onClick={() => { setShowNickNameField(false); setNickName(''); }} icon={<MinusCircleOutlined className='text-primary' />} className='bg-transparent p-0 border-none outline-none text-primary text-sm flex items-center'>Remove Nickname</Button>
							</Form.Item>
						</div>
						}
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
									defaultValue={email}
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
									defaultValue={discord}
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
									defaultValue={telegram}
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
									value={roles}
									defaultValue={roles}
									notFoundContent={false}
								/>
							</Form.Item>
						</div>
					</Form>
				}
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn loading={loading} onClick={onCancel}/>
					<AddBtn disabled={!personalToShared && (!newName || (!!email && !emailValid) || noChange)} loading={loading} onClick={personalToShared ? handleSharedAddressBookUpdate : shared ? onlyNickNameChanged ? handleSharedAddressBookUpdate : () => setOpenConfirmationModal(true) : handlePersonalAddressBookUpdate} title={personalToShared ? 'Yes' : 'Save'} />
				</div>
			</Spin>
		</>
	);
};

export default styled(EditAddress)`

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