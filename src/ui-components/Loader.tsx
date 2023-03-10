// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Spin } from 'antd';
import React from 'react';

const Loader = ({ size='default' }: { size?: 'small' | 'default' | 'large' }) => {
	return (
		<div className='flex justify-center items-center h-full'>
			<Spin size={size} tip='Loading...' />
		</div>
	);
};

export default Loader;