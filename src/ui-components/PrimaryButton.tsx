// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	children: ReactNode;
	onClick?: () => void;
	size?: SizeType;
	loading?: boolean;
	disabled?: boolean;
	icon?: ReactNode;
	secondary?: boolean
}

const PrimaryButton = ({ className, children, onClick, size, loading, disabled, icon, secondary }: Props) => {
	return (
		<Button
			icon={icon}
			disabled={disabled}
			size={size}
			loading={loading}
			className={`flex items-center border-none outline-none shadow-md rounded-lg font-medium text-xs md:font-bold md:text-sm ${disabled ? 'bg-highlight text-text_secondary' : secondary ? 'bg-highlight text-primary' : 'bg-primary text-white'} ${className}`} onClick={onClick}>
			{children}
		</Button>
	);
};

export default PrimaryButton;