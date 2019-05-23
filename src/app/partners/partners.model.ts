export interface IPartner {
  id: number;
  name: string;
  slider_logo: string;
  url: string;
  main_text: string;
  additional_text: string;
  events: string[];
}

export interface IEventPartner {
  id: number;
  partner: IPartner;
  partner_cat: number;
  partner_seq: number;
}
