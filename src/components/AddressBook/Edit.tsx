// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { EMAIL_REGEX } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAddressBookItem } from 'src/types';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

const EditAddress = ({ className, onCancel, addressToEdit, nameToEdit, discordToEdit, emailToEdit, telegramToEdit, rolesToEdit }: { className?: string, addressToEdit: string, nameToEdit?: string, discordToEdit?: string, emailToEdit?: string, telegramToEdit?: string, rolesToEdit?: string[], onCancel: () => void }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const [newName, setNewName] = useState<string>(nameToEdit || '');
	const [email, setEmail] = useState<string>(emailToEdit || '');
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [roles, setRoles] = useState<string[]>(rolesToEdit || []);
	const [discord, setDiscord] = useState<string>(discordToEdit || '');
	const [telegram, setTelegram] = useState<string>(telegramToEdit || '');
	const { network } = useGlobalApiContext();

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

	const handleAddAddress = async () => {
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

	return (
		<>
			<Spin spinning={loading} indicator={<LoadingLottie message={'Updating Your Address Book'} />}>
				<Form
					className={`${className} my-0 w-[560px] max-h-[75vh] px-2 overflow-y-auto`}
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
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn onClick={onCancel}/>
					<AddBtn loading={loading} onClick={handleAddAddress} title='Save' />
				</div>
			</Spin>
		</>
	);
};

export default EditAddress;