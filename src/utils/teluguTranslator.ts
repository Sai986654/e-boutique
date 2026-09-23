/**
 * Automated English to Telugu Translator & Transliteration Engine
 * Specialized for Andhra Pradesh & Telangana Handloom Sarees and 1-Gram Gold Ornaments.
 */

// Domain dictionary for high-precision boutique e-commerce terms
const BOUTIQUE_DICTIONARY: Record<string, string> = {
  // 1-Gram Gold Ornaments
  'one gram gold': 'ఒక గ్రాము బంగారం',
  '1 gram gold': 'ఒక గ్రాము బంగారం',
  '1-gram gold': 'ఒక గ్రాము బంగారం',
  '1gram gold': 'ఒక గ్రాము బంగారం',
  'one gram': 'ఒక గ్రాము',
  '1 gram': 'ఒక గ్రాము',
  '1-gram': 'ఒక గ్రాము',
  'gold': 'బంగారం',
  'silver': 'వెండి',
  'kasu mala': 'కాసుల పేరు',
  'kasulaperu': 'కాసుల పేరు',
  'coin necklace': 'కాసుల పేరు హారం',
  'guttapusalu': 'గుట్టపూసలు',
  'gutta pusalu': 'గుట్టపూసలు',
  'haram': 'హారం',
  'long haram': 'లాంగ్ హారం',
  'short haram': 'షార్ట్ హారం',
  'necklace': 'హారం',
  'choker': 'చోకర్ / కంఠాభరణం',
  'short necklace': 'కంఠాభరణం',
  'vaddanam': 'వడ్డాణం',
  'waist belt': 'వడ్డాణం',
  'odiyanam': 'వడ్డాణం',
  'jhumkas': 'బుట్టలు / జుంకీలు',
  'jhumka': 'బుట్టలు',
  'buttalu': 'బుట్టలు',
  'earrings': 'చెవి దిద్దులు / బుట్టలు',
  'bangles': 'గాజులు',
  'bangle': 'గాజులు',
  'kadas': 'కంకణాలు / కడాస్',
  'kada': 'కంకణం',
  'gajulu': 'గాజులు',
  'vanki': 'వంకీ',
  'bajuband': 'వంకీ / భుజకీర్తి',
  'armlet': 'వంకీ',
  'maang tikka': 'పాపిడి బిళ్ళ',
  'papidi billa': 'పాపిడి బిళ్ళ',
  'tikka': 'పాపిడి బిళ్ళ',
  'bridal set': 'సంపూర్ణ పెళ్లి ఆభరణాల సెట్',
  'wedding set': 'పెళ్లి ఆభరణాల సెట్',
  'temple jewelry': 'దేవాలయ ఆభరణాలు',
  'temple jewellery': 'దేవాలయ ఆభరణాలు',
  'nakshi': 'నగిషీ కళ',
  'nakshi work': 'నగిషీ పనితనం',
  'peacock': 'నెమలి',
  'peacocks': 'నెమళ్లు',
  'lakshmi': 'లక్ష్మీ దేవి',
  'laxmi': 'లక్ష్మీ దేవి',
  'goddess lakshmi': 'లక్ష్మీ దేవి',
  'gajalakshmi': 'గజలక్ష్మి',
  'ganesh': 'గణపతి',
  'ganesha': 'గణపతి',
  'lotus': 'కమలం',
  'mango': 'మామిడి పిందె',
  'mamidi': 'మామిడి పిందె',
  'mango mala': 'మామిడి పిందెల హారం',
  'kempu': 'కెంపులు',
  'kemp': 'కెంపు',
  'rubies': 'కెంపులు',
  'ruby': 'కెంపు',
  'emeralds': 'పచ్చలు',
  'emerald': 'పచ్చ',
  'pachalu': 'పచ్చలు',
  'pearls': 'ముత్యాలు',
  'pearl': 'ముత్యం',
  'muthyalu': 'ముత్యాలు',
  'basara pearls': 'బాసర ముత్యాలు',
  'cz stones': 'సిజెడ్ రాళ్ళు',
  'cz': 'సిజెడ్',
  'antique': 'యాంటిక్',
  'antique gold': 'యాంటిక్ బంగారం',
  'matte finish': 'మ్యాట్ ఫినిష్',
  'matte': 'మ్యాట్',
  'temple': 'దేవాలయ',
  'chain': 'గొలుసు',
  'ring': 'ఉంగరం',
  'rings': 'ఉంగరాలు',
  'pendant': 'లాకెట్',
  'micro gold': 'మైక్రో గోల్డ్',
  'electroplated': 'ఎలక్ట్రోప్లేటెడ్',
  'plated': 'ప్లేటెడ్',
  'pair': 'జత',

  // Regional Handloom Weaves & Sarees
  'pochampally': 'పోచంపల్లి',
  'pochampally ikkat': 'పోచంపల్లి ఇక్కత్',
  'gadwal': 'గద్వాల',
  'gadwal silk': 'గద్వాల పట్టు',
  'gadwal pattu': 'గద్వాల పట్టు',
  'uppada': 'ఉప్పాడ',
  'uppada jamdani': 'ఉప్పాడ జందానీ',
  'dharmavaram': 'ధర్మవరం',
  'dharmavaram silk': 'ధర్మవరం పట్టు',
  'mangalagiri': 'మంగళగిరి',
  'mangala': 'మంగళగిరి',
  'mangalagiri pattu': 'మంగళగిరి పట్టు',
  'mangalagiri cotton': 'మంగళగిరి కాటన్',
  'narayanpet': 'నారాయణపేట',
  'narayanpet handloom': 'నారాయణపేట చేనేత',
  'venkatagiri': 'వెంకటగిరి',
  'venkatagiri silk': 'వెంకటగిరి పట్టు',
  'kanjeevaram': 'కాంచీపురం',
  'kanchipuram': 'కాంచీపురం',
  'kanjeevaram silk': 'కాంచీపురం పట్టు',
  'organza': 'ఆర్గాన్జా',
  'tissue': 'టిష్యూ',
  'tissue silk': 'టిష్యూ పట్టు',
  'ikkat': 'ఇక్కత్',
  'ikat': 'ఇక్కత్',
  'double ikkat': 'డబుల్ ఇక్కత్',
  'jamdani': 'జందానీ',
  'kalamkari': 'కలంకారి',
  'hand painted kalamkari': 'చేతితో వేసిన కలంకారి',
  'silk': 'పట్టు',
  'pattu': 'పట్టు',
  'saree': 'చీర',
  'sari': 'చీర',
  'sarees': 'చీరలు',
  'cotton': 'కాటన్',
  'handloom': 'చేనేత',
  'pure silk': 'స్వచ్ఛమైన పట్టు',
  'silk mark': 'సిల్క్ మార్క్ సర్టిఫైడ్',
  'zari': 'జరీ',
  'gold zari': 'బంగారు జరీ',
  'silver zari': 'వెండి జరీ',
  'pure gold zari': 'స్వచ్ఛమైన బంగారు జరీ',
  'tested zari': 'టెస్టెడ్ జరీ',
  'temple border': 'టెంపుల్ బోర్డర్',
  'kuttu border': 'కుట్టు బోర్డర్',
  'nizam border': 'నిజాం బోర్డర్',
  'broad border': 'పెద్ద అంచు',
  'contrast': 'కాంట్రాస్ట్',
  'brocade': 'బ్రోకేడ్',
  'bridal': 'పెళ్లి',
  'wedding': 'పెళ్లి',
  'pelli': 'పెళ్లి',
  'festive': 'పండుగ',
  'puja': 'పూజ',
  'pooja': 'పూజ',
  'traditional': 'సాంప్రదాయ',
  'royal': 'రాయల్',
  'regal': 'రాచరిక',
  'grand': 'గ్రాండ్',
  'heritage': 'వారసత్వ',
  'collection': 'కలెక్షన్',
  'master weave': 'మాస్టర్ నేత',
  'rich': 'రిచ్',
  'heavy': 'గ్రాండ్',
  'blouse': 'బ్లౌజ్',
  'unstitched': 'కుట్టని',

  // Colors
  'red': 'ఎరుపు',
  'crimson': 'క్రిమ్సన్ ఎరుపు',
  'crimson red': 'ముదురు ఎరుపు',
  'yellow': 'పసుపు',
  'turmeric': 'పసుపు పచ్చ',
  'green': 'ఆకుపచ్చ',
  'parrot green': 'చిలుక పచ్చ',
  'blue': 'నీలం',
  'royal blue': 'రాయల్ బ్లూ',
  'pink': 'గులాబీ',
  'rani pink': 'రాణీ పింక్',
  'maroon': 'మెరూన్',
  'orange': 'నారింజ',
  'white': 'తెలుపు',
  'black': 'నలుపు',
  'purple': 'ఊదా',
};

