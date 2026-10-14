import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Clapperboard,
  GraduationCap,
  Headphones,
  Landmark,
  Layers,
  Podcast,
  Radio,
  Search,
  Smartphone,
  Tv,
  Type,
  Video,
} from "lucide-react";

export type ResourceCategory =
  | "video"
  | "kurse"
  | "apps"
  | "woerterbuch"
  | "lesen-hoeren";

export interface CategoryInfo {
  id: ResourceCategory;
  bangla: string;
  german: string;
  Icon: LucideIcon;
}

export const resourceCategories: CategoryInfo[] = [
  { id: "video", bangla: "ভিডিও", german: "Video", Icon: Clapperboard },
  { id: "kurse", bangla: "কোর্স", german: "Kurse", Icon: GraduationCap },
  { id: "apps", bangla: "অ্যাপ", german: "Apps", Icon: Smartphone },
  { id: "woerterbuch", bangla: "অভিধান", german: "Wörterbücher", Icon: BookOpen },
  { id: "lesen-hoeren", bangla: "পড়া ও শোনা", german: "Lesen & Hören", Icon: Headphones },
];

export interface Resource {
  id: string;
  name: string;
  bangla: string;
  category: ResourceCategory;
  url: string;
  level: string;
  free: boolean;
  Icon: LucideIcon;
}

export const resources: Resource[] = [
  {
    id: "easy-german",
    name: "Easy German",
    bangla:
      "বার্লিনের রাস্তায় আসল মানুষের সাথে জার্মান কথোপকথন — German + English সাবটাইটেল সহ। শোনার দক্ষতা বাড়ানোর সেরা উপায়।",
    category: "video",
    url: "https://www.youtube.com/@EasyGerman",
    level: "A1-geeignet",
    free: true,
    Icon: Video,
  },
  {
    id: "dw-nicos-weg",
    name: "DW Learn German — Nicos Weg",
    bangla:
      "Deutsche Welle-এর ফ্রি A1–B1 ভিডিও কোর্স। গল্পের মাধ্যমে গ্রামার আর শব্দভাণ্ডার — সাইটে গিয়ে 'Nicos Weg' সিলেক্ট করো।",
    category: "kurse",
    url: "https://www.dw.com/en/learn-german/s-2469",
    level: "A1–B1",
    free: true,
    Icon: Tv,
  },
  {
    id: "goethe",
    name: "Goethe-Institut",
    bangla:
      "জার্মান ভাষার অফিসিয়াল ইনস্টিটিউট। ফ্রি অনুশীলনী, A1 পরীক্ষার (Goethe-Zertifikat) স্যাম্পল পেপার আর কোর্সের তথ্য।",
    category: "kurse",
    url: "https://www.goethe.de",
    level: "Alle Niveaus",
    free: true,
    Icon: Landmark,
  },
  {
    id: "anki",
    name: "Anki",
    bangla:
      "SRS (spaced repetition) ফ্ল্যাশকার্ড অ্যাপ — বিজ্ঞানসম্মতভাবে শব্দ মনে রাখার সবচেয়ে কার্যকর টুল। German ডেক ফ্রিতে ডাউনলোড করা যায়।",
    category: "apps",
    url: "https://apps.ankiweb.net",
    level: "Alle Niveaus",
    free: true,
    Icon: Layers,
  },
  {
    id: "dict-cc",
    name: "dict.cc",
    bangla:
      "German↔English অভিধান — প্রতিটা শব্দের article (der/die/das), plural আর native উচ্চারণ অডিও সহ।",
    category: "woerterbuch",
    url: "https://www.dict.cc",
    level: "Alle Niveaus",
    free: true,
    Icon: Type,
  },
  {
    id: "linguee",
    name: "Linguee",
    bangla:
      "শব্দের আসল বাক্যে ব্যবহার দেখো — লক্ষ লক্ষ অনুবাদিত বাক্য থেকে context সহ অর্থ বোঝা যায়।",
    category: "woerterbuch",
    url: "https://www.linguee.com",
    level: "A2+",
    free: true,
    Icon: Search,
  },
  {
    id: "dw-langsam",
    name: "DW — Langsam gesprochene Nachrichten",
    bangla:
      "ধীর গতিতে পড়া জার্মান খবর — প্রতিদিনের অডিও + ট্রান্সক্রিপ্ট। DW Learn German পেজে 'Langsam gesprochene Nachrichten' খুঁজো।",
    category: "lesen-hoeren",
    url: "https://www.dw.com/en/learn-german/s-2469",
    level: "A2+",
    free: true,
    Icon: Radio,
  },
  {
    id: "germanpod101",
    name: "GermanPod101",
    bangla:
      "হাজারো অডিও/ভিডিও লেসন — absolute beginner থেকে শুরু করে ধাপে ধাপে। ফ্রি অ্যাকাউন্টে অনেক কনটেন্ট খোলা থাকে।",
    category: "lesen-hoeren",
    url: "https://www.germanpod101.com",
    level: "A1-geeignet",
    free: true,
    Icon: Podcast,
  },
];
