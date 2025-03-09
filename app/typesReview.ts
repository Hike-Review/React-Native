// types.ts
export type Review = {
    review_id: number;
    trail_id: number;
    username: string;
    rating: number;
    review_date: string;
    review_text: string;
    userProfile?: string;
  };