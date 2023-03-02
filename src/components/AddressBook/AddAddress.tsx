// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import React, { useState } from 'react';
import AddBtn from 'src/components/Multisig/ModalBtn';
import CancelBtn from 'src/components/Settings/CancelBtn';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_HEADER } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAddressBookEntry } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

interface IMultisigProps {
	className?: string
}

const AddAddress: React.FC<IMultisigProps> = () => {

	const [address, setAddress] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const { addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();

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
					headers: FIREBASE_FUNCTIONS_HEADER,
					method: 'POST'
				});

				const { data: addAddressData, error: addAddressError } = await addAddressRes.json() as { data: IAddressBookEntry[], error: string };

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
					toggleVisibility();

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const { toggleVisibility } = useModalContext();
	return (
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
					rules={[]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Input
						placeholder="Give the address a name"
						className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
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
						className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
						id="address"
						onChange={(e) => setAddress(e.target.value)}
						value={address}
					/>
				</Form.Item>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={toggleVisibility}/>
				<AddBtn loading={loading} title='Add' onClick={handleAddAddress} />
			</div>
		</Form>
	);
};

export default AddAddress;