// In-memory translation cache to guarantee 0ms instant typing
const translationCache = new Map<string, { telugu: string; suggestions: string[] }>();

/**
 * Phonetic transliteration mapping for fallback
 */
const TELUGU_CONSONANTS: Record<string, string> = {
  k: 'క', kh: 'ఖ', g: 'గ', gh: 'ఘ',
  ch: 'చ', chh: 'ఛ', j: 'జ', jh: 'ఝ',
  t: 'త', th: 'థ', d: 'ద', dh: 'ధ', n: 'న',
  T: 'ట', Th: 'ఠ', D: 'డ', Dh: 'ఢ', N: 'ణ',
  p: 'ప', ph: 'ఫ', b: 'బ', bh: 'భ', m: 'మ',
  y: 'య', r: 'ర', l: 'ల', v: 'వ', w: 'వ',
  sh: 'శ', shh: 'ష', s: 'స', h: 'హ',
};

/**
 * Quick client-side phonetic fallback transliterator
 */
function phoneticTeluguTransliterate(word: string): string {
  const lower = word.toLowerCase().trim();
  if (!lower) return '';
  if (BOUTIQUE_DICTIONARY[lower]) return BOUTIQUE_DICTIONARY[lower];

  // Try partial dictionary match
  for (const [key, val] of Object.entries(BOUTIQUE_DICTIONARY)) {
    if (lower === key) return val;
  }

  // Basic character conversion
  let result = '';
  let i = 0;
  while (i < lower.length) {
    // 3-char match
    const sub3 = lower.slice(i, i + 3);
    // 2-char match
    const sub2 = lower.slice(i, i + 2);
    // 1-char match
    const sub1 = lower.slice(i, i + 1);

    if (TELUGU_CONSONANTS[sub3]) {
      result += TELUGU_CONSONANTS[sub3];
      i += 3;
    } else if (TELUGU_CONSONANTS[sub2]) {
      result += TELUGU_CONSONANTS[sub2];
      i += 2;
    } else if (TELUGU_CONSONANTS[sub1]) {
      result += TELUGU_CONSONANTS[sub1];
      i += 1;
    } else if (sub1 === 'a' || sub1 === 'e' || sub1 === 'i' || sub1 === 'o' || sub1 === 'u') {
      // Vowels attach
      if (result.length > 0) {
        if (sub1 === 'a') result += 'ా';
        else if (sub1 === 'i') result += 'ి';
        else if (sub1 === 'e') result += 'ె';
        else if (sub1 === 'u') result += 'ు';
        else if (sub1 === 'o') result += 'ో';
      } else {
        if (sub1 === 'a') result += 'అ';
        else if (sub1 === 'i') result += 'ఇ';
        else if (sub1 === 'e') result += 'ఎ';
        else if (sub1 === 'u') result += 'ఉ';
        else if (sub1 === 'o') result += 'ఒ';
      }
      i += 1;
    } else {
      result += sub1;
      i += 1;
    }
  }

  return result || word;
}

