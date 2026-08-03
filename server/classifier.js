// Smart Auto-Classifier Algorithm for PartDrive

export const CAR_ORIGINS = {
  Germany: { id: 'Germany', name: 'Германия', flag: '🇩🇪', code: 'DE' },
  Japan: { id: 'Japan', name: 'Япония', flag: '🇯🇵', code: 'JP' },
  China: { id: 'China', name: 'Китай', flag: '🇨🇳', code: 'CN' },
  Korea: { id: 'Korea', name: 'Корея', flag: '🇰🇷', code: 'KR' },
  USA: { id: 'USA', name: 'США', flag: '🇺🇸', code: 'US' }
};

export const PART_CATEGORIES = {
  Engine: { id: 'Engine', name: 'Двигатель', icon: 'Engine' },
  Transmission: { id: 'Transmission', name: 'Трансмиссия', icon: 'Cog' },
  Brakes: { id: 'Brakes', name: 'Тормозная система', icon: 'Disc' },
  Suspension: { id: 'Suspension', name: 'Подвеска и Рулевое', icon: 'GitCommit' },
  Electrical: { id: 'Electrical', name: 'Электрика', icon: 'Zap' },
  Body: { id: 'Body', name: 'Кузовные детали', icon: 'Shield' },
  Optics: { id: 'Optics', name: 'Оптика и Свет', icon: 'Sun' },
  Consumables: { id: 'Consumables', name: 'Расходники и ТО', icon: 'Wrench' }
};

const CAR_PATTERNS = [
  { origin: 'Germany', keywords: ['bmw', 'бмв', 'audi', 'ауди', 'mercedes', 'мерседес', 'benz', 'бенц', 'vw', 'volkswagen', 'фольксваген', 'porsche', 'порше', 'opel', 'опель', 'maybach', 'майбах'] },
  { origin: 'Japan', keywords: ['toyota', 'тойота', 'camry', 'камри', 'corolla', 'королла', 'rav4', 'рав4', 'prado', 'прадо', 'land cruiser', ' крузер', 'lexus', 'лексус', 'honda', 'хонда', 'civic', 'цивик', 'cr-v', 'crv', 'nissan', 'ниссан', 'patrol', 'патрол', 'qashqai', 'кашкай', 'infiniti', 'инфинити', 'subaru', 'субару', 'forester', 'форестер', 'outback', 'аутбек', 'mazda', 'мазда', 'mitsubishi', 'митсубиси', 'pajero', 'паджеро', 'outlander', 'аутлендер', 'suzuki', 'сузуки'] },
  { origin: 'Korea', keywords: ['hyundai', 'хендай', 'хюндай', 'хундай', 'sonata', 'соната', 'elantra', 'элантра', 'tucson', 'туксон', 'туссан', 'santa fe', 'санта фе', 'kia', 'киа', 'optima', 'оптима', 'k5', 'к5', 'rio', 'рио', 'sportage', 'спортейдж', 'sorento', 'соренто', 'genesis', 'генезис', 'ssangyong', 'ссангйонг'] },
  { origin: 'China', keywords: ['geely', 'джили', 'monjaro', 'монжаро', 'coolray', 'кулрей', 'haval', 'хавал', 'jolion', 'джолион', 'f7', 'chery', 'чери', 'tiggo', 'тигго', 'byd', 'бид', 'song', 'сонг', 'tang', 'танг', 'han', 'хан', 'changan', 'чанган', 'exeed', 'эксид', 'li', 'li auto', 'ли авто', 'l7', 'l9', 'zeekr', 'зикр', 'tank', 'танк', 'jetour', 'джетур', 'voyah', 'воя', 'hongqi', 'хонгчи'] },
  { origin: 'USA', keywords: ['ford', 'форд', 'focus', 'фокус', 'explorer', 'эксплорер', 'mustang', 'мустанг', 'f-150', 'f150', 'chevrolet', 'шевроле', 'captiva', 'каптива', 'tahoe', 'тахо', 'camaro', 'камаро', 'dodge', 'додж', 'challenger', 'челленджер', 'charger', 'чарджер', 'ram', 'рэм', 'jeep', 'джип', 'grand cherokee', 'чероки', 'wrangler', 'вранглер', 'tesla', 'тесла', 'model 3', 'model y', 'cadillac', 'кадиллак', 'lincoln', 'линкольн', 'gmc', 'джмс'] }
];

const CATEGORY_PATTERNS = [
  { category: 'Brakes', keywords: ['колодк', 'тормоз', 'суппорт', 'диск тормоз', 'вакуум', 'abs', 'абс', 'шланги тормоз', 'ручник', 'цилиндр тормоз'] },
  { category: 'Engine', keywords: ['помп', 'двигател', 'двс', 'гбц', 'поршен', 'клапан', 'кольц', 'грм', 'ремень грм', 'цепь грм', 'масло', 'свеч', 'форсунк', 'турбин', 'радиатор', 'термостат', 'коллектор', 'патрубок', 'подушка двс', 'глушитель', 'катализатор'] },
  { category: 'Transmission', keywords: ['коробк', 'кпп', 'акпп', 'мкпп', 'вариатор', 'сцеплени', 'маховик', 'привод', 'гранат', 'шрус', 'кардан', 'редуктор', 'дифференциал', 'раздатка', 'кулиса', 'селектор'] },
  { category: 'Suspension', keywords: ['рейк', 'рулев', 'амортизатор', 'стойк', 'пружин', 'рычаг', 'сайлентблок', 'шаров', 'ступиц', 'подшипник', 'тяг', 'стабилизатор', 'гур', 'электрорейк', 'опорный'] },
  { category: 'Electrical', keywords: ['генератор', 'стартер', 'аккумулятор', 'акб', 'эбу', 'мозг', 'датчик', 'катушк', 'проводк', 'предохранител', 'парктроник', 'реле', 'сигнал', 'панель', 'спидометр'] },
  { category: 'Optics', keywords: ['фар', 'фонарь', 'туманк', 'птф', 'дхо', 'линз', 'ксенон', 'светодиод', 'поворотник', 'стоп-сигнал', 'габарит'] },
  { category: 'Body', keywords: ['бампер', 'капот', 'крыло', 'дверь', 'багажник', 'решетка', 'порог', 'стекло', 'лобовое', 'зеркало', 'замок', 'крыша', 'подкрылок', 'молдинг', 'ручка'] },
  { category: 'Consumables', keywords: ['антифриз', 'фильтр', 'масло', 'щетк', 'дворник', 'жидкость', 'фреон', 'омывайка'] }
];

export function autoClassify(carInput, partInput) {
  const carText = (carInput || '').toLowerCase().trim();
  const partText = (partInput || '').toLowerCase().trim();

  // Determine Country Origin
  let matchedOrigin = 'Germany'; // default baseline if undetected
  let originFound = false;

  for (const item of CAR_PATTERNS) {
    if (item.keywords.some(kw => carText.includes(kw))) {
      matchedOrigin = item.origin;
      originFound = true;
      break;
    }
  }

  // Determine Part Category
  let matchedCategory = 'Suspension'; // default baseline
  let categoryFound = false;

  for (const item of CATEGORY_PATTERNS) {
    if (item.keywords.some(kw => partText.includes(kw))) {
      matchedCategory = item.category;
      categoryFound = true;
      break;
    }
  }

  return {
    origin: CAR_ORIGINS[matchedOrigin],
    category: PART_CATEGORIES[matchedCategory],
    originDetected: originFound,
    categoryDetected: categoryFound
  };
}
