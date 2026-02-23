export type FashionCategory =
  "gender" |
  "era" |
  "style" |
  "color" |
  "top_fit" |
  "bottom_fit" |
  "outerwear" |
  "shoes" |
  "accessories" |
  "signature_piece" |
  "budget" |
  "brand_affinity" |
  "core_identity" |
  "one_piece" |
  "formal_wear";

export type Option = {
  id: string;
  text: string;
  value: string; // The raw value to save in preferences
  image?: string;
  imagePosition?: string; // Custom object-position for fine-tuning crop (e.g. "center 20%")
  colors?: string[]; // Color swatches for color palette questions
};

export type Question = {
  id: string;
  category: FashionCategory;
  scenario: string;
  options: Option[];
};

// 1. Kök Soru (Branching Soru)
export const initialQuestion: Question = {
  id: "q_gender",
  category: "gender",
  scenario: "Kimin için alışveriş yapıyorsun?",
  options: [
    { id: "gen_m", text: "Erkek Giyim", value: "male", image: "/quiz/profile_male_square.png", imagePosition: "center center" },
    { id: "gen_f", text: "Kadın Giyim", value: "female", image: "/quiz/profile_female_square.png", imagePosition: "center center" },
    { id: "gen_u", text: "Unisex", value: "unisex", image: "/quiz/profile_unisex_square.png", imagePosition: "center center" }
  ]
};

