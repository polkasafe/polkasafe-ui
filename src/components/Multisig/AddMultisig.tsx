// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { Switch } from 'antd';
import React from 'react';
import CreateMultisig from 'src/components/Multisig/CreateMultisig';
import { useModalContext } from 'src/context/ModalContext';
import { CreateMultisigIcon, LinkIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

// import Signotary from './Signotary';

interface IMultisigProps {
	className?: string
}

const AddMultisig: React.FC<IMultisigProps> = () => {
	const { openModal, toggleOnSwitch } = useModalContext();
	return (
		<div className='w-[50vw] p-5'>
			<div className='text-center mb-5'>
				<h1 className='text-lg font-bold'>Add Multisig</h1>
				<p className='text-text_secondary'>MultiSig is a secure digital wallet that requires one or multiple owners to authorize the transaction.</p>
				<br />
				<p>To add a MultiSig you can choose from the options below:</p>
			</div>
			<div className="flex items-center justify-center mt-5">
				<div className="flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-md p-5 m-5">
					<div className='mb-5'>
						<h1 className='font-bold text-md mb-2'>Create Multisig</h1>
						<p className='text-text_secondary text-sm'>Create  a new MultiSig that is controlled by one or multiple owners.</p>
					</div>
					<div>
						<Button className='flex items-center justify-center bg-primary text-white w-[100%] border-none' onClick={() => openModal('Create Multisig', <CreateMultisig/>,<div><p>hello</p><Switch size="small" onChange={toggleOnSwitch} /></div>) }><CreateMultisigIcon/> Multisig</Button>
					</div>
				</div>
				<div className="flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-md p-5 m-5">
					<div className='mb-5'>
						<h1 className='font-bold text-md mb-2'>Link Multisig</h1>
						<p className='text-text_secondary text-sm'>Already have a MultiSig? You can link your existing multisig with a few simple steps.</p>
					</div>
					<div>
						<Button className='flex items-center justify-center bg-primary text-primary bg-opacity-10 w-[100%] border-none'><LinkIcon/>Link Multisig</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default styled(AddMultisig)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}
`;

