// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Switch } from 'antd';
import React, { useState } from 'react';
import CreateMultisig from 'src/components/Multisig/CreateMultisig';
import { useModalContext } from 'src/context/ModalContext';
import { CreateMultisigIcon, LinkIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

import LinkMultisig from './LinkMultisig/LinkMultisig';

// import Signotary from './Signotary';

interface IMultisigProps {
	className?: string
	isModalPopup?: boolean
}

const AddMultisig: React.FC<IMultisigProps> = ({ isModalPopup }) => {
	const [ isMultisigVisible, setMultisigVisible] = useState(false);
	const { openModal, toggleOnSwitch } = useModalContext();
	return (
		<>
			{isMultisigVisible&&!isModalPopup?<div className='p-5'>
				<CreateMultisig onCancel = {() => {
					setMultisigVisible(false);
				}} />
			</div>:<div>
				<div className='p-5 m-auto h-[100%]'>
					<div className='text-center mb-5'>
						<h1 className='text-lg font-bold text-white'>Add Multisig</h1>
						<p className='text-white'>MultiSig is a secure digital wallet that requires one or multiple owners to authorize the transaction.</p>
						<br />
						<p className='text-text_secondary'>To add a MultiSig you can choose from the options below:</p>
					</div>
					<div className="flex items-center justify-center mt-5 w-[55vw]">
						<div className="flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-lg p-5 m-5">
							<div className='mb-5'>
								<h1 className='font-bold text-md mb-2 text-white'>Create Multisig</h1>
								<p className='text-text_secondary text-sm'>Create  a new MultiSig that is controlled by one or multiple owners.</p>
							</div>
							<div>
								<Button className='flex items-center justify-center bg-primary text-white w-[100%] border-none'
									onClick={() => {
										if(!isModalPopup){
											setMultisigVisible(true);
										}else{
											openModal('Create Multisig', <CreateMultisig/>,<div className='flex items-center justify-center'>
												<p className='mx-2'>Upload JSON file with signatories</p><Switch size="small" onChange={toggleOnSwitch} /></div>);
										}
									}}
								>
									<CreateMultisigIcon/> Multisig
								</Button>
							</div>
						</div>
						<div className="flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-lg p-5 m-5">
							<div className='mb-5'>
								<h1 className='font-bold text-md mb-2 text-white'>Link Multisig</h1>
								<p className='text-text_secondary text-sm'>Already have a MultiSig? You can link your existing multisig with a few simple steps.</p>
							</div>
							<div>
								<Button className='flex items-center justify-center bg-primary text-primary bg-opacity-10 w-[100%] border-none' onClick={() => {
									if(!isModalPopup){
										openModal('Link Multisig', <LinkMultisig/>);
									}else{
										openModal('Link Multisig', <LinkMultisig/>);
									}
								}}><LinkIcon/>Link Multisig</Button>
							</div>
						</div>
					</div>
				</div>
			</div>}
		</>
	);
};

export default styled(AddMultisig)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}
`;

