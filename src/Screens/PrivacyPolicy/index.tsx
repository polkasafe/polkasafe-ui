// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

const PrivacyPolicy = () => {
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto flex'>
			<div className='w-fit text-sm m-5 overflow-auto [&::-webkit-scrollbar]:hidden'>
				<p className='text-white text-sm'>
                    At <span className='font-bold'>PolkaSafe</span>, accessible at polkasafe.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Website Name and how we use it.
					<p className='my-2'>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us through email at Email@Website.com</p>
					<p>This privacy policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Website Name. This policy is not applicable to any information collected offline or via channels other than this website.</p>
					<p className="font-bold my-2">Consent</p>
					<p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
					<p className="font-bold my-2">Information we collect</p>
					<p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
					<p className='my-2'>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
					<p>When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>
					<p className="font-bold my-2">How we use your information</p>
					<p>We use the information we collect in various ways, including to:</p>
					<ul className='mt-2 list-inside'>
						<li>Provide, operate, and maintain our website</li>
						<li>Improve, personalize, and expand our website</li>
						<li>Understand and analyze how you use our website</li>
						<li>Develop new products, services, features, and functionality</li>
						<li>Send you emails</li>
						<li>Find and prevent fraud</li>
						<li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other <br /> information relating to the website, and for marketing and promotional purposes</li>
					</ul>
				</p>
			</div>
		</div>
	);
};

export default PrivacyPolicy;