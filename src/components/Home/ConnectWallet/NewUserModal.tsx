// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form, Modal } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import useGetWalletAccounts from 'src/hooks/useGetWalletAccounts';
import { IAddressBookItem } from 'src/types';
import { NotificationStatus } from 'src/types';
import { AddIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';

interface INewUserModal{
    open: boolean
    onCancel: () => void
}

const NewUserModal = ({ open, onCancel }: INewUserModal) => {

	const [loading, setLoading] = useState(false);
	const { network } = useGlobalApiContext();
	const { setUserDetailsContextState, loggedInWallet } = useGlobalUserDetailsContext();
	const { accounts } = useGetWalletAccounts(loggedInWallet);

	const handleAddAddress = async (address: string, name: string) => {
		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{

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
					return;
				}

				if(addAddressData){
					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							addressBook: addAddressData
						};
					});

				}

			}
		} catch (error){
			console.log('ERROR', error);
		}
	};

	const addToAddressBook = async () => {
		setLoading(true);
		for(const account of accounts){
			await handleAddAddress(account.address, account.name || DEFAULT_ADDRESS_NAME);
		}
		setLoading(false);
		queueNotification({
			header: 'Success!',
			message: 'Addresses Added to Address Book',
			status: NotificationStatus.SUCCESS
		});
		onCancel();
	};

	return (
		<Modal
			centered
			footer={false}
			closable={false}
			title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Wallet Addresses</h3>}
			open={open}
			className='w-auto md:min-w-[500px]'
		>
			<Form
				className='my-0 w-[560px]'
			>
				<p className='text-white font-medium text-sm leading-[15px]'>
                    Do You Want To Add Your Wallet Addresses To Your Address Book?
				</p>
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<Button
						size='large'
						disabled={loading}
						className={'flex border-none outline-none items-center text-primary text-sm font-normal'}
						onClick={onCancel}
					>
						Add Manually Later
					</Button>
					<Button
						loading={loading}
						icon={<AddIcon className='text-sm' />}
						onClick={addToAddressBook}
						size='large'
						className='flex items-center border-none outline-none text-white text-sm font-normal leading-[15px] bg-primary rounded-lg min-w-[130px] justify-center'
					>
                        Import
					</Button>
				</div>
			</Form>
		</Modal>
	);
};

export default NewUserModal;