// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC } from 'react';
import PrimaryButton from 'src/ui-components/PrimaryButton';

export interface IAsset {
	asset: string;
	balance: string;
	imgSrc: string;
	value: string;
}
interface IAssetsProps {
    assets: IAsset[];
}

const AssetsTable: FC<IAssetsProps> = ({ assets }) => {
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
				assets.map(({ balance, imgSrc, asset, value }, index) => {
					return (
						<>
							<article className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white' key={index}>
								<div className='col-span-1 flex items-center'>
									<div className='flex items-center justify-center overflow-hidden rounded-full w-4 h-4'>
										<img src={imgSrc} alt="profile img" />
									</div>
									<span title={asset} className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'>{asset}</span>
								</div>
								<p title={balance} className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'>
									{balance}
								</p>
								<p title={value} className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'>
									{value}
								</p>
								<PrimaryButton className='bg-primary text-white w-fit'>
									<p className='font-normal text-sm'>Send</p>
								</PrimaryButton>
							</article>
							{assets.length - 1 !== index? <Divider className='bg-text_secondary my-0' />: null}
						</>
					);
				})
			}
		</div>
	);
};

export default AssetsTable;