export interface ShoppingItem {
  id: string;
  name: string;
  isCompleted: boolean;
  emoji: string;
  category: string;
  createdAt: number;
  isAnalysing?: boolean;
}

