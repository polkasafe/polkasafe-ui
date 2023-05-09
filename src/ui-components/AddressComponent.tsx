// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Badge } from 'antd';
import React from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import shortenAddress from 'src/utils/shortenAddress';

import { CopyIcon, ExternalLinkIcon } from './CustomIcons';

interface IAddressComponent{
    address: string
    iconSize?: number
	withBadge?: boolean
}

const AddressComponent = ({ address, withBadge=true, iconSize=30 }: IAddressComponent) => {

	const { network } = useGlobalApiContext();
	const { addressBook, multisigAddresses, activeMultisig } = useGlobalUserDetailsContext();

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	return (
		<div
			className=' flex items-center gap-x-3'
		>
			{multisig?.proxy && getSubstrateAddress(multisig.proxy) === getSubstrateAddress(address) ?
				withBadge ?
					<Badge count='Proxy' offset={[-45, 0]} className='border-none' color='#FF79F2'>
						<Identicon
							className={'border-2 rounded-full bg-transparent border-[#FF79F2] p-1'}
							value={address}
							size={iconSize}
							theme='polkadot'
						/>
					</Badge> : <Identicon
						className={'border-2 rounded-full bg-transparent border-[#FF79F2] p-1'}
						value={address}
						size={iconSize}
						theme='polkadot'
					/>
				:
				multisig?.address === address ?
					withBadge ?
						<Badge count='Multisig' offset={[-45, 0]} className='border-none' color='#1573FE'>
							<Identicon
								className={'border-2 rounded-full bg-transparent border-primary p-1'}
								value={address}
								size={iconSize}
								theme='polkadot'
							/>
						</Badge> :
						<Identicon
							className={'border-2 rounded-full bg-transparent border-primary p-1'}
							value={address}
							size={iconSize}
							theme='polkadot'
						/>
					:
					<Identicon
						value={address}
						size={iconSize}
						theme='polkadot'
					/>
			}
			<div>
				<div
					className='font-medium text-sm flex text-white'
				>
					{addressBook?.find((item) => item.address === address)?.name || multisigAddresses.find((item) => item.address === address || item.proxy === address)?.name || DEFAULT_ADDRESS_NAME}
				</div>
				<div
					className='flex items-center gap-x-3 font-normal text-xs text-text_secondary'
				>
					<span>
						{shortenAddress(getEncodedAddress(address, network) || '')}
					</span>
					<span
						className='flex items-center gap-x-2'
					>
						<button onClick={() => copyText(address, true, network)}><CopyIcon className='hover:text-primary'/></button>
						<a href={`https://${network}.subscan.io/account/${getEncodedAddress(address, network)}`} target='_blank' rel="noreferrer" >
							<ExternalLinkIcon  />
						</a>
					</span>
				</div>
			</div>
		</div>
	);
};

export default AddressComponent;