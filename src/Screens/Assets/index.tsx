// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import AssetsTable from 'src/components/Assets/AssetsTable';
import DragDrop from 'src/components/Assets/DropDown';

const index = () => {
	return (
		<div>
			<div className="grid grid-cols-12 gap-4">
				<div className="col-start-1 col-end-13">
					<div className="flex items-center justify-between">
						<div className='flex items-center'>
							<h2 className="text-lg font-bold">Assets</h2>
							<p>/ Coins</p>
						</div>
						<div>
							<DragDrop />
						</div>
					</div>
				</div>
				<div className='col-start-1 col-end-13'>
					<AssetsTable />
				</div>
			</div>
		</div>
	);
};

export default index;