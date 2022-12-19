// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Input, Switch } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

import Signotary from './Signotary';

interface IMultisigProps {
	className?: string
}

const CreateMultisig: React.FC<IMultisigProps> = ({ className }) => {
	const [disabled, setDisabled] = useState(false);
	const [signatory, setSignatory] = useState(false);

	const onChange = (checked: boolean) => {
		setDisabled(checked);
		setSignatory(current => !current);
	};
	return (
		<div className={className}>
			<div className="grid grid-cols-12 gap-4">
				<div className='col-start-1 lg:col-end-9 col-end-13'>
					<div className='rounded-lg px-8 py-5 bg-white shadow-lg h-fit mt-3'>
						<div className='flex items-center justify-end'>
							<p>Upload JSON file with signatories</p>
							<Switch className='m-3' size="small" checked={disabled} onChange={onChange} />
						</div>
						<Input className='bg-white my-3' placeholder="Filter by name, address or account index" />
						<div className='flex flex- justify-between items-center'>
							{signatory && <Signotary />}
						</div>
						<div className="m-3">
							<p className='text-blue_primary'>Threshold:</p>
							<Input placeholder="123" />
						</div>
						<div className="mx-3 mt-5">
							<p className='text-blue_primary'>Name:</p>
							<Input placeholder="John Doe" />
						</div>
					</div>
				</div>
			</div>
			<Button type='text' className='text-blue_primary mt-5 text-bold' onClick={() => { }}>&#43; Create</Button>
		</div>
	);
};

export default styled(CreateMultisig)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}
`;

