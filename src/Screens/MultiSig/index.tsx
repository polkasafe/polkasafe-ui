// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EditOutlined, LinkOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useState } from 'react';
import CreateMultisig from 'src/components/Multisig/CreateMultisig';
import LinkMultisig from 'src/components/Multisig/LinkMultisig';
// import NetworksList from 'src/components/Multisig/NetworksList';

const MultiSig = () => {
	const [createMultisig, setCreateMultisig] = useState(false);
	const [linkMultisig, setLinkMultisig] = useState(false);
	const handleCreateMultisig = (): any => {
		setCreateMultisig(true);
	};
	const handleLinkMultisig = (): any => {
		setLinkMultisig(current => !current);
		setCreateMultisig(false);
	};
	return (
		<div>
			<div>
				<h2 className="text-lg font-bold">Add Multisig</h2>
				<div className='flex'>
					<Button className={`flex justify-center items-center shadow-lg m-3 ${createMultisig ? 'bg-blue_primary text-blue_secondary' : 'bg-white text-blue_primary'}`} onClick={handleCreateMultisig} icon={<LinkOutlined />}>Add Multisig</Button>
					<Button className={`flex justify-center items-center shadow-lg m-3 ${linkMultisig ? 'bg-blue_primary text-blue_secondary' : 'bg-white text-blue_primary'}`} onClick={handleLinkMultisig} icon={<EditOutlined />}>Link Multisig</Button>
				</div>
			</div>
			<div className="absolute right-10 top-12">
				{/* <NetworksList /> */}
				{linkMultisig && <LinkMultisig />}
			</div>
			{createMultisig && <CreateMultisig />}
		</div>
	);
};

export default MultiSig;
