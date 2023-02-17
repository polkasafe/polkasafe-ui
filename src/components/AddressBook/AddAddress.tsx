// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import React, { useState } from 'react';
import AddBtn from 'src/components/Multisig/ModalBtn';
import CancelBtn from 'src/components/Settings/CancelBtn';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { IAddressBookEntry } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

interface IMultisigProps {
	className?: string
}

const AddAddress: React.FC<IMultisigProps> = () => {

	const [address, setAddress] = useState<string>('');
	const [name, setName] = useState<string>('');

	const { setUserDetailsContextState } = useGlobalUserDetailsContext();

	const handleAddAddress = async () => {
		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{

				const addAddressRes = await fetch(`${process.env.REACT_APP_FIREBASE_URL}/addToAddressBook`, {
					body: JSON.stringify({
						address,
						name
					}),
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						'x-address': userAddress,
						'x-signature': signature
					},
					method: 'POST'
				});

				const { data: addAddressData, error: addAddressError } = await addAddressRes.json() as { data: IAddressBookEntry[], error: string };

				if(addAddressError) {

					queueNotification({
						header: 'Error!',
						message: addAddressError,
						status: NotificationStatus.ERROR
					});
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
					toggleVisibility();

				}

			}
		} catch (error){
			console.log('ERROR', error);
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
				<AddBtn title='Add' onClick={handleAddAddress} />
			</div>
		</Form>
	);
};

export default AddAddress;