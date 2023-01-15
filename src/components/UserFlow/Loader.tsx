// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React from 'react';

interface Props {
	className?: string;
}

const Loader = ({ className }: Props) => {
	return (
		<div className={classNames('h-1 rounded-[4px]', className)}></div>
	);
};

export default Loader;