// Smart icon mapper for shopping items
export const getItemIcon = (itemName: string): string => {
  const name = itemName.toLowerCase().trim();
  
  // Fruits & Vegetables
  if (name.includes('תפוח') || name.includes('תפוז')) return '🍎';
  if (name.includes('בננ')) return '🍌';
  if (name.includes('עגבני')) return '🍅';
  if (name.includes('מלפפון') || name.includes('מלפפונ')) return '🥒';
  if (name.includes('גזר')) return '🥕';
  if (name.includes('תפוח אדמה') || name.includes('תפו"א')) return '🥔';
  if (name.includes('בצל')) return '🧅';
  if (name.includes('שום')) return '🧄';
  if (name.includes('תות')) return '🍓';
  if (name.includes('ענב')) return '🍇';
  if (name.includes('אבטיח')) return '🍉';
  if (name.includes('פלפל')) return '🫑';
  if (name.includes('חסה') || name.includes('ירוק עלים')) return '🥬';
  if (name.includes('ברוקולי')) return '🥦';
  if (name.includes('תירס')) return '🌽';
  
  // Dairy
  if (name.includes('חלב')) return '🥛';
  if (name.includes('גבינ')) return '🧀';
  if (name.includes('יוגורט') || name.includes('דנונ')) return '🥛';
  if (name.includes('חמאה')) return '🧈';
  if (name.includes('שמנת')) return '🥛';
  if (name.includes('קוטג')) return '🧀';
  
  // Bakery
  if (name.includes('לחם') || name.includes('פיתה')) return '🍞';
  if (name.includes('חלה')) return '🥖';
  if (name.includes('בגט')) return '🥖';
  if (name.includes('רולד') || name.includes('לחמני')) return '🥐';
  if (name.includes('עוגה') || name.includes('עוגי')) return '🍰';
  if (name.includes('מאפה')) return '🥐';
  
  // Meat & Protein
  if (name.includes('בשר') || name.includes('סטייק')) return '🥩';
  if (name.includes('עוף') || name.includes('תרנגול')) return '🍗';
  if (name.includes('דג') || name.includes('סלמון') || name.includes('טונה')) return '🐟';
  if (name.includes('ביצ')) return '🥚';
  if (name.includes('נקניק')) return '🌭';
  if (name.includes('המבורגר')) return '🍔';
  
  // Drinks
  if (name.includes('מים')) return '💧';
  if (name.includes('קפה')) return '☕';
  if (name.includes('תה')) return '🍵';
  if (name.includes('מיץ') || name.includes('משקה')) return '🧃';
  if (name.includes('קולה') || name.includes('ספרייט') || name.includes('פאנטה')) return '🥤';
  if (name.includes('בירה')) return '🍺';
  if (name.includes('יין')) return '🍷';
  
  // Snacks & Sweets
  if (name.includes('שוקולד')) return '🍫';
  if (name.includes('ממתק') || name.includes('סוכרי')) return '🍬';
  if (name.includes('חטיף') || name.includes('במבה') || name.includes('ביסלי')) return '🍿';
  if (name.includes('גלידה')) return '🍦';
  if (name.includes('עוגיי')) return '🍪';
  
  // Grains & Pasta
  if (name.includes('אורז')) return '🍚';
  if (name.includes('פסטה') || name.includes('ספגטי') || name.includes('מקרוני')) return '🍝';
  if (name.includes('פיצה')) return '🍕';
  if (name.includes('דגני בוקר') || name.includes('קורנפלקס')) return '🥣';
  
  // Cleaning & Household
  if (name.includes('סבון') || name.includes('ניקוי')) return '🧼';
  if (name.includes('נייר טואלט') || name.includes('ניר')) return '🧻';
  if (name.includes('מגבת') || name.includes('ספוג')) return '🧽';
  if (name.includes('אשפה') || name.includes('שקיות')) return '🗑️';
  if (name.includes('כביסה') || name.includes('ג\'ל')) return '🧴';
  if (name.includes('מטליות')) return '🧹';
  
  // Baby & Personal Care
  if (name.includes('תינוק') || name.includes('חיתול')) return '👶';
  if (name.includes('שמפו')) return '🧴';
  if (name.includes('משחת שיני')) return '🪥';
  if (name.includes('סבון ידי')) return '🧴';
  
  // Condiments & Spices
  if (name.includes('מלח')) return '🧂';
  if (name.includes('סוכר')) return '🍯';
  if (name.includes('קטשופ') || name.includes('קצ\'אפ')) return '🍅';
  if (name.includes('מיונז') || name.includes('חרדל')) return '🥫';
  if (name.includes('שמן') || name.includes('זית')) return '🫒';
  
  // Canned & Packaged
  if (name.includes('שימור') || name.includes('קופסא')) return '🥫';
  if (name.includes('חומוס') || name.includes('טחינה')) return '🥙';
  
  // Default by category keywords
  if (name.includes('אוכל') || name.includes('מזון')) return '🍽️';
  if (name.includes('משקה')) return '🥤';
  if (name.includes('ניקיון')) return '🧹';
  
  // Default icon
  return '🛒';
};

export const getItemCategory = (itemName: string): string => {
  const name = itemName.toLowerCase().trim();
  
  // Fruits & Vegetables
  if (name.match(/תפוח|בננ|עגבני|מלפפון|גזר|תפוח אדמה|בצל|שום|תות|ענב|אבטיח|פלפל|חסה|ברוקולי|תירס/)) {
    return 'פירות וירקות';
  }
  
  // Dairy
  if (name.match(/חלב|גבינ|יוגורט|דנונ|חמאה|שמנת|קוטג/)) {
    return 'מוצרי חלב';
  }
  
  // Bakery
  if (name.match(/לחם|פיתה|חלה|בגט|רולד|לחמני|עוגה|מאפה/)) {
    return 'לחם ומאפים';
  }
  
  // Meat & Protein
  if (name.match(/בשר|עוף|דג|סלמון|טונה|ביצ|נקניק|המבורגר/)) {
    return 'בשר ודגים';
  }
  
  // Drinks
  if (name.match(/מים|קפה|תה|מיץ|קולה|ספרייט|בירה|יין|משקה/)) {
    return 'משקאות';
  }
  
  // Snacks
  if (name.match(/שוקולד|ממתק|חטיף|במבה|ביסלי|גלידה|עוגיי/)) {
    return 'חטיפים וממתקים';
  }
  
  // Grains
  if (name.match(/אורז|פסטה|ספגטי|מקרוני|פיצה|דגני בוקר|קורנפלקס/)) {
    return 'דגנים ופחמימות';
  }
  
  // Cleaning
  if (name.match(/סבון|ניקוי|נייר|מגבת|ספוג|אשפה|שקיות|כביסה|מטליות/)) {
    return 'ניקיון';
  }
  
  // Personal Care
  if (name.match(/תינוק|חיתול|שמפו|משחת שיני|סבון ידי/)) {
    return 'טיפוח';
  }
  
  // Condiments
  if (name.match(/מלח|סוכר|קטשופ|מיונז|חרדל|שמן|זית/)) {
    return 'תבלינים';
  }
  
  return 'כללי';
};
