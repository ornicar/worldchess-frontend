export interface UserInfo {
  id: number; // Check for all resources
  firstName: string;
  lastName: string;
  user: UserAccount;
  premium: boolean;
  subscriptions: Subscription[];
  orders: Order[];
  emailSubscribed: boolean;
}

export interface UserAccount {
  email: string;
  internalAccount: InternalAccount;
  twitterAccount: TwitterAccount;
  facebookAccount: FacebookAccount;
}

export interface InternalAccount {
  username: string;
  email: string;
}

export interface TwitterAccount {
  name: string;
}

export interface FacebookAccount {
  name: string;
}

export interface Subscription {
  currentPeriodEnd: number;
}

export interface Order {
  id: string;
}

export interface Tournament {
  id: string;
  active: boolean;
  stripeIds: string[];
  name: string;
  details: string;
  price: number;
  discountedPrice: number;
  activeBroadcast: boolean;
  mainImage: string | null;
  tournamentDate: number;
  createdDate: number;
  lastModifiedDate: number;
}
