// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Button, Divider, Modal } from 'antd';
import React, { useState } from 'react';
import EditAddress from 'src/components/AddressBook/Edit';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { CopyIcon, DeleteIcon, EditIcon, ExternalLinkIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import styled from 'styled-components';

import RemoveOwner from './Remove';

const RemoveSignatoryModal = ({ address, className, signatoriesLength, threshold }: { address: string, className?: string, signatoriesLength: number,threshold: number }) => {
	const [openRemoveSignatoryModal, setOpenRemoveSignatoryModal] = useState(false);
	return (
		<>
			<Button
				onClick={() => setOpenRemoveSignatoryModal(true)}
				className='text-failure border-none outline-none bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
				<DeleteIcon />
			</Button>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenRemoveSignatoryModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Remove Signatory</h3>}
				open={openRemoveSignatoryModal}
				className={`${className} w-auto md:min-w-[500px]`}
			>
				<RemoveOwner onCancel={() => setOpenRemoveSignatoryModal(false)} oldSignatoriesLength={signatoriesLength} oldThreshold={threshold} address={address} />
			</Modal>
		</>
	);
};

const ListOwners = ({ className }: { className?: string }) => {
	const { network } = useGlobalApiContext();
	const { openModal } = useModalContext();
	const { multisigAddresses, activeMultisig, addressBook, address: userAddress } = useGlobalUserDetailsContext();
	const multisig = multisigAddresses?.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	const signatories = multisig?.signatories;

	return (
		<div className='text-sm font-medium leading-[15px] '>
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
			<article>
				<div className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'>
					<p className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'>
						{addressBook.find((item) => item.address === userAddress)?.name || DEFAULT_ADDRESS_NAME}
					</p>
					<div className='col-span-2 flex items-center'>
						<Identicon
							className='image identicon mx-2'
							value={userAddress}
							size={30}
							theme={'polkadot'}
						/>
						<span title={userAddress} className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'>{userAddress}</span>
						<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
							<button className='hover:text-primary' onClick={() => copyText(userAddress, true, network)}><CopyIcon /></button>
							<a href={`https://${network}.subscan.io/account/${userAddress}`} target='_blank' rel="noreferrer" >
								<ExternalLinkIcon  />
							</a>
						</div>
					</div>
					<div className='col-span-1 flex items-center gap-x-[10px]'>
						<Button
							onClick={() => openModal('Edit Address', <EditAddress addressToEdit={userAddress} />) }
							className='text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8 border-none outline-none'>
							<EditIcon className='' />
						</Button>
					</div>
				</div>
				<Divider className='bg-text_secondary my-0' />
			</article>
			{
				signatories?.filter((item) => item !== userAddress).map((address, index) => {
					const name = addressBook.find((item) => item.address === address)?.name || DEFAULT_ADDRESS_NAME;
					return (
						<article key={index}>
							<div className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'>
								<p className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'>
									{name}
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
								<div className='col-span-1 flex items-center gap-x-[10px]'>
									<Button
										onClick={() => openModal('Edit Address', <EditAddress addressToEdit={address} />) }
										className='text-primary border-none outline-none bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
										<EditIcon className='' />
									</Button>
									{signatories.length > 2 &&
										<RemoveSignatoryModal threshold={multisig?.threshold || 2} className={className} signatoriesLength={signatories.length || 2} address={address} />
									}
								</div>
							</div>
							{signatories.length - 1 !== index? <Divider className='bg-text_secondary my-0' />: null}
						</article>
					);
				})
			}
		</div>
	);
};

export default styled(ListOwners)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;