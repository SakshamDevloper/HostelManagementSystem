const mongoose = require('mongoose');
require('dotenv').config();

const MessMenu = require('./models/MessMenu');

const seedData = {
  South: {
    breakfast: {
      '2026-07-16': 'Semiya Upma & Chutney',
      '2026-07-17': 'Imli Rice',
      '2026-07-18': 'Thepla & Onion Pickle',
      '2026-07-19': 'Bread Butter',
      '2026-07-20': 'Semiya Upma & Chutney',
      '2026-07-21': 'Aloo Matar Sandwich & Sauce',
      '2026-07-22': 'Dal Vada Chutney',
      '2026-07-23': 'Idly & Chutney',
    },
    lunch: {
      '2026-07-16': ['Drumstick Tomato', 'Rasa Moong / Rasam', 'Roti', 'Rice', 'Dal', 'Pickle', 'Butter Milk', 'Sambharo'],
      '2026-07-17': ['Soyabean Matar', 'Desi Chana / Miriyala Rasam', 'Roti', 'Rice', 'Dal', 'Karampodi', 'Butter Milk', 'Mix Salad'],
      '2026-07-18': ['Aloo Gwar Dry', 'Tuver / Tomato Rasam', 'Roti', 'Rice', 'Dal', 'Pickle', 'Butter Milk', 'Salad'],
      '2026-07-19': ['Chole', 'Puri', 'Rice', 'Sambhar', 'Pickle', 'Butter Milk', 'Fry Chilli'],
      '2026-07-20': ['Dudhi Chana Dal', 'Pachi Pulusu', 'Roti', 'Rice', 'Dal', 'Pickle', 'Butter Milk', 'Onion Salad'],
      '2026-07-21': ['Turiya Matar', 'Rasam', 'Roti', 'Rice', 'Dal', 'Karampodi', 'Butter Milk', 'Onion Salad'],
      '2026-07-22': ['Dahi Onion', 'Chana Dal / Miriyala Rasam', 'Roti', 'Rice', 'Dal', 'Pickle', 'Butter Milk', 'Salad'],
      '2026-07-23': ['Aloo Tindora', 'Tomato Rasam', 'Roti', 'Rice', 'Dal', 'Karampodi', 'Butter Milk', 'Onion Salad'],
    },
    dinner: {
      '2026-07-16': ['Aloo Kurma', 'Roti', 'Briyani / Masala Rice', 'Chaas Bhondi Raita'],
      '2026-07-17': ['Batani Kurma', 'Pav', 'Rice', 'Sambhar', 'Veg Chutney'],
      '2026-07-18': ['Veg Hakka Noodles', 'Fried Rice', 'Soup'],
      '2026-07-19': ['Sambhar / Dal', 'Rice', 'Pickle'],
      '2026-07-20': ['Roti', 'Rice', 'Sambhar'],
      '2026-07-21': ['Aloo Palak Punjabi', 'Roti', 'Rice', 'Dal Fry'],
      '2026-07-22': ['Carrot Beans', 'Roti', 'Rice', 'Sambhar'],
      '2026-07-23': ['Brinjal Fry (South Style)', 'Roti', 'Rice', 'Dal Tadka', 'Chutney'],
    },
  },
  North: {
    breakfast: {
      '2026-07-16': 'Farsi Puri',
      '2026-07-17': 'Ratlami Sev Poha',
      '2026-07-18': 'Thepla & Sweet Pickle',
      '2026-07-19': 'Bread Butter',
      '2026-07-20': 'Semiya Upma & Chutney',
      '2026-07-21': 'Aloo Matar Sandwich & Sauce',
      '2026-07-22': 'Veg. Pakoda',
      '2026-07-23': 'Idly & Chutney',
    },
    lunch: {
      '2026-07-16': ['Sev Tomato', 'Rasa Moong', 'Roti', 'Rice', 'Dal (Sweet/Spicy)', 'Pickle', 'Butter Milk', 'Sambharo'],
      '2026-07-17': ['Soyabean Matar', 'Desi Chana', 'Roti', 'Rice', 'Dal (Sweet/Spicy)', 'Pickle', 'Butter Milk', 'Mix Salad'],
      '2026-07-18': ['Aloo Gwar', 'Tuver', 'Roti', 'Rice', 'Dal (Sweet/Spicy)', 'Pickle', 'Butter Milk', 'Salad'],
      '2026-07-19': ['Chole', 'Puri', 'Veg Pulao', 'Kadhi', 'Pickle', 'Butter Milk', 'Fry Chilli'],
      '2026-07-20': ['Dudhi Chana Dal', 'Roti', 'Rice', 'Dal (Sweet/Spicy)', 'Pickle', 'Butter Milk', 'Onion Salad'],
      '2026-07-21': ['Turiya Matar', 'Chora', 'Roti', 'Rice', 'Dal (Sweet/Spicy)', 'Pickle', 'Butter Milk'],
      '2026-07-22': ['Dahi Onion', 'Chana Dal', 'Roti', 'Rice', 'Dal (Sweet/Spicy)', 'Pickle', 'Butter Milk', 'Salad'],
      '2026-07-23': ['Aloo Tindora Fry', 'Roti', 'Rice', 'Dal (Sweet/Spicy)', 'Pickle', 'Butter Milk', 'Onion Salad'],
    },
    dinner: {
      '2026-07-16': ['Aloo Kurma', 'Roti', 'Briyani / Masala Rice', 'Chaas Bhondi Raita'],
      '2026-07-17': ['Bhaji', 'Pav', 'Veg. Pulao', 'Onion Salad'],
      '2026-07-18': ['Veg Hakka Noodles', 'Fried Rice', 'Soup'],
      '2026-07-19': ['Sambhar / Dal', 'Rice', 'Pickle'],
      '2026-07-20': ['Bhindi Masala (Veg Kofta)', 'Roti', 'Rice', 'Dal Fry'],
      '2026-07-21': ['Aloo Palak Punjabi', 'Roti', 'Rice', 'Dal Fry'],
      '2026-07-22': ['Rajma Masala', 'Roti', 'Rice', 'Drumstick Kadhi', 'Laccha Pyaaz'],
      '2026-07-23': ['Brinjal Fry (South Style)', 'Roti', 'Rice', 'Dal Tadka', 'Chutney'],
    },
  },
};

const notesMap = { North: 'Butter milk is limited in lunch (1 per person).', South: '' };

const buildEntries = () => {
  const entries = [];
  for (const [mess, meals] of Object.entries(seedData)) {
    for (const [meal, dates] of Object.entries(meals)) {
      for (const [dateStr, items] of Object.entries(dates)) {
        const itemList = typeof items === 'string' ? [items] : items;
        entries.push({
          mess,
          date: new Date(dateStr),
          meal: meal.charAt(0).toUpperCase() + meal.slice(1),
          items: itemList,
          notes: meal === 'lunch' ? notesMap[mess] : '',
        });
      }
    }
  }
  return entries;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await MessMenu.deleteMany({});
    console.log('Cleared existing mess menu data');

    const entries = buildEntries();
    await MessMenu.insertMany(entries);
    console.log(`✅ Seeded ${entries.length} mess menu entries`);

    const counts = await MessMenu.aggregate([
      { $group: { _id: { mess: '$mess', meal: '$meal' }, count: { $sum: 1 } } },
    ]);
    for (const c of counts) {
      console.log(`  ${c._id.mess} ${c._id.meal}: ${c.count} entries`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
