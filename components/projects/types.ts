export type Category = "Web" | "Design" | "Mobile" | "Game";

export type Project = {
  name: string;
  year: string;
  description: string;
  tags: string[];
  categories: Category[];
  href?: string;
  note?: string;
  featured?: boolean;
};
