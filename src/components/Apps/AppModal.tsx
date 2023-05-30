// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import subid from 'src/assets/subid.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { ArrowRightIcon } from 'src/ui-components/CustomIcons';
const AppModal = () => {
	const { setiframeVisibility } = useGlobalApiContext();
	const { closeModal } = useModalContext();
	return (
		<>
			<div className={'flex flex-col cursor-pointer justify-around rounded-lg scale-90 w-[100%] h-[100%] origin-top-left'} >
				<div className='flex flex-col h-[18rem] overflow-auto w-[110%]'>
					<img src={subid} alt="" height='60' width='60' />
					<div className='mt-4'>
						<div className="text-xl text-white font-semibold">Sub ID</div>
						<div className='mt-2 text-[#8B8B8B] font-medium text-14 leading-tight font-archivo'>One Stop Shop For All Substrate Addresses And Balances</div>
					</div>
					<div className='mt-5 text-[#8B8B8B] font-medium text-base leading-tight font-archivo'>Available networks</div>
					<button
						className={
							'rounded-lg p-2 my-2 text-sm leading-[15px] w-[100px] text-white text-primary bg-highlight'
						}>
						Polkadot
					</button>
					<button className='mt-auto text-white bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-1 cursor-pointer'
						onClick={() => {closeModal();setiframeVisibility(true);}}
					>
						<span className='font-medium text-xs'>Open app</span>
						<ArrowRightIcon className='text-sm' />
					</button>
				</div>
			</div></>
	);
};
export default AppModal;