
export interface NFTType {
    name:string;
    bgImage:string;
    proto:number;
    mana:number;
  }
  
  export interface CardType {
    price_usd: string;
    id:string;
    nft:NFTType;
    count:number;
    user_hold:number;
  }
  