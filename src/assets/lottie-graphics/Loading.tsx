// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactElement } from 'react';
import Lottie from 'react-lottie-player';

import LoadingScreen from './lottie-files/loading-animation.json';

interface Props {
	message?: string
	width?: number
}

function LoadingLottie({ message, width = 350 }: Props): ReactElement {
	return (
		<div className='w-full flex flex-col justify-center items-center relative'>
			<Lottie
				animationData={LoadingScreen}
				style={{
					height: width,
					width: width
				}}
				play={true}
			/>
			<div className='absolute bottom-10 w-full text-center font-medium text-lg text-white' >{message ? message : 'Waiting to create your transaction'}</div>
			<div className='text-text_secondary' >This might take a few minutes. So, sit back and relax...</div>
		</div>
	);
}

export default LoadingLottie;
