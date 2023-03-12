// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC } from 'react';
import { useModalContext } from 'src/context/ModalContext';
import { IAsset } from 'src/types';
import PrimaryButton from 'src/ui-components/PrimaryButton';

import SendFundsForm from '../SendFunds/SendFundsForm';
import NoAssets from './NoAssets';

interface IAssetsProps {
    assets: IAsset[];
}

const AssetsTable: FC<IAssetsProps> = ({ assets }) => {
	const { openModal, toggleVisibility } = useModalContext();
	return (
		<div className='text-sm font-medium leading-[15px] '>
			<article className='grid grid-cols-4 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>
					Asset
				</span>
				<span className='col-span-1'>
					Balance
				</span>
				<span className='col-span-1'>
					Value
				</span>
				<span className='col-span-1'>
					Action
				</span>
			</article>
			{
				assets && assets.length > 0 ?
					assets.map(({ balance_token, balance_usd, logoURI, name, symbol }, index) => {
						return (
							<>
								<article className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white' key={index}>
									<div className='col-span-1 flex items-center'>
										<div className='flex items-center justify-center overflow-hidden rounded-full w-4 h-4'>
											<img src={logoURI} alt="profile img" />
										</div>
										<span title={name} className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'>{name}</span>
									</div>
									<p title={balance_token} className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'>
										{balance_token} {symbol}
									</p>
									<p title={balance_usd} className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'>
										{balance_usd ? balance_usd : '-'}
									</p>
									<PrimaryButton onClick={() => openModal('Send Funds', <SendFundsForm onCancel={() => toggleVisibility()} />)} className='bg-primary text-white w-fit'>
										<p className='font-normal text-sm'>Send</p>
									</PrimaryButton>
								</article>
								{assets.length - 1 !== index? <Divider className='bg-text_secondary my-0' />: null}
							</>
						);
					}) : <NoAssets />
			}
		</div>
	);
};

export default AssetsTable;