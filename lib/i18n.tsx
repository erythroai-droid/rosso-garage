'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'ru' | 'he';
export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'he', label: 'HE', name: 'עברית' },
];

type Dict = Record<string, string>;

const en: Dict = {
  loading: 'Loading', menu_open: 'Open menu', search: 'Search', close: 'Close', lang: 'Language',
  contact_seller: 'Contact Seller',
  nav_overview: 'Overview', nav_exterior: 'Exterior', nav_design: 'Design', nav_detail: 'Detail', nav_numbers: 'Numbers', nav_contact: 'Contact',
  menu_foot: 'Lot 0001 · Rosso Spider · hello@example.com',
  s_lot: 'Rosso Spider — Lot 0001', s_ext: '360° exterior view', s_top: 'Top view and cabin', s_macro: 'Macro detail: headlight and carbon',
  s_num: 'Performance numbers', s_prov: 'Provenance and documents', s_contact: 'Contact the seller',
  search_ph: 'Search the lot…', search_none: 'Nothing found for',
  c_lot: 'Lot 0001 — Rosso Spider', c_title: 'Contact the seller', c_name: 'Name', c_email: 'Email', c_msg: 'Message',
  c_msg_def: 'I would like to know more about this lot.', c_send: 'Send request',
  c_thanks: 'Thank you', c_done: 'Request sent.', c_done_p: 'Our team will reply within one business day. This is a demo form: nothing is actually sent.',
  lot: 'LOT 0001', price: 'Price on request', price_note: "inclusive of applicable buyer's fee",
  word_design: 'Design', word_detail: 'Detail',
  o1k: 'Front', o1h: 'A family of extreme performance cars', o1p: 'Low stance, yellow accents on the hood and slim LED headlights.', o1c: 'Discover more',
  o2k: 'Side', o2h: 'Clean profile', o2p: 'Black wheels with a yellow rim line and an open top underline the proportions.',
  o3k: 'Rear', o3h: 'Wing and exhaust', o3p: 'Black rear wing, diffuser and a twin exhaust.',
  o4k: 'Full circle', o4h: 'Back to the start', o4p: 'Scroll up to turn the car back.',
  t1k: 'Top', t1h: 'A new generation of cabin styling.', t1p: 'Strict symmetry: matte body, yellow air intakes, open cabin.', t1c: 'Discover the detail',
  t2k: 'Cockpit', t2h: 'Open cabin', t2p: 'Carbon seats with yellow stitching and a low windscreen header.',
  t3k: 'Hood', t3h: 'Yellow accents', t3p: 'The camera moves in: hood vents and matte paint.',
  b1k: '01 — Exterior', b1h1: 'A shape you can read', b1h2: 'from every side.',
  b1p1: 'A low silhouette, a long hood and an open top are drawn in a single line, from the slim LED headlights to the black rear wing. The matte paint does not glare, so the form stays readable even in the half-light of the studio.',
  b1p2: 'Yellow hood vents, a yellow line on the black wheels and carbon inserts are the only contrast against the deep red. Everything else is pure geometry.',
  b1p3: 'Demo text and figures: replace them with the real data of the car.',
  b1s1: 'view', b1s2: 'angles', b1s3: 'frames',
  b2k: '02 — Cabin', b2h1: 'A cabin built', b2h2: 'around the driver.',
  b2p1: 'From above you can see how the space is organised: two carbon bucket seats, a low windscreen header and a steering wheel placed at the centre of the composition. Nothing extra, every panel in its place.',
  b2p2: 'Yellow stitching on the seats repeats the accents of the body, and the open top leaves the driver alone with the road. Next, the camera moves in on the details.',
  b2s1: 'seats', b2s2: 'hand assembled', b2s3: 'paint layers',
  b3k: '03 — Detail', b3h1: 'Small things that', b3h2: 'build the character.',
  b3p1: 'A headlight with three light lines, a carbon air duct, a hexagonal radiator mesh and a yellow blade in the bumper. In the macro view you can see how the matte paint kills reflections and highlights the relief.',
  b3p2: 'Details, documents and photographs of the lot are below.',
  m_alt: 'Macro view of the Rosso Spider front end', m_copy: 'Matte paint, carbon inserts and yellow accents: every detail is assembled by hand.',
  sp_k: 'LOT 0001 — NUMBERS', sp_h1: 'Numbers that', sp_h2: 'speak for themselves.', sp_label: 'Specifications',
  sp_l1: 'horsepower', sp_l2: '0–100 km/h, s', sp_l3: 'top speed, km/h', sp_l4: 'one of a kind', sp_note: 'Demo values: replace them with the data of the car.',
  pv_k: 'LOT 0001 — PROVENANCE', pv_h1: 'One of a kind.', pv_h2: 'Handled with care.',
  pv_p1: 'The lot has been inspected and photographed by our team. We check the body, the cabin, the documents and the ownership history, and publish only what is confirmed.',
  pv_p2: 'Demo text: replace it with the real data about the car, its ownership history and documents.',
  pv_l1: 'km, odometer', pv_l2: 'of', pv_l3: 'certified',
  f_about: 'A private showcase of sports cars. Every lot is inspected and photographed by our own team before it is listed.',
  f_lot: 'Lot 0001', f_paint: 'Rosso Spider · Matte Rosso', f_carbon: 'Carbon / yellow accents',
  f_garage: 'Garage', f_collection: 'Collection', f_sell: 'Sell with us', f_concierge: 'Concierge', f_journal: 'Journal', f_contact: 'Contact',
};

