// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import React, { useState } from 'react';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { IAddressBookEntry, IMultisigAddress } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';
import _createMultisig from 'src/utils/_createMultisig';
import getEncodedAddress from 'src/utils/getEncodedAddress';

import NameAddress from '../LinkMultisig/NameAddress';
import SelectNetwork from '../LinkMultisig/SelectNetwork';
import Owners from './Owners';
import Review from './Review';

interface ISignatory{
	name: string
	address: string
}

const LinkMultisig = () => {
	const { toggleVisibility } = useModalContext();
	const [multisigName, setMultisigName] = useState('');
	const [nameAddress, setNameAddress] = useState(true);
	const [viewOwners, setViewOwners] = useState(true);
	const [viewReviews, setViewReviews] = useState(true);
	const { address, addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const [multisigAddress, setMultisigAddress] = useState<string>('');

	const [multisigData, setMultisigData] = useState<IMultisigAddress>();

	const [loading, setLoading] = useState<boolean>(false);

	const [signatoriesWithName, setSignatoriesWithName] = useState<ISignatory[]>([]);

	const [signatoriesArray, setSignatoriesArray] = useState<ISignatory[]>([{ address, name: addressBook.find(item => item.address === address)?.name || '' }, { address: '', name: '' }]);
	const [threshold, setThreshold] = useState<number>(0);

	const viewNameAddress = () => {
		setNameAddress(false);
	};

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
					headers: firebaseFunctionsHeader(),
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

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleMultisigBadge = async (signatories: string[], threshold: number, multisigName: string, network: string) => {
		try{
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!address || !signature) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			else{
				if(!signatories.includes(address)){
					queueNotification({
						header: 'Error!',
						message: 'Signatories does not have your Address.',
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}
				const createMultisigRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createMultisig`, {
					body: JSON.stringify({
						signatories,
						threshold,
						multisigName,
						network
					}),
					headers: {
						'x-address': address,
						'x-signature': signature,
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST'
				});

				const { data: multisigData, error: multisigError } = await createMultisigRes.json() as { error: string; data: IMultisigAddress};

				if(multisigError) {
					queueNotification({
						header: 'Error!',
						message: multisigError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(multisigData){
					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							multisigAddresses: [...prevState.multisigAddresses, multisigData]
						};
					});
					Promise.all(signatoriesWithName.map(
						(signatory) => handleAddAddress(signatory.address, signatory.name)
					)).then(() => {
						queueNotification({
							header: 'Success!',
							message: 'Multisig Linked',
							status: NotificationStatus.SUCCESS
						});
						setLoading(false);
						toggleVisibility();
					});
				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleViewOwners = async () => {
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

				const getMultisigDataRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigDataByMultisigAddress`, {
					body: JSON.stringify({
						multisigAddress,
						network
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});

				const { data: multisigDataRes, error: multisigError } = await getMultisigDataRes.json() as { data: IMultisigAddress, error: string };

				if(multisigError) {

					queueNotification({
						header: 'Error!',
						message: multisigError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(multisigDataRes){
					setLoading(false);

					setMultisigData(multisigDataRes);
					const signatoriesArray = multisigDataRes.signatories.map((address: string) => {
						return {
							address: address,
							name: ''
						};
					});
					signatoriesArray.forEach((signatory) => {
						let name: string = '';
						addressBook.forEach((item) => {
							if(item.address === signatory.address){
								name = item.name;
							}
						});
						signatory.name = name;
					});
					setSignatoriesWithName(signatoriesArray);
					setNameAddress(false);
					setViewOwners(false);

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const handleViewReviews = () => {
		setNameAddress(false);
		setViewOwners(false);
		setViewReviews(false);
	};

	const checkMultisig = (signatories: ISignatory[]) => {
		const signatoryAddresses = signatories.map(item => item.address);
		const response = _createMultisig(signatoryAddresses, threshold, chainProperties[network].ss58Format);
		if(response && response.multisigAddress && getEncodedAddress(response.multisigAddress, network) === multisigAddress){
			setMultisigData(prevState => {
				return {
					...prevState,
					name: multisigName,
					address: multisigAddress,
					signatories: signatoryAddresses,
					threshold,
					network,
					created_at: new Date()
				};
			});
			setSignatoriesWithName(signatories);
			setNameAddress(false);
			setViewOwners(false);
			setViewReviews(false);
		}
		else{
			queueNotification({
				header: 'Error!',
				message: 'No Multisig found with these Signatories.',
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleLinkMultisig = () => {
		setLoading(true);
		if(multisigData){
			const name = multisigData.name ? multisigData.name : multisigName;
			handleMultisigBadge(multisigData.signatories, multisigData.threshold, name, network);
		}
		else{
			queueNotification({
				header: 'Error!',
				message: 'Invalid Multisig',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	return (
		<>
			{nameAddress?
				<div>
					<SelectNetwork />
					<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
						<CancelBtn onClick={toggleVisibility} />
						<AddBtn title='Continue' onClick={viewNameAddress}/>
					</div>
				</div>:
				<div>
					{viewOwners?<div>
						<NameAddress multisigName={multisigName} setMultisigName={setMultisigName} multisigAddress={multisigAddress} setMultisigAddress={setMultisigAddress} />
						<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
							<CancelBtn onClick={toggleVisibility} />
							<AddBtn title='Continue' loading={loading} onClick={handleViewOwners}/>
						</div>
					</div>:<div>
						{viewReviews?<div>
							<Owners setThreshold={setThreshold} setSignatoriesArray={setSignatoriesArray} signatoriesArray={signatoriesArray} signatories={signatoriesWithName} setSignatoriesWithName={setSignatoriesWithName} />
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={toggleVisibility} />
								{signatoriesWithName.length ?
									<AddBtn title='Continue' onClick={handleViewReviews}/>
									:
									<AddBtn title='Check Multisig' onClick={() => checkMultisig(signatoriesArray)}/>
								}
							</div>
						</div>: <div>
							<Review multisigName={multisigName} multisigData={multisigData} signatories={signatoriesWithName} />
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={toggleVisibility} />
								<AddBtn loading={loading} title='Link Multisig' onClick={handleLinkMultisig}/>
							</div>
						</div>}
					</div>}
				</div>
			}
		</>
	);
};

export default LinkMultisig;
