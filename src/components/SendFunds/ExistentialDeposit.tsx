// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { AutoComplete, Form, Input } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import Balance from 'src/ui-components/Balance';
import { PasteIcon, QRIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import getNetwork from 'src/utils/getNetwork';

import { ParachainIcon } from '../NetworksDropdown';

const network = getNetwork();

const ExistentialDeposit = () => {
	const { activeMultisig, multisigAddresses, addressBook } = useGlobalUserDetailsContext();

	const autocompleteAddresses: DefaultOptionType[] = addressBook.map(a => ({
		label: a.name,
		value: a.address
	}));

	const addRecipientHeading = () => {
		const elm = document.getElementById('recipient_list');
		if (elm) {
			const parentElm = elm.parentElement;
			if (parentElm) {
				const isElmPresent = document.getElementById('recipient_heading');
				if (!isElmPresent) {
					const recipientHeading = document.createElement('p');
					recipientHeading.textContent = 'Addresses';
					recipientHeading.id = 'recipient_heading';
					recipientHeading.classList.add('recipient_heading');
					parentElm.insertBefore(recipientHeading, parentElm.firstChild!);
				}
			}
		}
	};

	return (
		<div className='w-[35vw] max-w-[760px] min-w-[500px]'>

			<p className='text-primary font-normal text-xs leading-[13px] mb-2'>Sending from</p>
			{/* TODO: Make into reusable component */}
			<div className='w-full p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center gap-x-4'>
				<div className='flex items-center justify-center w-10 h-10'>
					<Identicon
						className='image identicon mx-2'
						value={activeMultisig}
						size={30}
						theme={'polkadot'}
					/>
				</div>
				<div className='flex flex-col gap-y-[6px]'>
					<h4 className='font-medium text-sm leading-[15px] text-white'>{multisigAddresses.find(a => a.address === activeMultisig)?.name }</h4>
					<p className='text-text_secondary font-normal text-xs leading-[13px]'>{activeMultisig}</p>
				</div>
				<Balance address={activeMultisig} />
			</div>

			<Form>
				<section className='mt-6'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-2'>Recipient</label>
					<div className='flex items-center gap-x-[10px]'>
						<div className='w-full'>
							<Form.Item
								name="recipient"
								className='border-0 outline-0 my-0 p-0'
							>
								<div className="flex items-center">
									<AutoComplete
										onClick={addRecipientHeading}
										options={autocompleteAddresses}
										id='recipient'
										placeholder="Send to Address.."
									/>
									<div className='absolute right-2'>
										<PasteIcon className='mr-2 text-primary' />
										<QRIcon className='text-text_secondary' />
									</div>
								</div>
							</Form.Item>
						</div>
					</div>
				</section>

				<section className='mt-6'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-2'>Amount</label>
					<div className='flex items-center gap-x-[10px]'>
						<article className='w-full'>
							<Form.Item
								name="amount"
								className='border-0 outline-0 my-0 p-0'
							>
								<div className='flex items-center h-[40px]'>
									<Input
										placeholder="0"
										className="h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24"
										id="amount"
									/>
									<div className='absolute right-0 text-white px-3 flex items-center justify-center'>
										<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
										<span>{ chainProperties[network].tokenSymbol}</span>
									</div>
								</div>
							</Form.Item>
						</article>
					</div>
				</section>

				<section className='mt-6'>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Existential Deposit</label>
					<div className='flex items-center gap-x-[10px]'>
						<article className='w-full'>
							<Form.Item
								name="existential_deposit"
								className='border-0 outline-0 my-0 p-0'
							>
								<div className='flex items-center h-[40px]'>
									<Input
										type='number'
										placeholder="1.0000"
										className="text-sm font-normal leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24"
										id="existential_deposit"
									/>
									<div className='absolute right-0 text-white px-3 flex items-center justify-center'>
										<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
										<span>{ chainProperties[network].tokenSymbol}</span>
									</div>
								</div>
							</Form.Item>
						</article>
					</div>
				</section>

				<section className='mt-6 w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[16px] flex items-center gap-x-[11px]'>
					<span>
						<WarningCircleIcon className='text-base' />
					</span>
					<p className=''>
					The transaction, after application of the transfer fees, will drop the available balance below the existential deposit. As such the transfer will fail. The account needs more free funds to cover the transaction fees.
					</p>
				</section>

				<section className='flex items-center gap-x-5 justify-center mt-10'>
					<CancelBtn className='w-[300px]' onClick={() => {}} />
					<ModalBtn className='w-[300px]' title='Make Transaction' />
				</section>
			</Form>
		</div>
	);
};

export default ExistentialDeposit;