const ru: Dict = {
  loading: 'Загрузка', menu_open: 'Открыть меню', search: 'Поиск', close: 'Закрыть', lang: 'Язык',
  contact_seller: 'Связаться с продавцом',
  nav_overview: 'Обзор', nav_exterior: 'Экстерьер', nav_design: 'Дизайн', nav_detail: 'Детали', nav_numbers: 'Характеристики', nav_contact: 'Контакты',
  menu_foot: 'Лот 0001 · Rosso Spider · hello@example.com',
  s_lot: 'Rosso Spider — лот 0001', s_ext: 'Экстерьер 360°', s_top: 'Вид сверху и салон', s_macro: 'Макро: фара и карбон',
  s_num: 'Характеристики', s_prov: 'История и документы', s_contact: 'Связаться с продавцом',
  search_ph: 'Поиск по лоту…', search_none: 'Ничего не найдено по запросу',
  c_lot: 'Лот 0001 — Rosso Spider', c_title: 'Связаться с продавцом', c_name: 'Имя', c_email: 'Почта', c_msg: 'Сообщение',
  c_msg_def: 'Хочу узнать больше об этом лоте.', c_send: 'Отправить запрос',
  c_thanks: 'Спасибо', c_done: 'Запрос отправлен.', c_done_p: 'Наша команда ответит в течение одного рабочего дня. Это демо-форма: ничего не отправляется.',
  lot: 'ЛОТ 0001', price: 'Цена по запросу', price_note: 'включая применимую комиссию покупателя',
  word_design: 'Дизайн', word_detail: 'Детали',
  o1k: 'Спереди', o1h: 'Семейство экстремальных спорткаров', o1p: 'Низкая посадка, жёлтые акценты на капоте и узкие светодиодные фары.', o1c: 'Подробнее',
  o2k: 'Сбоку', o2h: 'Чистый профиль', o2p: 'Чёрные диски с жёлтым кантом и открытый верх подчёркивают пропорции.',
  o3k: 'Сзади', o3h: 'Антикрыло и выхлоп', o3p: 'Чёрное антикрыло, диффузор и двойной выпуск.',
  o4k: 'Полный круг', o4h: 'Снова в начале', o4p: 'Прокрутите вверх, чтобы повернуть машину обратно.',
  t1k: 'Сверху', t1h: 'Новое поколение стиля салона.', t1p: 'Строгая симметрия: матовый кузов, жёлтые воздухозаборники, открытый салон.', t1c: 'Смотреть детали',
  t2k: 'Кокпит', t2h: 'Открытый салон', t2p: 'Карбоновые сиденья с жёлтой отстрочкой и низкий лобовой выступ.',
  t3k: 'Капот', t3h: 'Жёлтые акценты', t3p: 'Камера приближается: воздуховоды капота и матовая краска.',
  b1k: '01 — Экстерьер', b1h1: 'Форма, которую видно', b1h2: 'с любой стороны.',
  b1p1: 'Низкий силуэт, длинный капот и открытый верх собраны в одну линию: от узких светодиодных фар до чёрного антикрыла. Матовая краска не бликует, поэтому форма читается даже в полумраке студии.',
  b1p2: 'Жёлтые воздухозаборники на капоте, жёлтый кант на чёрных дисках и карбоновые вставки дают единственный контраст на фоне глубокого красного. Всё остальное — чистая геометрия.',
  b1p3: 'Демонстрационный текст и цифры: подставьте реальные данные об автомобиле.',
  b1s1: 'обзор', b1s2: 'ракурса', b1s3: 'кадров',
  b2k: '02 — Салон', b2h1: 'Салон, собранный', b2h2: 'вокруг водителя.',
  b2p1: 'Сверху видно, как устроено пространство: два карбоновых ковша, низкий лобовой выступ и руль в центре композиции. Ничего лишнего, каждая панель на своём месте.',
  b2p2: 'Жёлтая отстрочка на сиденьях повторяет акценты кузова, а открытый верх оставляет водителя наедине с дорогой. Дальше камера приближается к деталям.',
  b2s1: 'места', b2s2: 'ручная сборка', b2s3: 'слоёв краски',
  b3k: '03 — Детали', b3h1: 'Мелочи, из которых', b3h2: 'складывается характер.',
  b3p1: 'Фара с тремя световыми линиями, карбоновый воздуховод, шестигранная сетка радиатора и жёлтая лопатка в бампере. На макро видно, как матовая краска гасит отражения и подчёркивает рельеф.',
  b3p2: 'Подробности, документы и фотографии лота — ниже.',
  m_alt: 'Макро-снимок передней части Rosso Spider', m_copy: 'Матовая краска, карбоновые вставки и жёлтые акценты: каждая деталь собрана вручную.',
  sp_k: 'ЛОТ 0001 — ЦИФРЫ', sp_h1: 'Цифры, которые', sp_h2: 'говорят сами за себя.', sp_label: 'Характеристики',
  sp_l1: 'л.с.', sp_l2: '0–100 км/ч, с', sp_l3: 'макс. скорость, км/ч', sp_l4: 'единственный экземпляр', sp_note: 'Демонстрационные значения: замените на данные автомобиля.',
  pv_k: 'ЛОТ 0001 — ИСТОРИЯ', pv_h1: 'Единственный в своём роде.', pv_h2: 'С заботой о деталях.',
  pv_p1: 'Лот осмотрен и снят нашей командой. Мы проверяем кузов, салон, документы и историю владения, а публикуем только подтверждённое.',
  pv_p2: 'Демонстрационный текст: подставьте реальные данные об автомобиле, истории владения и документах.',
  pv_l1: 'км пробега', pv_l2: 'из', pv_l3: 'год сертификации',
  f_about: 'Частная витрина спорткаров. Каждый лот осматривается и снимается нашей командой до публикации.',
  f_lot: 'Лот 0001', f_paint: 'Rosso Spider · матовый Rosso', f_carbon: 'Карбон / жёлтые акценты',
  f_garage: 'Гараж', f_collection: 'Коллекция', f_sell: 'Продать с нами', f_concierge: 'Консьерж', f_journal: 'Журнал', f_contact: 'Контакты',
};

