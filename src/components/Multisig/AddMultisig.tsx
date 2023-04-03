// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal } from 'antd';
import React, { FC, useState } from 'react';
import CreateMultisig from 'src/components/Multisig/CreateMultisig';
import { CreateMultisigIcon, LinkIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

import LinkMultisig from './LinkMultisig/LinkMultisig';

interface IMultisigProps {
	className?: string
	isModalPopup?: boolean
	homepage?: boolean
	onCancel?: () => void
}

const AddMultisig: React.FC<IMultisigProps> = ({ isModalPopup, homepage, className, onCancel }) => {
	const [ isMultisigVisible, setMultisigVisible] = useState(false);
	const [openLinkMultisig, setOpenLinkMultisig] = useState(false);
	const [openCreateMultisig, setOpenCreateMultisig] = useState(false);

	const LinkMultisigModal: FC = () => {
		return (
			<>
				<Button
					className='flex items-center justify-center bg-primary text-primary bg-opacity-10 w-[100%] border-none'
					onClick={() => setOpenLinkMultisig(true)}
				>
					<LinkIcon/>Link Multisig
				</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenLinkMultisig(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Link Multisig</h3>}
					open={openLinkMultisig}
					className='w-auto md:min-w-[500px]'
				>
					<LinkMultisig onCancel={() => setOpenLinkMultisig(false)} />
				</Modal>
			</>
		);
	};
	const CreateMultisigModal: FC = () => {
		return (
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenCreateMultisig(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Create Multisig</h3>}
				open={openCreateMultisig}
				className={`${className} w-auto md:min-w-[500px]`}
			>
				<CreateMultisig onCancel={() => {
					setOpenCreateMultisig(false);
					onCancel?.();
				}}
				/>
			</Modal>
		);
	};

	return (
		<div className={className}>
			<CreateMultisigModal/>
			{isMultisigVisible&&!isModalPopup?<div className='p-5'>
				<CreateMultisig homepage={homepage} onCancel = {() => {
					setMultisigVisible(false);
				}} />
			</div>:<div className='h-full flex flex-col justify-center'>
				<div className='p-5 '>
					<div className='text-center mb-10'>
						<h1 className='text-lg font-bold text-white'>Add Multisig</h1>
						<p className='text-white'>MultiSig is a secure digital wallet that requires one or multiple owners to authorize the transaction.</p>
						<br />
						<p className='text-text_secondary'>To add a MultiSig you can choose from the options below:</p>
					</div>
					<div className="flex justify-center mt-5 w-full px-10">
						<div className="flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-lg p-5 mx-5">
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
											setOpenCreateMultisig(true);
										}
									}}
								>
									<CreateMultisigIcon/> Multisig
								</Button>
							</div>
						</div>
						<div className="flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-lg p-5 mx-5">
							<div className='mb-5'>
								<h1 className='font-bold text-md mb-2 text-white'>Link Multisig</h1>
								<p className='text-text_secondary text-sm'>Already have a MultiSig? You can link your existing multisig with a few simple steps.</p>
							</div>
							<div>
								<LinkMultisigModal />
							</div>
						</div>
					</div>
				</div>
			</div>}
		</div>
	);
};

export default styled(AddMultisig)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}

	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;

