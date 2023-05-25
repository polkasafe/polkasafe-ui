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
	className?: string
}

function FailedTransactionLottie({ message, width = 350, waitMessage, className }: Props): ReactElement {

	return (
		<div className={`w-full flex flex-col justify-center items-center ${className}`}>
			<Lottie
				animationData={FailedScreen}
				style={{
					width: width
				}}
				play={true}
			/>
			<div className='font-medium text-lg mb-1 text-failure' >{message}</div>
			<div className='text-text_secondary max-w-[452px] text-center' >{waitMessage}</div>
		</div>
	);
}

export default FailedTransactionLottie;