/**
 * Fetch candidates from Google Input Tools API (public Google Transliteration)
 */
async function fetchGoogleInputTools(query: string): Promise<string[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://inputtools.google.com/request?text=${encoded}&itc=te-t-i0-und&num=5`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
      return data[1][0][1] as string[];
    }
  } catch (err) {
    // network or CORS fallback
  }
  return [];
}

/**
 * Main translation function
 * Translates English text to authentic Telugu script for boutique catalog.
 */
export async function translateEnglishToTelugu(
  inputText: string,
  department: 'saree' | 'ornament' = 'ornament'
): Promise<{ telugu: string; suggestions: string[] }> {
  const trimmed = inputText.trim();
  if (!trimmed) {
    return { telugu: '', suggestions: [] };
  }

  const cacheKey = `${department}:${trimmed.toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Direct dictionary match for exact phrase
  const directMatch = BOUTIQUE_DICTIONARY[trimmed.toLowerCase()];
  if (directMatch) {
    const res = { telugu: directMatch, suggestions: [directMatch] };
    translationCache.set(cacheKey, res);
    return res;
  }

  // 2. Tokenize and replace multi-word domain phrases
  let workingText = trimmed.toLowerCase();
  const replacements: Array<{ placeholder: string; telugu: string }> = [];
  let placeholderIndex = 0;

  // Sort dictionary keys by length descending to match longest phrases first (e.g. "one gram gold kasu mala")
  const sortedKeys = Object.keys(BOUTIQUE_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    if (regex.test(workingText)) {
      const ph = `__PH_${placeholderIndex}__`;
      workingText = workingText.replace(regex, ph);
      replacements.push({ placeholder: ph, telugu: BOUTIQUE_DICTIONARY[key] });
      placeholderIndex++;
    }
  }

  // 3. For any remaining words, transliterate them
  const tokens = workingText.split(/\s+/);
  const translatedTokens: string[] = [];
  const candidateSuggestions: Set<string> = new Set();

  for (const token of tokens) {
    if (!token) continue;
    const rep = replacements.find((r) => r.placeholder === token);
    if (rep) {
      translatedTokens.push(rep.telugu);
      candidateSuggestions.add(rep.telugu);
    } else {
      // Check if it's punctuation or number
      if (/^[0-9₹,\.\-\+\(\)]+$/.test(token)) {
        translatedTokens.push(token);
        continue;
      }

      // Try Google Input Tools transliteration
      let transliterated = '';
      try {
        const candidates = await fetchGoogleInputTools(token);
        if (candidates.length > 0) {
          transliterated = candidates[0];
          candidates.slice(0, 4).forEach((c) => candidateSuggestions.add(c));
        }
      } catch {
        // Fallback
      }

      if (!transliterated) {
        transliterated = phoneticTeluguTransliterate(token);
        candidateSuggestions.add(transliterated);
      }

      translatedTokens.push(transliterated);
    }
  }

  let finalTelugu = translatedTokens.join(' ').trim();

  // If department is ornament and doesn't mention one gram gold, but user is adding ornament, give contextual suggestions
  const suggestionsList = Array.from(candidateSuggestions).slice(0, 5);

  // If dictionary had exact phrase suggestions, prepend them
  if (trimmed.toLowerCase().includes('mangala') && !suggestionsList.includes('మంగళగిరి')) {
    suggestionsList.unshift('మంగళగిరి');
  }

  const result = {
    telugu: finalTelugu,
    suggestions: suggestionsList,
  };

  translationCache.set(cacheKey, result);
  return result;
}
