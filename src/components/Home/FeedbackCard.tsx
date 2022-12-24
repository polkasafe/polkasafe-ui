// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

import feedback from '../../assets/icons/feedback.svg';

const FeedbackCard = () => {
	return (
		<div className="h-72 rounded-lg bg-bg-main shadow-lg flex flex-col justify-around items-center">
			<img className='w-[130px]' src={feedback} alt="feedback" />
			<p className='w-[110px]'>Share feedback or suggestions</p>
		</div>
	);
};

export default FeedbackCard;