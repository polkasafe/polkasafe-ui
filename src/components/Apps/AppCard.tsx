// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import subid from 'src/assets/subid.svg';
import { useModalContext } from 'src/context/ModalContext';

import AppModal from './AppModal';
const AppCard = () => {
	const { openModal } = useModalContext();
	return (
		<>
			<div className={'bg-bg-secondary flex flex-col cursor-pointer justify-around rounded-lg py-3  scale-90 w-[30%] origin-top-left'} onClick={() => openModal('', <AppModal />)}>
				<div className='flex flex-col px-5 h-[18rem] overflow-auto w-[1/4]'>
					<img src={subid} alt="" height='40' width='40' />
					<div className='mt-4'>
						<div className="text-2xl text-white font-semibold">Sub ID</div>
						<div className='mt-2 text-[#8B8B8B] font-medium text-base leading-tight font-archivo'>One Stop Shop For All Substrate <br /> Addresses And Balances</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default AppCard;