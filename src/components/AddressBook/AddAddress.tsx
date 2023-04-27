// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input, message } from 'antd';
import React, { useState } from 'react';
import AddBtn from 'src/components/Multisig/ModalBtn';
import CancelBtn from 'src/components/Settings/CancelBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
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
	const [loading, setLoading] = useState<boolean>(false);

	const { addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();

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
						name
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
											Name
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
											Address
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
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn onClick={onCancel ? onCancel : toggleVisibility}/>
					<AddBtn loading={loading} disabled={!name || !address} title='Add' onClick={handleAddAddress} />
				</div>
			</Form>
		</>
	);
};

export default AddAddress;