// 2. KADIN (Womenswear) Patikası - 12 Soru
export const femaleQuestions: Question[] = [
  {
    id: "fq_era", category: "era",
    scenario: "Tarzın hangi dönemi yansıtıyor?",
    options: [
      { id: "fera_a", text: "Y2K — Düşük Bel, Parlak Kumaş", value: "y2k" },
      { id: "fera_b", text: "90'lar — Minimalizm, Grunge", value: "90s" },
      { id: "fera_c", text: "70'ler — İspanyol Paça, Toprak Tonları", value: "70s" },
      { id: "fera_d", text: "Modern — Temiz ve Minimalist", value: "modern" }
    ]
  },
  {
    id: "fq_style", category: "style",
    scenario: "Günlük genel tarzını nasıl tanımlarsın?",
    options: [
      { id: "fsty_a", text: "Rahat ama Şık (Effortless)", value: "effortless_chic", image: "/quiz/fashion_streetwear.jpg" },
      { id: "fsty_b", text: "İddialı ve Göz Alıcı", value: "glamorous", image: "/quiz/fashion_wool.jpg" },
      { id: "fsty_c", text: "Sportif Şıklık (Athleisure)", value: "athleisure", image: "/quiz/fashion_sneakers.jpg" },
      { id: "fsty_d", text: "Romantik ve Vintage", value: "romantic", image: "/quiz/fashion_leather.jpg" }
    ]
  },
  {
    id: "fq_color", category: "color",
    scenario: "Dolabında hangi renkler hâkim?",
    options: [
      { id: "fcol_a", text: "Siyah ve Karanlık Tonlar", value: "dark", colors: ["#1a1a1a", "#2d2d2d", "#4a4a4a", "#0d0d0d"] },
      { id: "fcol_b", text: "Toprak ve Kahve Tonları", value: "earth", colors: ["#8B6914", "#A0522D", "#6B4423", "#C4A777"] },
      { id: "fcol_c", text: "Canlı ve Renkli", value: "vibrant", colors: ["#E63946", "#457B9D", "#F4A261", "#2A9D8F"] },
      { id: "fcol_d", text: "Soft Pasteller", value: "pastel", colors: ["#FFD6E0", "#C5DEDD", "#D4C5F9", "#FFF1C1"] }
    ]
  },
  {
    id: "fq_top_fit", category: "top_fit",
    scenario: "Üstte hangi kesimi tercih edersin?",
    options: [
      { id: "ftfit_a", text: "Dar Kesim (Fitted)", value: "slim" },
      { id: "ftfit_b", text: "Crop / Kısa Kesim", value: "crop" },
      { id: "ftfit_c", text: "Oversize / Dökümlü", value: "oversize" },
      { id: "ftfit_d", text: "Asimetrik veya Detaylı", value: "asymmetric" }
    ]
  },
  {
    id: "fq_bottom_fit", category: "bottom_fit",
    scenario: "Altta ne giymeyi tercih edersin?",
    options: [
      { id: "fbfit_a", text: "Yüksek Bel Geniş Kesim / İspanyol Paça", value: "flared_wide" },
      { id: "fbfit_b", text: "Dökümlü Kumaş Pantolon", value: "slacks" },
      { id: "fbfit_c", text: "Mini Etek veya Şort", value: "mini" },
      { id: "fbfit_d", text: "Dar Kesim / Tayt", value: "skinny" }
    ]
  },
  {
    id: "fq_one_piece", category: "one_piece",
    scenario: "Tek parça kombin tercihinde ne seçersin?",
    options: [
      { id: "fone_a", text: "Midi / Maxi Elbise", value: "midi_dress" },
      { id: "fone_b", text: "Mini Elbise", value: "mini_dress" },
      { id: "fone_c", text: "Tulum / Salopet", value: "jumpsuit" },
      { id: "fone_d", text: "Elbiseyi Pek Sevmem", value: "none" }
    ]
  },
  {
    id: "fq_outerwear", category: "outerwear",
    scenario: "Soğukta üzerine ne alırsın?",
    options: [
      { id: "fout_a", text: "Trençkot", value: "trench", image: "/quiz/fashion_wool.jpg" },
      { id: "fout_b", text: "Deri Ceket", value: "leather", image: "/quiz/fashion_leather.jpg" },
      { id: "fout_c", text: "Kaşe Kaban", value: "wool_coat", image: "/quiz/fashion_wool.jpg" },
      { id: "fout_d", text: "Şişme Mont", value: "puffer", image: "/quiz/fashion_puffer.jpg" }
    ]
  },
  {
    id: "fq_shoes", category: "shoes",
    scenario: "Ayakkabı dolabının yıldızı hangisi?",
    options: [
      { id: "fsho_a", text: "Topuklu / Stiletto", value: "heels", image: "/quiz/fashion_boots.jpg" },
      { id: "fsho_b", text: "Sneaker", value: "sneakers", image: "/quiz/fashion_sneakers.jpg" },
      { id: "fsho_c", text: "Bot / Postal", value: "boots", image: "/quiz/fashion_boots.jpg" },
      { id: "fsho_d", text: "Loafer / Babet / Sandalet", value: "flats", image: "/quiz/fashion_sneakers.jpg" }
    ]
  },
  {
    id: "fq_accessories", category: "accessories",
    scenario: "Kombini bitirecek aksesuarın nedir?",
    options: [
      { id: "facc_a", text: "Büyük Bez veya Deri Çanta", value: "tote" },
      { id: "facc_b", text: "Trend Mini Çanta", value: "baguette" },
      { id: "facc_c", text: "İnce, Zarif Takılar", value: "dainty_jewelry" },
      { id: "facc_d", text: "Gösterişli, İddialı Takılar", value: "statement_jewelry" }
    ]
  },
  {
    id: "fq_budget", category: "budget",
    scenario: "Bir tişörte ortalama ne kadar bütçe ayırırsın?",
    options: [
      { id: "fbud_a", text: "250₺ - 500₺", value: "low" },
      { id: "fbud_b", text: "500₺ - 1.000₺", value: "medium" },
      { id: "fbud_c", text: "1.000₺ - 2.500₺", value: "high" },
      { id: "fbud_d", text: "2.500₺ ve üzeri", value: "luxury" }
    ]
  },
  {
    id: "fq_brand_affinity", category: "brand_affinity",
    scenario: "Alışverişte hangi yaklaşım sana göre?",
    options: [
      { id: "fbra_a", text: "Hızlı Moda / Trend Takibi", value: "fast_fashion" },
      { id: "fbra_b", text: "Sessiz Lüks / Kaliteli Basic", value: "quiet_luxury" },
      { id: "fbra_c", text: "Tasarımcı / Lüks Marka", value: "designer" },
      { id: "fbra_d", text: "Vintage / İkinci El", value: "thrift" }
    ]
  },
  {
    id: "fq_core_identity", category: "core_identity",
    scenario: "Seni en iyi tanımlayan kelime hangisi?",
    options: [
      { id: "fcor_a", text: "Feminen ve Estetik", value: "feminine" },
      { id: "fcor_b", text: "Cesur ve Dikkat Çekici", value: "bold" },
      { id: "fcor_c", text: "Klasik ve Zamansız", value: "timeless" },
      { id: "fcor_d", text: "Pratik ve Rahat", value: "practical" }
    ]
  }
];

