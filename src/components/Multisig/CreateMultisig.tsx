// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Input, Switch } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useModalContext } from 'src/context/ModalContext';
import { DashDotIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';
import styled from 'styled-components';

import DragDrop from '../Multisig/DragDrop';
import Search from '../Multisig/Search';
import AddSignatory from '../UserFlow/AddSignatory';
import MultisigCreated from '../UserFlow/MultisigCreated';
import Signotary from './Signotary';

interface IMultisigProps {
	className?: string
	onCancel?: () => void
	isModalPopup?:boolean
}

const CreateMultisig: React.FC<IMultisigProps> = ({ onCancel }) => {
	const { openModal, toggleVisibility, toggleSwitch, toggleOnSwitch } = useModalContext();
	const [show, setShow] = useState(true);
	const handleMultisigCreated = () => {
		setShow(false);
	};
	const handleMultisigBadge = () => {
		queueNotification({
			header: 'Success!',
			message: 'Your MultiSig Jaski - 2 has been created successfully!',
			status: NotificationStatus.SUCCESS
		});
		toggleVisibility();
	};
	return (
		<div>
			{show?<div className='flex flex-col relative'>
				<div className={classNames(
					'w-[80vw] flex justify-between items-end',
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
							{toggleSwitch? <Signotary/> : <DragDrop/>}
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
								<Input className= 'placeholder-text_placeholder text-white outline-none border-none w-full mt-2 py-2' placeholder='2'></Input>
							</div>
							<DashDotIcon className='mt-5'/>
							<div className='w-[40%] overflow-auto'>
								<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>The threshold for approval should be less or equal to the number of signatories for this multisig.</p>
							</div>
						</div>
						<div className='flex items-center justify-between'>
							<div className='w-[45vw]'>
								<p className='text-primary'>Name</p>
								<Input className= 'placeholder-text_placeholder text-white outline-none border-none w-full mt-2 py-2' placeholder='Give the MultiSig a unique name'></Input>
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
					<AddBtn title='Create Multisig' onClick={onCancel? handleMultisigCreated: handleMultisigBadge} />
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

