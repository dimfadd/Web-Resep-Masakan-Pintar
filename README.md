# 👨‍🍳 Resep Masakan Pintar — Dapur Digital

Generate resep masakan Indonesia lengkap dengan nilai nutrisi akurat, tutorial detail, dan pustaka dengan smart filter.

## ✨ Fitur

- **Generate Resep AI** — Cukup ketik nama masakan, Gemini akan generate resep lengkap
- **Nutrisi Lengkap** — Kalori, protein, karbo, lemak, serat, vitamin, mineral per bahan
- **Tutorial Detail** — 6–10 langkah memasak dengan tips Chef di setiap langkah
- **Smart Filter** — Filter by diet, bulking, tinggi protein, rendah kalori, jenis masakan
- **Foto AI** — Generate foto masakan otomatis dengan Gemini image generation
- **Resep Scroll** — Tampilan resep seperti kertas lipat scroll ke bawah
- **Simpan ke Cloud** — Semua resep tersimpan di Firebase, bisa diakses multi-device

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Gemini API Key
```bash
cp .env.example .env
```
Edit `.env` dan isi `GEMINI_API_KEY` dengan API key dari [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Setup Firebase
1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Firestore Database** (mode production atau test)
3. Aktifkan **Firebase Storage**
4. Buka `src/services/firebaseConfig.ts`
5. Ganti semua placeholder `YOUR_*` dengan config dari Project Settings → Your Apps

### 4. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000

## 📁 Struktur File

```
src/
├── types.ts                    # TypeScript interfaces
├── App.tsx                     # Orchestrator utama
├── index.tsx                   # Entry point
├── components/
│   ├── HomeScreen.tsx          # Halaman generate resep
│   ├── RecipeCard.tsx          # Tampilan resep scroll/unfold
│   └── RecipeLibrary.tsx       # Pustaka dengan smart filter
└── services/
    ├── firebaseConfig.ts       # Firebase setup ← EDIT INI
    ├── geminiService.ts        # AI: generate resep + foto
    └── storageService.ts       # Firebase CRUD
```

## 🔧 Kustomisasi

### Ganti model Gemini
Di `src/services/geminiService.ts`:
- Text generation: `gemini-2.5-flash-preview-05-20`
- Image generation: `gemini-2.0-flash-preview-image-generation`

### Tambah quick suggestions
Di `src/components/HomeScreen.tsx`, edit array `QUICK_SUGGESTIONS`.

### Tambah filter goals
Di `src/components/RecipeLibrary.tsx`, edit array `PRESET_GOALS`.

## 📋 Firestore Rules (Rekomendasi)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{recipeId} {
      allow read: if true;
      allow write: if true; // Ganti dengan auth rules sesuai kebutuhan
    }
  }
}
```

## 🛡️ Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /recipes/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
