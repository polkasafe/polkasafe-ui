This is a simple docs to help you testing SDK

```
Note: This branch and this code is only for test SDK functionality, this code will never be on production or merged
```

## Link polkasafe 
STEP 1
```
<!-- clone this repo https://github.com/AleemAlam/serer-api -->
git clone https://github.com/AleemAlam/serer-api

<!-- go to directory -->
cd sdk-test

<!-- use this command to set-up link -->
npm link
```

NOTE: Make sure you this repo and polkasafe-ui repo folder should be in a single folder

```
Main Folder
    - polkasafe-ui
        - ....
    - sdk-test
        - ....

```

STEP 2
```
<!-- Go to polkasafe-UI repo -->
npm link polkasafe

<!-- if you got an error  -->
npm link --force polkasafe

```
# Polkasafe Usage 
You need to create an instance to use polkasafe SDK

current I created a context TestContext ( Just for testing propose )

Search TestContext in context folder

creating an instance is important to use polkasafe after that we need to setSignature

if want to check all the places where I use SDK you can search ::BySDK::

then can Use all functionality

( Every implementation you will see some comments )

ConnectAddress
- File ConnectWallet/index.tsx
- Line 95

Create Multisig
- File CreateMultisig.tsx
- Line 134

Create Proxy
- File AddProxy.tsx
- Line 70

AddAddress
- File AddAddress.tsx
- Line 67

RemoveAddress
- File RemoveAddress.tsx
- Line 41

TransferFundsByMultisig
- File SendFundsForm.tsx
- Line 144

Edit MultiSig
- File Owners/Add.tsx
- Line 171

Get Transaction for MultiSig
- File History/index.tsx
- Line 58 and 67

Get Queue for MultiSig
- File Queued/index.tsx
- Line 66

Get data for MultiSig
- File Transaction.tsx
- Line 106

Approve transaction 
- File Transaction.tsx
- Line 159, 176 and 193

Cancel transaction 
- File Transaction.tsx
- Line 245



