// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import qr from 'src/assets/icons/qr.svg';
import { CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';

const QR = () => {
	return (
		<div className='flex flex-col gap-y-5 p-5 bg-bg-secondary rounded-xl items-center'>
			<p className='text-xs md:text-sm text-normal text-text_secondary'>Scan this QR Code with your wallet application</p>
			<div className='flex items-center justify-center'>
				<img className='block max-w-[120px] max-h-[120px] md:max-w-[164.35px] md:max-h-[164.35px]' src={qr} alt="qr code image" />
			</div>
			<div className='flex items-center gap-x-3 justify-center bg-highlight rounded-lg py-[10px] px-5'>
				<p className='text-xs md:text-sm leading-[15px]'>
					<span className='text-primary font-medium'>
                        dot:
					</span>
					<span className='font-normal ml-[6px]'>
                        3J98t1W...RhWNLy
					</span>
				</p>
				<p className='text-sm md:text-base text-text_secondary flex items-center gap-x-[9px]'>
					<CopyIcon />
					<ExternalLinkIcon />
				</p>
			</div>
		</div>
	);
};

export default QR;