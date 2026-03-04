export interface LoginModel {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  status: string;
  msg: string;
  data: {
    access_token: string;
    isVerified: boolean;
  };
}

export interface LoginResult {
  accessToken: string;
  isVerified: boolean;
}

export interface RegModel {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  confirmPassword: string;
}

export interface RegResponse {
  status: string;
  message: string;
}

export interface VerifyAccountResponse {
  status: string;
  msg: string;
  data: {
    access_token: string;
  };
}

export interface OtpResponse {
  status: string;
  msg: string;
}

export interface UserResponse {
  status: string;
  msg: string;
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    accountLevel: string;
    active: boolean;
    phoneNumber: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBankResponse {
  status: string;
  msg: string;
  data: Bank[];
}

export interface ResolveAccountResponse {
  status: string;
  msg: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface BankDetailsResponse {
  status: string;
  msg: string;
  data: {
    userId: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  };
}

export interface WalletDetailsResponse {
  status: string;
  msg: string;
  data: {
    userId: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
    id: string;
  };
}

// Add these interfaces to your existing app.model.ts

export interface TransferRequest {
  amount: number;
  bankName: string; // Add this - required by backend
  accountNumber: string;
  accountName: string; // Add this - required by backend
  bankCode: string;
  narration: string;
  pin: string; // Make this required (not optional)
  categoryId?: string; // Optional - you can set a default
  saveAsBeneficiary?: boolean; // This might be client-side only
}

export interface TransferResponse {
  status: string;
  msg: string;
  data: TransferData;
}

export interface TransferData {
  userId: string;
  amount: number;
  type: 'debit' | 'credit';
  categoryId: string;
  status: 'pending' | 'completed' | 'failed';
  narration: string;
  reference: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface SetPinRequest {
  pin: string;
}

export interface ChangePinRequest {
  oldPin: string;
  newPin: string;
}

export interface PinResponse {
  status: string;
  msg: string;
}

// Optional - if you need PIN verification endpoint later
// export interface PinVerificationRequest {
//   pin: string;
// }

// export interface PinVerificationResponse {
//   status: string;
//   msg: string;
//   data?: {
//     valid: boolean;
//   };
// }
