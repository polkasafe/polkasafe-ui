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
import { DEFAULT_MULTISIG_NAME } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

const RemoveMultisigAddress = () => {
	const { activeMultisig, multisigAddresses, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { toggleVisibility } = useModalContext();
	const [loading, setLoading] = useState<boolean>(false);
	const { network } = useGlobalApiContext();

	const handleRemoveSafe = async () => {
		try{
			setLoading(true);
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				setLoading(false);
				return;
			}

			const removeSafeRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/deleteMultisig`, {
				body: JSON.stringify({
					multisigAddress: activeMultisig
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: removeSafeData, error: removeSafeError } = await removeSafeRes.json() as { data: string, error: string };

			if(removeSafeError) {

				queueNotification({
					header: 'Error!',
					message: removeSafeError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if(removeSafeData){
				if(removeSafeData === 'Success'){
					setLoading(false);
					const copy = [...multisigAddresses];
					setUserDetailsContextState((prevState) => {
						const newMutlisigArray = copy.filter((item) => item.address !== activeMultisig);
						if(newMutlisigArray && newMutlisigArray[0]?.address){
							localStorage.setItem('active_multisig', newMutlisigArray[0].address);
						}
						else{
							localStorage.removeItem('active_multisig');
						}
						return {
							...prevState,
							activeMultisig: localStorage.getItem('active_multisig') || '',
							multisigAddresses: newMutlisigArray
						};
					});
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
					{multisigAddresses?.find((item) => item.address === activeMultisig)?.name || DEFAULT_MULTISIG_NAME}
				</span>
                ?
			</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={toggleVisibility}/>
				<RemoveBtn loading={loading} onClick={handleRemoveSafe} />
			</div>
		</Form>
	);
};

export default RemoveMultisigAddress;