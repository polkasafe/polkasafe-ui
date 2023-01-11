// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG as FirebaseOptions;
const app = initializeApp(firebaseConfig);

const firebaseFunctions = getFunctions(app);

export { firebaseFunctions };