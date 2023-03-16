// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import AddressQr from 'src/ui-components/AddressQr';
import { CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import shortenAddress from 'src/utils/shortenAddress';

const QR = () => {
	const { network } = useGlobalApiContext();
	return (
		<div className='flex flex-col gap-y-5 p-5 bg-bg-secondary rounded-xl items-center'>
			<p className='text-xs md:text-sm text-normal text-text_secondary'>Scan this QR Code with your wallet application</p>
			<div className='flex items-center justify-center'>
				<AddressQr address='165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb' />
			</div>
			<div className='flex items-center gap-x-3 justify-center bg-highlight rounded-lg py-[10px] px-5'>
				<p className='text-xs md:text-sm leading-[15px]'>
					<span className='text-primary font-medium'>
                        dot:
					</span>
					<span className='font-normal ml-[6px]'>
						{shortenAddress('165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb')}
					</span>
				</p>
				<p className='text-sm md:text-base text-text_secondary flex items-center gap-x-[9px]'>
					<button onClick={() => copyText('165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb')}><CopyIcon className='hover:text-primary'/></button>
					<a href={`https://${network}.subscan.io/account/165gUhnbTdZEfjY4drYNybJuRBf3MLJfZxQUraJDeX17B4Pb`} target='_blank' rel="noreferrer" >
						<ExternalLinkIcon  />
					</a>
				</p>
			</div>
		</div>
	);
};

export default QR;