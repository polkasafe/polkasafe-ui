// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import Error404Img from 'src/assets/icons/Error404.svg';

const Error404 = () => {
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto flex items-center justify-center'>
			<div className='flex flex-col items-center justify-center'>
				<img src={Error404Img} alt="bg"/>
				<h1 className="text-2xl text-primary m-5 font-bold">Oops!</h1>
				<p className='text-text_secondary text-sm mb-5'>Looks like you’re lost. We can’t seem to find the page you are looking for..</p>
				<Link to="/"><Button className='flex items-center justify-center bg-primary text-white border-none ml-1 py-4'>Back to Home</Button></Link>
			</div>
		</div>
	);
};

export default Error404;