// 3. ERKEK (Menswear) Patikası - 12 Soru
export const maleQuestions: Question[] = [
  {
    id: "mq_era", category: "era",
    scenario: "Tarzın hangi dönemi yansıtıyor?",
    options: [
      { id: "mera_a", text: "Klasik İtalyan Şıklığı", value: "classic_italian" },
      { id: "mera_b", text: "90'lar Sokak / Hip-Hop", value: "90s_street" },
      { id: "mera_c", text: "80'ler Retro Spor", value: "80s_retro" },
      { id: "mera_d", text: "Modern ve Minimalist", value: "modern_minimal" }
    ]
  },
  {
    id: "mq_style", category: "style",
    scenario: "Günlük genel tarzını nasıl tanımlarsın?",
    options: [
      { id: "msty_a", text: "Temiz Kesim, Smart Casual", value: "smart_casual", image: "/quiz/male_smart_casual.png" },
      { id: "msty_b", text: "Sokak Modası / Hypebeast", value: "hypebeast", image: "/quiz/male_hypebeast.png" },
      { id: "msty_c", text: "Rahat ve Klasik", value: "casual_classic", image: "/quiz/male_casual_classic.png" },
      { id: "msty_d", text: "Techwear / Fonksiyonel", value: "techwear", image: "/quiz/male_techwear.png" }
    ]
  },
  {
    id: "mq_color", category: "color",
    scenario: "Dolabında hangi renkler hâkim?",
    options: [
      { id: "mcol_a", text: "Siyah ve Koyu Tonlar", value: "dark", colors: ["#1a1a1a", "#2d2d2d", "#4a4a4a", "#0d0d0d"] },
      { id: "mcol_b", text: "Toprak Tonları (Haki, Kahve)", value: "earth", colors: ["#5C4033", "#6B6B47", "#8B7355", "#C4A777"] },
      { id: "mcol_c", text: "Açık Tonlar (Bej, Gri, Beyaz)", value: "light", colors: ["#F5F0EB", "#D4CFC9", "#B8B0A8", "#FFFFFF"] },
      { id: "mcol_d", text: "Canlı Renkli Detaylar", value: "vibrant_accent", colors: ["#FF2D2D", "#FF8C00", "#FFD600", "#00C853"] }
    ]
  },
  {
    id: "mq_top_fit", category: "top_fit",
    scenario: "Üstte hangi kesimi tercih edersin?",
    options: [
      { id: "mtfit_a", text: "Slim Fit / Dar", value: "slim", image: "/quiz/male_top_slim.png" },
      { id: "mtfit_b", text: "Regular / Standart", value: "regular", image: "/quiz/male_top_regular.png" },
      { id: "mtfit_c", text: "Oversize / Geniş", value: "oversize", image: "/quiz/male_top_oversize.png" },
      { id: "mtfit_d", text: "Atletik / Kolsuz", value: "athletic", image: "/quiz/male_top_athletic.png" }
    ]
  },
  {
    id: "mq_bottom_fit", category: "bottom_fit",
    scenario: "Altta ne giymeyi tercih edersin?",
    options: [
      { id: "mbfit_a", text: "Kumaş / Temiz Kesim Pantolon", value: "tailored" },
      { id: "mbfit_b", text: "Bol ve Dökümlü (Baggy)", value: "baggy" },
      { id: "mbfit_c", text: "Dar Kesim (Skinny)", value: "skinny" },
      { id: "mbfit_d", text: "Kargo / Cepli Pantolon", value: "cargo" }
    ]
  },
  {
    id: "mq_formal_wear", category: "formal_wear",
    scenario: "Resmi bir ortamda ne giyersin?",
    options: [
      { id: "mfor_a", text: "Dar Kesim Takım / Smokin", value: "sharp_suit" },
      { id: "mfor_b", text: "Ceket + Tişört (Rahat Şıklık)", value: "modern_suit" },
      { id: "mfor_c", text: "Geniş Kesimli Takım", value: "oversize_suit" },
      { id: "mfor_d", text: "Resmi Giyinmem", value: "none" }
    ]
  },
  {
    id: "mq_outerwear", category: "outerwear",
    scenario: "Soğukta üzerine ne alırsın?",
    options: [
      { id: "mout_a", text: "Uzun Kaşe Kaban", value: "wool_coat", image: "/quiz/male_outerwear_wool_coat.png" },
      { id: "mout_b", text: "Deri / Bomber Ceket", value: "leather_bomber", image: "/quiz/male_outerwear_leather_bomber.png" },
      { id: "mout_c", text: "Şişme Mont", value: "puffer", image: "/quiz/male_outerwear_puffer.png" },
      { id: "mout_d", text: "Rüzgarlık / Outdoor Ceket", value: "technical_jacket", image: "/quiz/male_outerwear_technical.png" }
    ]
  },
  {
    id: "mq_shoes", category: "shoes",
    scenario: "Ayakkabı dolabının yıldızı hangisi?",
    options: [
      { id: "msho_a", text: "Hype / Limitli Üretim Sneaker", value: "hype_sneakers", image: "/quiz/fashion_sneakers.jpg" },
      { id: "msho_b", text: "Beyaz Minimalist Sneaker", value: "clean_sneakers", image: "/quiz/fashion_sneakers.jpg" },
      { id: "msho_c", text: "Deri Loafer / Oxford / Chelsea", value: "classic_shoes", image: "/quiz/fashion_boots.jpg" },
      { id: "msho_d", text: "Bot / Postal", value: "boots", image: "/quiz/fashion_boots.jpg" }
    ]
  },
  {
    id: "mq_signature", category: "signature_piece",
    scenario: "Tarzının en güçlü silahı, imza parçan hangisi?",
    options: [
      { id: "msig_a", text: "Gösterişli ve Özel Bir Ceket", value: "statement_jacket" },
      { id: "msig_b", text: "Dikkat Çekici Sneaker / Ayakkabı", value: "statement_shoes" },
      { id: "msig_c", text: "Kusursuz Kalıplı Bir Pantolon", value: "perfect_pants" },
      { id: "msig_d", text: "Kaliteli ve Sade Temel Parçalar", value: "quality_basics" }
    ]
  },
  {
    id: "mq_budget", category: "budget",
    scenario: "Bir tişörte ortalama ne kadar bütçe ayırırsın?",
    options: [
      { id: "mbud_a", text: "250₺ - 500₺", value: "low" },
      { id: "mbud_b", text: "500₺ - 1.000₺", value: "medium" },
      { id: "mbud_c", text: "1.000₺ - 2.500₺", value: "high" },
      { id: "mbud_d", text: "2.500₺ ve üzeri", value: "luxury" }
    ]
  },
  {
    id: "mq_brand_affinity", category: "brand_affinity",
    scenario: "Alışverişte hangi yaklaşım sana göre?",
    options: [
      { id: "mbra_a", text: "Lüks / Tasarımcı Marka", value: "designer" },
      { id: "mbra_b", text: "Büyük Logo / Sokak Modası", value: "streetwear_brands" },
      { id: "mbra_c", text: "Sessiz Lüks / Logo Yok", value: "quiet_luxury" },
      { id: "mbra_d", text: "Marka Önemli Değil, Kalite Önemli", value: "value" }
    ]
  },
  {
    id: "mq_core_identity", category: "core_identity",
    scenario: "Seni en iyi tanımlayan kelime hangisi?",
    options: [
      { id: "mcor_a", text: "Güçlü ve İddialı", value: "bold" },
      { id: "mcor_b", text: "Klasik ve Güvenilir", value: "classic" },
      { id: "mcor_c", text: "Sportif ve Enerjik", value: "dynamic" },
      { id: "mcor_d", text: "Yenilikçi ve Özgün", value: "innovative" }
    ]
  }
];

