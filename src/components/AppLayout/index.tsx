// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Layout } from 'antd';
import React from 'react';
import styled from 'styled-components';

import SwitchRoutes from './SwitchRoutes';

const { Content } = Layout;

const AppLayout = ({ className } : { className?: string }) => {
	return (
		<Layout className={className}>
			<Content className='content'>
				<SwitchRoutes/>
			</Content>
		</Layout>
	);
};

export default styled(AppLayout)`
	background: transparent !important;
`;