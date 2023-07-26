// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import astarLogo from 'src/assets/parachains-logos/astar-logo.png';
import polkaLogo from 'src/assets/polkassembly-logo.svg';
import subid from 'src/assets/subid.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { Apps, useGlobalDAppContext } from 'src/context/DAppContext';
import { useModalContext } from 'src/context/ModalContext';
import { networks } from 'src/global/networkConstants';
import { ArrowRightIcon } from 'src/ui-components/CustomIcons';

const AppModal = ({ name, description }: { name: string, description: string }) => {
	const { setIframeVisibility } = useGlobalDAppContext();
	const { closeModal } = useModalContext();
	const { network } = useGlobalApiContext();
	const logo = name === 'Polkassembly' ? polkaLogo : name === 'Sub ID' ? subid : astarLogo;
	return (
		<>

			<div className={'flex flex-col cursor-pointer justify-around rounded-lg scale-90 w-[100%] -mt-[25px] -mb-[25px] origin-top-left'} >
				<div className='flex flex-col overflow-auto w-[110%]'>
					<img src={logo} alt="" height='70' width='70' />
					<div className='mt-3'>
						<div className="text-3xl text-white font-semibold">{name}</div>
						<div className='mt-2 text-[#8B8B8B] font-medium text-14 leading-tight font-archivo max-w-[450px]'>{description}</div>
					</div>
					<div className='mt-5 flex flex-col gap-3'>
						<div className='text-[#8B8B8B] font-medium text-base text-14 leading-tight font-archivo'>Available networks</div>
						<div className='flex gap-2 flex-wrap max-w-[400px]'>
							{name === 'Astar' ? <button className='rounded-lg py-2 px-[10px] text-sm leading-[15px] text-white text-primary bg-highlight'> astar </button> :
								Object.values(networks).map((net) =>
									<button key={net} className='rounded-lg py-2 px-[10px] text-sm leading-[15px] text-white text-primary bg-highlight'> {net} </button>
								)
							}

						</div>
					</div>
					<button className='mt-10 text-white bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-1 cursor-pointer'
						onClick={() => {
							if(name === 'Polkassembly'){
								window.open(`https://${network}.polkassembly.io/`, '_blank');
								return;
							}
							if(name === 'Astar'){
								window.open('https://portal.astar.network/astar/dapp-staking/discover', '_blank');
								return;
							}
							closeModal();
							setIframeVisibility(name === 'Polkassembly' ? Apps.POLKASSEMBLY : name === 'Sub ID' ? Apps.SUB_ID : Apps.ASTAR);
						}}
					>
						<span className='font-medium text-xs'>Open app</span>
						<ArrowRightIcon className='text-sm' />
					</button>
				</div>
			</div>
		</>
	);
};
export default AppModal;