// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge, Divider, Modal, Tooltip } from 'antd';
import React, { FC, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { CopyIcon, DeleteIcon, EditIcon, ExternalLinkIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import copyText from 'src/utils/copyText';
// import getEncodedAddress from 'src/utils/getEncodedAddress';
import styled from 'styled-components';

import SendFundsForm from '../SendFunds/SendFundsForm';
import EditAddress from './Edit';
import RemoveAddress from './Remove';

export interface IAddress {
	name: string;
	address: string;
}
interface IAddressProps {
    address: IAddress[];
	className?: string
}

const TransactionModal = ({ className, defaultAddress }: { className?: string, defaultAddress: string }) => {
	const [openTransactionModal, setOpenTransactionModal] = useState<boolean>(false);
	const { activeMultisig } = useGlobalUserDetailsContext();
	return (
		<>
			<PrimaryButton disabled={!activeMultisig} className='bg-primary text-white w-fit' onClick={() => setOpenTransactionModal(true)}>
				<p className='font-normal text-sm'>Send</p>
			</PrimaryButton>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenTransactionModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Send Funds</h3>}
				open={openTransactionModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<SendFundsForm defaultSelectedAddress={defaultAddress} onCancel={() => setOpenTransactionModal(false)} />
			</Modal>
		</>
	);
};

const AddAddress: FC<IAddressProps> = ({ address, className }) => {
	const { openModal } = useModalContext();
	const { network } = useGlobalApiContext();

	return (
		<div className='text-sm font-medium leading-[15px] h-[60vh] overflow-y-auto'>
			<article className='grid grid-cols-4 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>
					Name
				</span>
				<span className='col-span-2'>
					Address
				</span>
				<span className='col-span-1'>
					Action
				</span>
			</article>
			{
				address.map(({ address, name }, index) => {
					return (
						<>
							<article className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white my-2' key={index}>
								<p title={name} className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-base'>
									{name} {index === 0 && <Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}><Badge className='ml-2' status='success' /></Tooltip>}
								</p>
								<div className='col-span-2 flex items-center'>
									<Identicon
										className='image identicon mx-2'
										value={address}
										size={30}
										theme={'polkadot'}
									/>
									<span title={address} className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'>{address}</span>
									<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
										<button className='hover:text-primary' onClick={() => copyText(address, true, network)}><CopyIcon /></button>
										<a href={`https://${network}.subscan.io/account/${address}`} target='_blank' rel="noreferrer" >
											<ExternalLinkIcon  />
										</a>
									</div>
								</div>
								<div className='col-span-1 flex items-center justify-right gap-x-[10px]'>
									<button
										onClick={() => openModal('Edit Address', <EditAddress addressToEdit={address} nameToEdit={name} />) }
										className='text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
										<EditIcon />
									</button>
									{index > 0 &&
									<button
										onClick={() => openModal('Remove Address', <RemoveAddress addressToRemove={address} name={name} />) }
										className='text-failure bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
										<DeleteIcon />
									</button>}
									<TransactionModal defaultAddress={address} className={className} />
								</div>
							</article>
							{address.length - 1 !== index? <Divider className='bg-text_secondary my-0' />: null}
						</>
					);
				})
			}
		</div>
	);
};

export default styled(AddAddress)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;