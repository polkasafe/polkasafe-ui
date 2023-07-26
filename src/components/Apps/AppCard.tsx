// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import astarLogo from 'src/assets/parachains-logos/astar-logo.png';
import polkaLogo from 'src/assets/polkassembly-logo.svg';
import subid from 'src/assets/subid.svg';
import { useModalContext } from 'src/context/ModalContext';

import AppModal from './AppModal';

const AppCard = ({ name, description }:{name:string, description:string}) => {
	const { openModal } = useModalContext();
	const logo = name === 'Polkassembly' ? polkaLogo : name === 'Sub ID' ? subid : astarLogo;
	return (
		<>
			<div className={'bg-bg-secondary flex flex-col cursor-pointer rounded-lg px-[16px] py-[20px] w-[380px] min-h-[260px]'} onClick={() => openModal('', <AppModal name={name} description={description} />)}>
				<div className='flex flex-col gap-5'>
					<img src={logo} alt={name} className='w-[50px] h-[50px]' />
					<div className='flex flex-col gap-[10px]'>
						<div className="text-2xl text-white font-semibold">{name}</div>
						<div className='text-[#8B8B8B] font-medium text-base leading-tight font-archivo'>{description}</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default AppCard;