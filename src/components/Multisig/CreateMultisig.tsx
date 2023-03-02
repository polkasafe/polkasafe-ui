// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Switch } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_HEADER } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import { IMultisigAddress } from 'src/types';
import { DashDotIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';
import getNetwork from 'src/utils/getNetwork';
import styled from 'styled-components';

import DragDrop from '../Multisig/DragDrop';
import Search from '../Multisig/Search';
import AddSignatory from '../UserFlow/AddSignatory';
import MultisigCreated from '../UserFlow/MultisigCreated';
import Signotary from './Signotary';

const network = getNetwork();

interface IMultisigProps {
	className?: string
	onCancel?: () => void
	isModalPopup?:boolean
	homepage?: boolean
}

const CreateMultisig: React.FC<IMultisigProps> = ({ onCancel, homepage=false }) => {
	const { setUserDetailsContextState, address: userAddress } = useGlobalUserDetailsContext();

	const { openModal, toggleVisibility, toggleSwitch, toggleOnSwitch } = useModalContext();
	const [show, setShow] = useState(true);
	const [multisigName, setMultisigName] = useState<string>('');
	const [threshold, setThreshold] = useState<number | null>(null);
	const [signatories, setSignatories] = useState<string[]>([userAddress]);

	const { accounts, noAccounts } = useGetAllAccounts();
	const [address, setAddress] = useState('');
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (accounts && accounts.length > 0 && !address) {
			setAddress(accounts[0].address);
		}
	}, [accounts, address]);

	const handleMultisigCreated = () => {
		setShow(false);
	};
	const handleMultisigBadge = async () => {
		try{
			setLoading(true);
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!address || !signature || noAccounts) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			else{
				const createMultisigRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createMultisig`, {
					body: JSON.stringify({
						signatories,
						threshold,
						multisigName,
						network
					}),
					headers: FIREBASE_FUNCTIONS_HEADER,
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

					queueNotification({
						header: 'Success!',
						message: `Your MultiSig ${multisigName} has been created successfully!`,
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
		<div>
			{show?<div className='flex flex-col relative'>
				<div className={classNames(
					`${homepage ? '' : 'w-[80vw]'}  flex justify-between items-end`,
					{
						'w-auto':onCancel
					}
				)}>
					<div className='relative'>
						{!onCancel?
							<div className="flex items-left justify-between w-[45vw]">
								{toggleSwitch?<Search/>:null}
							</div>:
							<div className='flex items-center justify-between'>
								{toggleSwitch?<div className="flex items-left justify-between w-[45vw]">
									<Search />
									<Button className='bg-highlight text-primary border-none py-5 flex items-center justify-center ml-2'
										onClick={() => openModal('Add Signatory', <AddSignatory />)}><PlusCircleOutlined />Add Signatory
									</Button>
								</div>:null}
								<div className='flex items-center justify-center absolute top-1 right-1'>
									<p className='mx-2 text-white'>Upload JSON file with signatories</p><Switch size="small" onChange={toggleOnSwitch}/>
								</div>
							</div>}
						<div className="poition-absolute top-0 right-0"></div>
						<div className='flex items-center justify-between'>
							{toggleSwitch? <Signotary setSignatories={setSignatories} signatories={signatories}/> : <DragDrop/>}
							<DashDotIcon className='mt-5'/>
							<div className='w-[40%] overflow-auto'>
								<br />
								{toggleSwitch? <p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary'>The signatories has the ability to create transactions using the multisig and approve transactions sent by others. Once the threshold is reached with approvals, the multisig transaction is enacted on-chain.
							Since the multisig function like any other account, once created it is available for selection anywhere accounts are used and needs to be funded before use.
								</p> : <p className='bg-bg-secondary p-5 rounded-md mx-2 h-fit text-text_secondary'>Supply a JSON file with the list of signatories.</p>}
							</div>
						</div>
						<div className='flex items-center justify-between'>
							<div className='w-[45vw]'>
								<p className='text-primary'>Threshold</p>
								<InputNumber onChange={(val) => setThreshold(val)} value={threshold} className= 'bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none w-full mt-2 py-2' placeholder='#' />
							</div>
							<DashDotIcon className='mt-5'/>
							<div className='w-[40%] overflow-auto'>
								<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>The threshold for approval should be less or equal to the number of signatories for this multisig.</p>
							</div>
						</div>
						<div className='flex items-center justify-between'>
							<div className='w-[45vw]'>
								<p className='text-primary'>Name</p>
								<Input onChange={(e) => setMultisigName(e.target.value)} value={multisigName}  className= 'bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none w-full mt-2 py-2' placeholder='Give the MultiSig a unique name' />
							</div>
							<DashDotIcon className='mt-5'/>
							<div className='w-[40%] overflow-auto'>
								<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>The name is for unique identification of the account in your owner lists.</p>
							</div>
						</div>
					</div>
				</div>
				<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
					<CancelBtn onClick={onCancel? onCancel:toggleVisibility}/>
					<AddBtn loading={loading} title='Create Multisig' onClick={onCancel? handleMultisigCreated: handleMultisigBadge} />
				</div>
			</div>:
				<MultisigCreated/>}
		</div>
	);
};

export default styled(CreateMultisig)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}
`;
