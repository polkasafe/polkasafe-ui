// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactElement } from 'react';
import Lottie from 'react-lottie-player';

import FailedScreen from './lottie-files/failed-animation.json';

interface Props {
	message?: string
	width?: number
	waitMessage?: string
}

function FailedTransactionLottie({ message, width = 350 }: Props): ReactElement {

	return (
		<div className='w-full flex flex-col justify-center items-center'>
			<Lottie
				animationData={FailedScreen}
				style={{
					height: width,
					width: width
				}}
				play={true}
			/>
			<div className='text-sidebarBlue font-medium' >{message}</div>
		</div>
	);
}

export default FailedTransactionLottie;
