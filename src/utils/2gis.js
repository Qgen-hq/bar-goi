/**
 * 2GIS Navigation Helper for Kazakhstan Automarkets
 */

export const MARKET_2GIS_MAP = {
  'Талдыкорган - Центральный авторынок': 'https://2gis.kz/taldykorgan/search/Центральный%20авторынок',
  'Талдыкорган - ТД Автомиг': 'https://2gis.kz/taldykorgan/search/ТД%20Автомиг',
  'Талдыкорган - Авторынок Жетысу': 'https://2gis.kz/taldykorgan/search/Жетысу%20авторынок',
  'Алматы - Car City (Кар Сити)': 'https://2gis.kz/almaty/search/Car%20City',
  'Алматы - ТД Баянауыл': 'https://2gis.kz/almaty/search/Баянауыл',
  'Астана - Авторынок Коктал': 'https://2gis.kz/astana/search/Коктал%20авторынок',
  'Шымкент - Авторынок Жибек Жолы': 'https://2gis.kz/shymkent/search/Жибек%20Жолы%20авторынок'
};

export function get2GISUrl(marketName, city = 'Талдыкорган') {
  if (MARKET_2GIS_MAP[marketName]) {
    return MARKET_2GIS_MAP[marketName];
  }
  const cleanCity = encodeURIComponent(city || 'Талдыкорган');
  const cleanMarket = encodeURIComponent(marketName || 'авторынок');
  return `https://2gis.kz/${cleanCity}/search/${cleanMarket}`;
}
