// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input, message,Select } from 'antd';
import React, { useEffect, useState } from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { EMAIL_REGEX } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAddressBookItem } from 'src/types';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

interface IMultisigProps {
	className?: string
	addAddress?: string
	onCancel?: () => void
	setAddAddress?: React.Dispatch<React.SetStateAction<string>>
}

const AddAddress: React.FC<IMultisigProps> = ({ addAddress, onCancel, setAddAddress }) => {
	const [messageApi, contextHolder] = message.useMessage();
	const { network } = useGlobalApiContext();

	const [address, setAddress] = useState<string>(addAddress || '');
	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string | null>();
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [roles, setRoles] = useState<string[]>([]);
	const [discord, setDiscord] = useState<string>('');
	const [telegram, setTelegram] = useState<string>('');

	const roleOptions = [{
		label: <span className='p-1 rounded-md text-white bg-primary'>Role</span>,
		value: 'role'
	}];
	const [loading, setLoading] = useState<boolean>(false);

	const { addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();

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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [email]);

	const handleAddAddress = async () => {
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
				if(addressBook.some((item) => item.address === address)){
					queueNotification({
						header: 'Error!',
						message: 'Address exists in Address book.',
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
					console.log(addAddressData);

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

	const { toggleVisibility } = useModalContext();
	return (
		<>
			{contextHolder}

			<Form
				className='my-0 w-[560px]'
			>
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
					</Form.Item>
				</div>
				<div className="flex flex-col gap-y-3 mt-5">
					<label
						className="text-primary text-xs leading-[13px] font-normal"
						htmlFor="address"
					>
						Address*
					</label>
					<Form.Item
						name="address"
						rules={[]}
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
							value={address}
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
							className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
							onChange={(value) => setRoles(value)}
							tokenSeparators={[',']}
							options={roleOptions}
						/>
					</Form.Item>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn onClick={onCancel ? onCancel : toggleVisibility}/>
					<AddBtn loading={loading} disabled={!name || !address || (!!email && !emailValid)} title='Add' onClick={handleAddAddress} />
				</div>
			</Form>
		</>
	);
};

export default AddAddress;