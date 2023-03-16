// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import React from 'react';
import { Link } from 'react-router-dom';
import AddAddrIcon from 'src/assets/icons/add-addr-icon.svg';
import AddAdress from 'src/components/AddressBook/AddAddress';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { CopyIcon, ExternalLinkIcon, RightArrowOutlined } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';

const AddressCard = ({ className }: { className?: string }) => {
	const { openModal } = useModalContext();
	const { addressBook } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	return (
		<div>
			<div className="flex justify-between flex-row w-full">
				<h2 className="text-xl font-bold text-white">Address Book</h2>
				<div className="flex items-center justify-center text-primary cursor-pointer">
					<Link to="/address-book" className='mx-2 text-primary text-sm'>View All</Link>
					<RightArrowOutlined/>
				</div>
			</div>
			<div className={`${className} bg-bg-main flex flex-col justify-around items-center rounded-lg py-5 shadow-lg text-center h-80 mt-3`}>
				<div className='flex flex-col items-center px-5 h-80 overflow-auto w-[100%] divide-y divide-gray-700'>
					{addressBook.map((item, i) => (
						<div
							className='mb-3 flex items-center gap-x-4'
							key={i}
						>
							<Identicon
								value={item.address}
								size={30}
								theme='polkadot'
							/>
							<div
								className='flex flex-col gap-y-[6px]'
							>
								<p
									className='font-medium text-sm leading-[15px] text-white'
								>
									{item.name}
								</p>
								<p
									className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
								>
									<span>
										{getEncodedAddress(item.address, network)}
									</span>
									<span
										className='flex items-center gap-x-2 text-sm'
									>
										<button onClick={() => copyText(item.address, true, network)}><CopyIcon className='hover:text-primary'/></button>
										<a href={`https://${network}.subscan.io/account/${getEncodedAddress(item.address, network)}`} target='_blank' rel="noreferrer" >
											<ExternalLinkIcon  />
										</a>
									</span>
								</p>
							</div>
						</div>
					))}
				</div>
				<div className='w-[90%] mt-5'>
					<PrimaryButton className='w-[100%] flex items-center justify-center bg-highlight py-5' onClick={() => openModal('Add Address', <AddAdress/>)}>
						<img className='group-hover:fill-white' src={AddAddrIcon} alt="add"/>
						<p className='px-2 text-primary'>Add Address</p>
					</PrimaryButton>
				</div>
				{/* TODO: Empty state */}
				{/* <img src={bookmark} alt="save" />
				<p className='w-[50%]'>You don't have any saved addresses in your address book.</p>
				<PrimaryButton className='w-[90%] mt-5' onClick={() => { }}>+ Add Address</PrimaryButton> */}
			</div>
		</div>
	);
};

export default AddressCard;