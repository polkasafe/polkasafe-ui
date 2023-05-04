// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React from 'react';

interface Props {
	onClick: (React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>)
	icon: string
	name: string
	disabled: boolean;
	className?: string;
}

const WalletButton = ({ disabled, onClick, icon, className }: Props) => {
	return (
		<Button className={`flex items-center py-5 px-8 justify-center rounded-md bg-bg-secondary outline-none ${className}`} onClick={onClick} disabled={disabled}>
			<img src={icon} alt='parachain icon' height={25} width={25} />
		</Button>
	);
};

export default WalletButton;