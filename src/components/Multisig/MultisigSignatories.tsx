// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { Button } from 'antd';
import React from 'react';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { DashDotIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

import DragDrop from '../AddressBook/DragDrop';

interface IMultisigProps {
	className?: string
}

const MultisigSignatories: React.FC<IMultisigProps> = () => {
	return (
		<div className='flex flex-col'>
			<div className='w-[80vw] flex justify-between items-end'>
				<div>
					<div className='flex items-center justify-between'>
						<DragDrop/>
						<DashDotIcon className='mt-5'/>
					</div>
					<div className='flex items-center justify-between'>
						<div className='w-[45vw]'>
							<p>Threshold</p>
							<input className='bg-bg-secondary p-2 w-full my-2 rounded-md' placeholder='2' />
						</div>
						<DashDotIcon className='mt-5'/>
						<div className='w-[40%]'>
							<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5'>The threshold for approval should be less or equal to the number of signatories for this multisig.</p>
						</div>
					</div>
					<div className='flex items-center justify-between'>
						<div className='w-[45vw]'>
							<p>Name</p>
							<input className='bg-bg-secondary p-2 w-full my-2 rounded-md' placeholder='Give the MultiSig a unique name' />
						</div>
						<DashDotIcon className='mt-5'/>
						<div className='w-[40%]'>
							<p className='bg-bg-secondary py-2 px-5 rounded-md mx-2 mt-5'>The name is for unique identification of the account in your owner lists.</p>
						</div>
					</div>
				</div>
			</div>
			<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
				<CancelBtn />
				<AddBtn title='Create Multisig' />
			</div>
		</div>
	);
};

export default styled(MultisigSignatories)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}
`;

