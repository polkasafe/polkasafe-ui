// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import Owners from 'src/components/Settings/Owners';
import SafeDetails from 'src/components/Settings/SafeDetails';
import ContentHeader from 'src/ui-components/ContentHeader';
import ContentWrapper from 'src/ui-components/ContentWrapper';
import RemoveSafeBtn from 'src/ui-components/RemoveSafeBtn';

export enum EContentType {
    OWNERS,
    SAFE_DETAILS
}

const Settings = () => {
	const [contentType] = useState<EContentType>(EContentType.OWNERS);

	return (
		<div>
			<ContentHeader
				title={'Settings'}
				subTitle={<h3 className='ml-2 text-base font-normal'>
                    / {contentType === EContentType.OWNERS? 'Owners': 'Safe Details'}
				</h3>}
				rightElm={<RemoveSafeBtn/>}
			/>
			<ContentWrapper>
				{contentType === EContentType.OWNERS? <Owners/>: <SafeDetails />}
			</ContentWrapper>
		</div>
	);
};

export default Settings;