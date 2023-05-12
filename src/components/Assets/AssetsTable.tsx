// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import styled from '@xstyled/styled-components';
import { Divider, Modal } from 'antd';
import React, { FC, useState } from 'react';
import { IAsset } from 'src/types';
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';

import SendFundsForm from '../SendFunds/SendFundsForm';
import NoAssets from './NoAssets';

interface IAssetsProps {
    assets: IAsset[];
	className?: string;
}

const AssetsTable: FC<IAssetsProps> = ({ assets, className }) => {

	const [openTransactionModal, setOpenTransactionModal] = useState(false);

	const TransactionModal: FC = () => {
		return (
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenTransactionModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Send Funds</h3>}
				open={openTransactionModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<SendFundsForm onCancel={() => setOpenTransactionModal(false)} />
			</Modal>
		);
	};

	return (
		<div className='text-sm font-medium leading-[15px] scale-[80%] w-[125%] h-[125%] origin-top-left'>
			<TransactionModal/>
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
									<PrimaryButton onClick={() => setOpenTransactionModal(true)} className='bg-primary text-white w-fit'>
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

export default styled(AssetsTable)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;