# rosso garage (Next.js)

Витрина в духе Hypergarage: хедер, героический 360°-облёт, вид сверху, макро-зум, блок «provenance», футер.

```bash
npm install
npm run dev     # http://localhost:3100
npm run build && npm start
```

- `components/FrameSequence.tsx` — канвас-последовательность по скроллу (lerp, DPR, resize, ленивая загрузка и выгрузка кадров, `DIM` — затемнение фона).
- `components/MacroZoom.tsx` — макро-фото: только масштаб при скролле.
- `public/frames/{orbit,top}/{768,1280,1920}/frame_0001..0180.webp` — кадры; `public/macro/*.webp` — макро.
- Затемнение фонов: `DIM` в `FrameSequence.tsx` и `--dim` в `app/globals.css`.
- Тексты, цены и контакты — заглушки.
- Как получены кадры: `../docs/video-to-scroll-frames.md`.
