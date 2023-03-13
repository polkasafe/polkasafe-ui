// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { QrDisplayAddress } from '@polkadot/react-qr';
import React from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyAddress from 'src/utils/copyAddress';
import shortenAddress from 'src/utils/shortenAddress';

const QR = () => {
	const { address } = useGlobalUserDetailsContext();
	return (
		<div className='flex flex-col gap-y-5 p-5 bg-bg-secondary rounded-xl items-center'>
			<p className='text-xs md:text-sm text-normal text-text_secondary'>Scan this QR Code with your wallet application</p>
			<div className='flex items-center justify-center'>
				<QrDisplayAddress className='h-80 w-60' address='5CSKEeQw1e84JSy4dkrwZ5KW63vV8gbmB9WsezNE8kRQ4qc3' genesisHash='afsfhaehfoiho' />
			</div>
			<div className='flex items-center gap-x-3 justify-center bg-highlight rounded-lg py-[10px] px-5'>
				<p className='text-xs md:text-sm leading-[15px]'>
					<span className='text-primary font-medium'>
                        dot:
					</span>
					<span className='font-normal ml-[6px]'>
						{shortenAddress(address)}
					</span>
				</p>
				<p className='text-sm md:text-base text-text_secondary flex items-center gap-x-[9px]'>
					<button onClick={() => copyAddress(address)}><CopyIcon className='hover:text-primary'/></button>
					<a href={`https://www.subscan.io/account/${address}`} target='_blank' rel="noreferrer" >
						<ExternalLinkIcon  />
					</a>
				</p>
			</div>
		</div>
	);
};

export default QR;