// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { useState } from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import RemoveBtn from 'src/components/Settings/RemoveBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

const RemoveAddress = ({ addressToRemove, name }: { addressToRemove: string, name: string }) => {
	const { address, addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { toggleVisibility } = useModalContext();
	const [loading, setLoading] = useState<boolean>(false);
	const { network } = useGlobalApiContext();

	const handleRemoveAddress = async () => {
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
				if(addressToRemove === address){
					setLoading(false);
					return;
				}

				const removeAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/removeFromAddressBook`, {
					body: JSON.stringify({
						address: addressToRemove,
						name
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: removeAddressData, error: removeAddressError } = await removeAddressRes.json() as { data: any, error: string };

				if(removeAddressError) {

					queueNotification({
						header: 'Error!',
						message: removeAddressError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(removeAddressData){
					const filteredAddresses = [...addressBook].filter((item) => item.address !== addressToRemove);
					setUserDetailsContextState(prev => {
						return {
							...prev,
							addressBook: filteredAddresses
						};
					});

					queueNotification({
						header: 'Success!',
						message: 'Your address has been removed successfully!',
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

	return (
		<Form
			className='my-0 w-[560px]'
		>
			<p className='text-white font-medium text-sm leading-[15px]'>
				Are you sure you want to permanently delete
				<span className='text-primary mx-1.5'>
					{name}
				</span>
                from your Address Book?
			</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={toggleVisibility}/>
				<RemoveBtn loading={loading} onClick={handleRemoveAddress} />
			</div>
		</Form>
	);
};

export default RemoveAddress;