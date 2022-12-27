// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useModalContext } from 'src/context/ModalContext';
import { DashDotIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

import DragDrop from '../Multisig/DragDrop';
import Search from '../Multisig/Search';
import Signotary from './Signotary';

interface IMultisigProps {
	className?: string
}

const CreateMultisig: React.FC<IMultisigProps> = () => {
	const { toggleVisibility, toggleSwitch } = useModalContext();
	return (
		<div className='flex flex-col relative'>
			<div className='w-[80vw] flex justify-between items-end'>
				<div>
					<Search/>
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
							<p>Threshold</p>
							<input className='bg-bg-secondary p-2 w-full my-2 rounded-md' placeholder='2' />
						</div>
						<DashDotIcon className='mt-5'/>
						<div className='w-[40%] overflow-auto'>
							<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>The threshold for approval should be less or equal to the number of signatories for this multisig.</p>
						</div>
					</div>
					<div className='flex items-center justify-between'>
						<div className='w-[45vw]'>
							<p>Name</p>
							<input className='bg-bg-secondary p-2 w-full my-2 rounded-md' placeholder='Give the MultiSig a unique name' />
						</div>
						<DashDotIcon className='mt-5'/>
						<div className='w-[40%] overflow-auto'>
							<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5 text-text_secondary'>The name is for unique identification of the account in your owner lists.</p>
						</div>
					</div>
				</div>
			</div>
			<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
				<CancelBtn onClick={toggleVisibility}/>
				<AddBtn title='Create Multisig' />
			</div>
		</div>
	);
};

export default styled(CreateMultisig)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}
`;

