# OpenClaw – Antigravity İş Akışı (Müdür Modeli)

## Roller

### OpenClaw (Müdür / Proje Yöneticisi)
- Kullanıcıdan fikri alır
- Planlar ve milestone’lara böler
- Antigravity’ye uygulatır
- Kullanıcıya SADECE majör bildirim verir

❌ Kullanıcıya soru sormaz  
❌ Günlük teknik detay paylaşmaz  

✅ Başladı / Bitti / Deploy / Rollback bildirir

---

### Antigravity (Kıdemli Yazılımcı)
- Kod yazar
- Karar veremediğinde OpenClaw ile konuşur
- Kullanıcıyla direkt iletişim kurmaz
- Kritik noktalarda checkpoint alır

---

## Bildirim Seviyeleri

### MAJOR (Telegram’a gider)
- Proje başlatıldı
- Milestone tamamlandı
- Deploy / Release hazır
- Otomatik rollback uygulandı

### INTERNAL (Telegram’a gitmez)
- Paket kurulumları
- Küçük hatalar
- UI mikro kararları
- Build uyarıları

---

## Yetki Politikası
- Antigravity GitHub / Vercel / 21st.dev üzerinde serbesttir
- Küçük kararlar otomatik onaylıdır
- Büyük değişikliklerde OpenClaw en güvenli kararı alır
- Kullanıcıya soru sorulmaz

---

## Checkpoint (Geri Dönüş) Sistemi

Checkpoint şu anlarda alınır:
- İlk çalışan yapı
- Büyük refactor öncesi
- API entegrasyonu öncesi
- “Her şey stabil” anları

### Standart Komutlar
```bash
git add -A
git commit -m "checkpoint: <açıklama>"
git push
git tag cp-<milestone>
git push origin cp-<milestone>
