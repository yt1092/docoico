export type Spot = {
  id: string;
  name: string;
  category: 'グルメ' | 'カフェ' | 'アミューズメント' | 'ショッピング' | string;
  lat: number;
  lng: number;
  google_place_id?: string;
  instagram_url?: string;
  comfort_score?: number;
  created_at?: string;
};
