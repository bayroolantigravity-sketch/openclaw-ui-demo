# OpenClaw Çıktı Formatı (Plan → Tek Prompt → Checkpoint)

OpenClaw (Müdür) her yeni görevde aşağıdaki formatta çıktı üretir ve Antigravity’yi bu formatla yönetir.

---

## 1) Plan (Milestones)

- **M0 — Kickoff & Setup**
  - Repo hazır
  - Temel Next.js yapı
  - Vercel deploy çalışır
  - İlk checkpoint

- **M1 — UI Skeleton**
  - Sayfa iskeleti (header / sidebar / panel)
  - Command input + run butonu (dummy)
  - Log paneli (dummy)
  - Checkpoint

- **M2 — Entegrasyonlar**
  - OpenClaw API çağrıları (health / command)
  - Hata yönetimi + retry
  - Checkpoint

- **M3 — Stabilizasyon**
  - UX iyileştirme
  - Edge-case düzeltme
  - Checkpoint

- **MVP v0.1 — Release**
  - README + kullanım
  - Vercel prod deploy
  - Final checkpoint

---

## 2) Antigravity’ye Verilecek TEK Ana Prompt (standart şablon)

Aşağıdaki şablonu OpenClaw tek parça prompt olarak Antigravity’ye verir:

### Gereksinimler
- Kullanıcının fikrini ürünleştir
- Mobil uygulama + web sitesi (varsa) birlikte düşün
- Öncelik: çalışan MVP

### Klasör / Kod Standartları
- Next.js App Router + TS + Tailwind
- Animasyon bileşenleri: `components/animations/`
- `cn` helper: `@/lib/utils`
- 21st.dev: SADECE animasyon/micro-interaction (layoutu yeniden tasarlama)

### Yetki
- GitHub/Vercel/21st.dev serbest
- Küçük kararlar otomatik
- Kullanıcıya soru yok

### İletişim
- Kullanıcıya mesaj YOK
- Sadece OpenClaw ile konuş
- Karar çıkmazsa 2–3 seçenek + öneri + gerekçe sun

### Checkpoint Kuralları
- Kritik noktalarda:
  - commit + push
  - tag `cp-...` + tag push
- Yanlış gidişte:
  - düzeltmeyi dene
  - olmazsa son checkpoint’e rollback

### Raporlama (OpenClaw’a)
- Her milestone sonunda:
  - ne değişti
  - hangi dosyalar
  - nasıl çalıştırılır
  - hangi checkpoint alındı

---

## 3) Checkpoint Takvimi (minimum)

- `cp-m0-workflow` (sistem temeli)
- `cp-m0-1-notifications` (MAJOR-only politikası)
- `cp-m1-ui-skeleton`
- `cp-m2-integrations`
- `cp-mvp-v0-1`

---

## 4) Kullanıcıya Giden MAJOR Mesajlar (örnek)

- 🚀 Başladı: {proje} — M0 Kickoff & Setup
- ✅ Tamamlandı: M1 UI Skeleton — temel arayüz hazır
- 🌍 Deploy Hazır: {vercel_url}
- 🛟 Rollback: {cp-tag} — otomatik geri dönüş uygulandı