const he: Dict = {
  loading: 'טוען', menu_open: 'פתח תפריט', search: 'חיפוש', close: 'סגור', lang: 'שפה',
  contact_seller: 'צור קשר עם המוכר',
  nav_overview: 'סקירה', nav_exterior: 'חוץ', nav_design: 'עיצוב', nav_detail: 'פרטים', nav_numbers: 'נתונים', nav_contact: 'צור קשר',
  menu_foot: 'פריט 0001 · Rosso Spider · hello@example.com',
  s_lot: 'Rosso Spider — פריט 0001', s_ext: 'מראה חיצוני 360°', s_top: 'מבט מלמעלה ותא נוסעים', s_macro: 'מקרו: פנס וקרבון',
  s_num: 'נתוני ביצועים', s_prov: 'היסטוריה ומסמכים', s_contact: 'צור קשר עם המוכר',
  search_ph: 'חיפוש בפריט…', search_none: 'לא נמצאו תוצאות עבור',
  c_lot: 'פריט 0001 — Rosso Spider', c_title: 'צור קשר עם המוכר', c_name: 'שם', c_email: 'אימייל', c_msg: 'הודעה',
  c_msg_def: 'אשמח לקבל פרטים נוספים על הפריט.', c_send: 'שלח בקשה',
  c_thanks: 'תודה', c_done: 'הבקשה נשלחה.', c_done_p: 'הצוות שלנו יחזור אליכם בתוך יום עסקים אחד. זהו טופס הדגמה: דבר אינו נשלח בפועל.',
  lot: 'פריט 0001', price: 'מחיר לפי בקשה', price_note: 'כולל עמלת קונה רלוונטית',
  word_design: 'עיצוב', word_detail: 'פרטים',
  o1k: 'חזית', o1h: 'משפחה של מכוניות ביצועים קיצוניות', o1p: 'גובה נסיעה נמוך, דגשים צהובים על מכסה המנוע ופנסי לד צרים.', o1c: 'גלו עוד',
  o2k: 'צד', o2h: 'פרופיל נקי', o2p: 'חישוקים שחורים עם קו צהוב וגג פתוח מדגישים את הפרופורציות.',
  o3k: 'מאחור', o3h: 'כנף ופליטה', o3p: 'כנף אחורית שחורה, דיפיוזר ופליטה כפולה.',
  o4k: 'סיבוב מלא', o4h: 'חזרה להתחלה', o4p: 'גללו למעלה כדי להחזיר את המכונית.',
  t1k: 'מלמעלה', t1h: 'דור חדש של עיצוב תא הנוסעים.', t1p: 'סימטריה מדויקת: מרכב מט, פתחי אוויר צהובים ותא פתוח.', t1c: 'גלו את הפרטים',
  t2k: 'תא הטייס', t2h: 'תא פתוח', t2p: 'מושבי קרבון עם תפרים צהובים ומסגרת שמשה נמוכה.',
  t3k: 'מכסה מנוע', t3h: 'דגשים צהובים', t3p: 'המצלמה מתקרבת: פתחי אוורור וצבע מט.',
  b1k: '01 — חוץ', b1h1: 'צורה שנראית', b1h2: 'מכל זווית.',
  b1p1: 'צללית נמוכה, מכסה מנוע ארוך וגג פתוח נמשכים בקו אחד, מפנסי הלד הצרים ועד הכנף האחורית השחורה. הצבע המט אינו מסנוור, ולכן הצורה נשארת קריאה גם באור העמום של הסטודיו.',
  b1p2: 'פתחי אוויר צהובים, קו צהוב על החישוקים השחורים ושילובי קרבון הם הניגוד היחיד מול האדום העמוק. כל השאר הוא גיאומטריה נקייה.',
  b1p3: 'טקסט ונתוני הדגמה: החליפו בנתונים האמיתיים של המכונית.',
  b1s1: 'מבט', b1s2: 'זוויות', b1s3: 'פריימים',
  b2k: '02 — תא נוסעים', b2h1: 'תא שנבנה', b2h2: 'סביב הנהג.',
  b2p1: 'מלמעלה רואים איך המרחב מאורגן: שני מושבי קרבון, מסגרת שמשה נמוכה והגה במרכז הקומפוזיציה. שום דבר מיותר, כל פאנל במקומו.',
  b2p2: 'התפרים הצהובים במושבים חוזרים על דגשי המרכב, והגג הפתוח משאיר את הנהג לבד עם הכביש. בהמשך המצלמה מתקרבת לפרטים.',
  b2s1: 'מושבים', b2s2: 'הרכבה ידנית', b2s3: 'שכבות צבע',
  b3k: '03 — פרטים', b3h1: 'הפרטים הקטנים', b3h2: 'שמעצבים את האופי.',
  b3p1: 'פנס עם שלושה קווי אור, תעלת אוויר מקרבון, רשת רדיאטור משושה ולהב צהוב בפגוש. בתצלום המקרו רואים איך הצבע המט מדכא השתקפויות ומדגיש את התבליט.',
  b3p2: 'פרטים, מסמכים ותמונות של הפריט נמצאים למטה.',
  m_alt: 'תצלום מקרו של חזית ה-Rosso Spider', m_copy: 'צבע מט, שילובי קרבון ודגשים צהובים: כל פרט מורכב ביד.',
  sp_k: 'פריט 0001 — נתונים', sp_h1: 'מספרים', sp_h2: 'שמדברים בעד עצמם.', sp_label: 'מפרט',
  sp_l1: 'כ"ס', sp_l2: '0–100 קמ"ש, שנ׳', sp_l3: 'מהירות מרבית, קמ"ש', sp_l4: 'יחיד מסוגו', sp_note: 'ערכי הדגמה: החליפו בנתוני המכונית.',
  pv_k: 'פריט 0001 — היסטוריה', pv_h1: 'יחיד מסוגו.', pv_h2: 'בטיפול קפדני.',
  pv_p1: 'הפריט נבדק וצולם על ידי הצוות שלנו. אנו בודקים מרכב, תא נוסעים, מסמכים והיסטוריית בעלות, ומפרסמים רק מה שאושר.',
  pv_p2: 'טקסט הדגמה: החליפו בנתונים אמיתיים על המכונית, היסטוריית הבעלות והמסמכים.',
  pv_l1: 'ק"מ, מד אוץ', pv_l2: 'מתוך', pv_l3: 'מוסמך',
  f_about: 'חלון ראווה פרטי למכוניות ספורט. כל פריט נבדק ומצולם על ידי הצוות שלנו לפני הפרסום.',
  f_lot: 'פריט 0001', f_paint: 'Rosso Spider · Rosso מט', f_carbon: 'קרבון / דגשים צהובים',
  f_garage: 'גראז׳', f_collection: 'קולקציה', f_sell: 'מכרו איתנו', f_concierge: 'קונסיירז׳', f_journal: 'מגזין', f_contact: 'צור קשר',
};

const DICTS: Record<Lang, Dict> = { en, ru, he };

type Ctx = { lang: Lang; dir: 'ltr' | 'rtl'; t: (k: string) => string; setLang: (l: Lang) => void };
const I18n = createContext<Ctx>({ lang: 'en', dir: 'ltr', t: (k) => en[k] ?? k, setLang: () => {} });
export const useI18n = () => useContext(I18n);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    let l: Lang = 'en';
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'ru' || saved === 'he') l = saved;
      else { const n = navigator.language.slice(0, 2); if (n === 'ru' || n === 'he') l = n; }
    } catch { /* storage unavailable */ }
    setLangState(l);
  }, []);

  const dir = lang === 'he' ? 'rtl' : 'ltr';
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch { /* ignore */ }
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, dir, setLang, t: (k) => DICTS[lang][k] ?? en[k] ?? k }), [lang, dir, setLang]);
  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}