// 4. UNISEX (Genderless) Patikası - 12 Soru
export const unisexQuestions: Question[] = [
  {
    id: "uq_era", category: "era",
    scenario: "Tarzın hangi akımdan ilham alıyor?",
    options: [
      { id: "uera_a", text: "Japon Minimalizmi (Avangart, Siyah)", value: "japanese_minimal" },
      { id: "uera_b", text: "Y2K Cyberpunk & Fütürizm", value: "cyberpunk" },
      { id: "uera_c", text: "90'lar Grunge / Techno", value: "grunge" },
      { id: "uera_d", text: "Distopik Sokak Stili", value: "dystopian" }
    ]
  },
  {
    id: "uq_style", category: "style",
    scenario: "Günlük genel tarzını nasıl tanımlarsın?",
    options: [
      { id: "usty_a", text: "Avangart (Heykelsi Formlar)", value: "avant_garde", image: "/quiz/fashion_wool.jpg" },
      { id: "usty_b", text: "Geniş Sokak Giyimi", value: "streetwear", image: "/quiz/fashion_streetwear.jpg" },
      { id: "usty_c", text: "Minimalist / Düz", value: "uniform", image: "/quiz/fashion_wool.jpg" },
      { id: "usty_d", text: "Katmanlı ve Karmaşık", value: "layered", image: "/quiz/fashion_leather.jpg" }
    ]
  },
  {
    id: "uq_color", category: "color",
    scenario: "Dolabında hangi renkler hâkim?",
    options: [
      { id: "ucol_a", text: "Tamamen Siyah", value: "all_black", colors: ["#0a0a0a", "#1a1a1a", "#111111", "#000000"] },
      { id: "ucol_b", text: "Gri / Beyaz / Siyah Monokrom", value: "monochrome", colors: ["#FFFFFF", "#B0B0B0", "#606060", "#1a1a1a"] },
      { id: "ucol_c", text: "Toprak ve Vizon Tonları", value: "earth", colors: ["#8B7355", "#A89078", "#6B4423", "#C4A777"] },
      { id: "ucol_d", text: "Neon / Metalik / Asidik", value: "acid", colors: ["#39FF14", "#FF00FF", "#C0C0C0", "#CCFF00"] }
    ]
  },
  {
    id: "uq_silhoutte", category: "top_fit",
    scenario: "Bedenini kıyafetle nasıl kullanırsın?",
    options: [
      { id: "usil_a", text: "Ekstra Oversize, Her Şeyi Gizler", value: "extreme_oversize" },
      { id: "usil_b", text: "Vücuda Yapışan, İkinci Deri", value: "skin_tight" },
      { id: "usil_c", text: "Üst Dar + Alt Bol (Kontrast)", value: "tight_loose" },
      { id: "usil_d", text: "Keskin, Kare ve Düz Çizgiler", value: "boxy" }
    ]
  },
  {
    id: "uq_bottom_fit", category: "bottom_fit",
    scenario: "Altta ne giymeyi tercih edersin?",
    options: [
      { id: "ubfit_a", text: "Cinsiyetsiz Şalvar / Geniş Pantolon", value: "flowing_pants" },
      { id: "ubfit_b", text: "Uzun Şort veya Midi Etek", value: "skirt_shorts" },
      { id: "ubfit_c", text: "Kargo Pantolon (Cepli)", value: "cargo" },
      { id: "ubfit_d", text: "Geniş Paçalı Ağır Denim", value: "wide_denim" }
    ]
  },
  {
    id: "uq_layering", category: "one_piece",
    scenario: "Katmanlı giyime yaklaşımın ne?",
    options: [
      { id: "ulay_a", text: "Elbise + Pantolon, Çok Katman", value: "extreme_layering" },
      { id: "ulay_b", text: "Tulum / Tek Parça Sadelik", value: "coverall" },
      { id: "ulay_c", text: "Hafif Katman (Gömlek / Ceket)", value: "light_layering" },
      { id: "ulay_d", text: "Tek Büyük Parça Yeter", value: "single_piece" }
    ]
  },
  {
    id: "uq_outerwear", category: "outerwear",
    scenario: "Soğukta üzerine ne alırsın?",
    options: [
      { id: "uout_a", text: "Uzun Mat Siyah Trençkot / Kaban", value: "matrix_coat", image: "/quiz/fashion_wool.jpg" },
      { id: "uout_b", text: "Balon Kalıp Bomber Ceket", value: "exaggerated_bomber", image: "/quiz/fashion_leather.jpg" },
      { id: "uout_c", text: "Distressed Deri Ceket", value: "distressed_leather", image: "/quiz/fashion_leather.jpg" },
      { id: "uout_d", text: "Panço veya Pelerin", value: "cape", image: "/quiz/fashion_puffer.jpg" }
    ]
  },
  {
    id: "uq_shoes", category: "shoes",
    scenario: "Ayakkabı dolabının yıldızı hangisi?",
    options: [
      { id: "usho_a", text: "Kalın Tabanlı Fütüristik Sneaker", value: "chunky_sneakers", image: "/quiz/fashion_sneakers.jpg" },
      { id: "usho_b", text: "Platform Bot / Deri Bot", value: "platform_boots", image: "/quiz/fashion_boots.jpg" },
      { id: "usho_c", text: "Sabo / Alışılmışın Dışı Formlar", value: "clogs_weird", image: "/quiz/fashion_sneakers.jpg" },
      { id: "usho_d", text: "Yalın ve Minimal Kanvas", value: "minimal_flats", image: "/quiz/fashion_boots.jpg" }
    ]
  },
  {
    id: "uq_accessories", category: "accessories",
    scenario: "Kombini bitirecek aksesuarın nedir?",
    options: [
      { id: "uacc_a", text: "Piercing, Klips, Metal Zincir", value: "heavy_metal" },
      { id: "uacc_b", text: "Geometrik / Soyut Takılar", value: "abstract_jewelry" },
      { id: "uacc_c", text: "Postacı veya Taktik Bel Çantası", value: "tactical_bag" },
      { id: "uacc_d", text: "Kalın Güneş Gözlüğü / Şapka", value: "face_cover" }
    ]
  },
  {
    id: "uq_budget", category: "budget",
    scenario: "Bir tişörte ortalama ne kadar bütçe ayırırsın?",
    options: [
      { id: "ubud_a", text: "250₺ - 500₺", value: "low" },
      { id: "ubud_b", text: "500₺ - 1.000₺", value: "medium" },
      { id: "ubud_c", text: "1.000₺ - 2.500₺", value: "high" },
      { id: "ubud_d", text: "2.500₺ ve üzeri", value: "luxury" }
    ]
  },
  {
    id: "uq_brand_affinity", category: "brand_affinity",
    scenario: "Alışverişte hangi yaklaşım sana göre?",
    options: [
      { id: "ubra_a", text: "Avangart Japon / Belçika Moda Evleri", value: "avantgarde_luxury" },
      { id: "ubra_b", text: "Lokal, Indie Sokak Markaları", value: "local_indie" },
      { id: "ubra_c", text: "Yeniden Tasarlanmış / Upcycled", value: "upcycled" },
      { id: "ubra_d", text: "Marka Değil, Sadece Form", value: "anti_brand" }
    ]
  },
  {
    id: "uq_core_identity", category: "core_identity",
    scenario: "Seni en iyi tanımlayan kelime hangisi?",
    options: [
      { id: "ucor_a", text: "Akışkan ve Sınırsız", value: "fluid" },
      { id: "ucor_b", text: "Estetik ve Görsel", value: "aesthetic" },
      { id: "ucor_c", text: "İzole ve Ulaşılmaz", value: "isolated" },
      { id: "ucor_d", text: "Kuralları Yıkan", value: "disruptive" }
    ]
  }
];
