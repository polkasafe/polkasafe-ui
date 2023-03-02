// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_HEADER } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { DeleteIcon, EditIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

const Details = () => {

	const { activeMultisig, multisigAddresses, setUserDetailsContextState } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);

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
				headers: FIREBASE_FUNCTIONS_HEADER,
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
		<>
			<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>
				Details
			</h2>
			<article className='bg-bg-main p-5 rounded-xl text-text_secondary text-sm font-normal leading-[15px]'>
				<div className='flex items-center justify-between gap-x-5'>
					<span>
						Contract Version:
					</span>
					<span className='bg-highlight text-primary flex items-center gap-x-3 rounded-lg px-2 py-[10px] font-medium'>
						1.3.0
						<ExternalLinkIcon className='text-primary' />
					</span>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-5'>
					<span>Blockchain:</span>
					<span className='text-white'>Polkadot</span>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-7'>
					<span>Safe Name:</span>
					<span className='text-white flex items-center gap-x-3'>
						New-Safe
						<EditIcon className='text-primary' />
					</span>
				</div>
				<Button disabled={!activeMultisig} size='large' onClick={handleRemoveSafe} loading={loading} className='border-none outline-none text-failure bg-failure bg-opacity-10 flex items-center gap-x-3 justify-center rounded-lg p-[10px] w-full mt-7'>
					<DeleteIcon />
					<span>Remove Safe</span>
				</Button>
			</article>
		</>
	);
};

export default Details;