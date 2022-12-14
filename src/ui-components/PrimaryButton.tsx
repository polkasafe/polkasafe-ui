// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import classNames from 'classnames';
import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	children: ReactNode;
	onClick?: () => void;
	size?: SizeType;
}

const PrimaryButton = ({ className, children, onClick, size } : Props) => {
	return (
		<Button size={size} className={classNames('flex items-center border-none outline-none rounded-lg text-white font-medium text-base md:font-bold md:text-lg', className)} onClick={onClick}>
			{children}
		</Button>
	);
};

export default PrimaryButton;