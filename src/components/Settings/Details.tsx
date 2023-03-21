// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_MULTISIG_NAME } from 'src/global/default';
import { DeleteIcon, EditIcon } from 'src/ui-components/CustomIcons';

import RemoveMultisigAddress from './RemoveMultisig';
import RenameMultisig from './RenameMultisig';

const Details = () => {

	const { activeMultisig, multisigAddresses, multisigSettings } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const { openModal } = useModalContext();

	return (
		<div className='h-full flex flex-col'>
			<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>
				Details
			</h2>
			<article className=' flex flex-col flex-1 bg-bg-main p-5 rounded-xl text-text_secondary text-sm font-normal leading-[15px]'>
				<div className='flex items-center justify-between gap-x-5'>
					<span>
						Version:
					</span>
					<span className='bg-highlight text-primary flex items-center gap-x-3 rounded-lg px-2 py-[10px] font-medium'>
						1.0
						{/* <ExternalLinkIcon className='text-primary' /> */}
					</span>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-5'>
					<span>Blockchain:</span>
					<span className='text-white capitalize'>{network}</span>
				</div>
				{activeMultisig &&
					<div className='flex items-center justify-between gap-x-5 mt-7'>
						<span>Safe Name:</span>
						<span className='text-white flex items-center gap-x-3'>
							{multisigSettings?.[activeMultisig]?.name || multisigAddresses?.find((item) => item.address === activeMultisig)?.name || DEFAULT_MULTISIG_NAME}
							<button onClick={() => openModal('Rename Multisig', <RenameMultisig name={multisigSettings?.[activeMultisig]?.name || multisigAddresses.find((item) => item.address === activeMultisig)?.name || DEFAULT_MULTISIG_NAME} />)}>
								<EditIcon className='text-primary cursor-pointer' />
							</button>
						</span>
					</div>
				}
				<div className='flex-1'></div>
				<Button disabled={!activeMultisig} size='large' onClick={() => openModal('Remove Multisig', <RemoveMultisigAddress/>)} className='border-none outline-none text-failure bg-failure bg-opacity-10 flex items-center gap-x-3 justify-center rounded-lg p-[10px] w-full mt-7'>
					<DeleteIcon />
					<span>Remove Safe</span>
				</Button>
			</article>
		</div>
	);
};

export default Details;