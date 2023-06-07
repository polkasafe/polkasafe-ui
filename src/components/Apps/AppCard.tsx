// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ReactComponent as  Subid } from 'src/assets/subid.svg';
import { useModalContext } from 'src/context/ModalContext';

import AppModal from './AppModal';

const AppCard = () => {
	const { openModal } = useModalContext();
	return (
		<>
			<div className={'bg-bg-secondary flex flex-col cursor-pointer rounded-lg px-[16px] py-[20px] w-[380px] min-h-[260px]'} onClick={() => openModal('', <AppModal />)}>
				<div className='flex flex-col gap-5'>
					<Subid className='w-[50px] h-[50px]'/>
					<div className='flex flex-col gap-[10px]'>
						<div className="text-2xl text-white font-semibold">Sub ID</div>
						<div className='text-[#8B8B8B] font-medium text-base leading-tight font-archivo'>One Stop Shop For All Substrate <br /> Addresses And Balances</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default AppCard;