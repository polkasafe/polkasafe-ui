// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import React, { FC } from 'react';
import styled from 'styled-components';

interface IAddressProps {
	address: string
	className?: string
	displayInline?: boolean
}

const Address: FC<IAddressProps> = (props) => {
	const { address, className, displayInline } = props;
	return (
		<div className={displayInline ? `${className} display_inline`: className}>
			<Identicon
				className='image identicon'
				value={address}
				size={displayInline ? 20 : 32}
				theme={'polkadot'}
			/>
		</div>
	);
};

export default styled(Address)`
	position: relative;
	display: flex;
	align-items: center;
	
	.content {
		display: inline-block;
		color: nav_blue !important;
	}

	.identicon {
		margin-right: 0.25rem;
	}

	.identityName {
		filter: grayscale(100%);
	}

	.header {
		color: black_text;
		font-weight: 500;
		margin-right: 0.4rem;
	}

	.description {
		color: nav_blue;
		margin-right: 0.4rem;
	}

	.display_inline {
		display: inline-flex !important;
	}

	.sub {
		color: nav_blue;
		line-height: inherit;
	}
`;
