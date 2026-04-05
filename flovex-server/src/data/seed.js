const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const transactions = [
  // ── SALARIES (6 months) ──
  { name: 'Salary - April 2025',    amount: 95000,  category: 'Salary',        type: 'income',  status: 'completed', date: daysAgo(5)   },
  { name: 'Salary - March 2025',    amount: 95000,  category: 'Salary',        type: 'income',  status: 'completed', date: daysAgo(35)  },
  { name: 'Salary - February 2025', amount: 90000,  category: 'Salary',        type: 'income',  status: 'completed', date: daysAgo(65)  },
  { name: 'Salary - January 2025',  amount: 90000,  category: 'Salary',        type: 'income',  status: 'completed', date: daysAgo(95)  },
  { name: 'Salary - December 2024', amount: 88000,  category: 'Salary',        type: 'income',  status: 'completed', date: daysAgo(125) },
  { name: 'Salary - November 2024', amount: 88000,  category: 'Salary',        type: 'income',  status: 'completed', date: daysAgo(155) },

  // ── FREELANCE ──
  { name: 'Freelance - UI/UX Design Project',       amount: 22000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(8)   },
  { name: 'Freelance - React Dashboard Build',      amount: 35000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(18)  },
  { name: 'Freelance - Logo & Brand Identity',      amount: 12000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(40)  },
  { name: 'Freelance - Backend API Module',         amount: 28000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(52)  },
  { name: 'Freelance - WordPress Site',             amount: 9500,  category: 'Freelance', type: 'income', status: 'pending',   date: daysAgo(60)  },
  { name: 'Freelance - Mobile App Prototype',       amount: 41000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(74)  },
  { name: 'Freelance - Data Analytics Report',      amount: 18000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(88)  },
  { name: 'Freelance - Shopify Store Setup',        amount: 15500, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(102) },
  { name: 'Freelance - SEO Consultation',           amount: 8000,  category: 'Freelance', type: 'income', status: 'pending',   date: daysAgo(120) },
  { name: 'Freelance - Video Editing Bundle',       amount: 13500, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(140) },

  // ── INVESTMENT RETURNS ──
  { name: 'Nifty50 SIP Return',          amount: 14200, category: 'Investment', type: 'income', status: 'completed', date: daysAgo(10)  },
  { name: 'Dividend Payout - HDFC',      amount: 3800,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(28)  },
  { name: 'Mutual Fund Redemption',      amount: 22000, category: 'Investment', type: 'income', status: 'completed', date: daysAgo(45)  },
  { name: 'US Stocks - Partial Exit',    amount: 18600, category: 'Investment', type: 'income', status: 'completed', date: daysAgo(70)  },
  { name: 'Gold ETF Profit',             amount: 5400,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(90)  },
  { name: 'Dividend Payout - TCS',       amount: 2100,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(110) },
  { name: 'PPF Interest Credit',         amount: 7800,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(130) },
  { name: 'Crypto - USDT Profit',        amount: 9200,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(150) },

  // ── FOOD & DINING ──
  { name: 'Zomato - Biryani Order',       amount: 680,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(2)   },
  { name: 'Swiggy - Office Lunch',        amount: 1250, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(4)   },
  { name: 'Blinkit - Weekly Groceries',   amount: 3200, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(6)   },
  { name: 'Cafe Coffee Day - Meeting',    amount: 560,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(9)   },
  { name: 'Domino\'s Pizza - Weekend',    amount: 890,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(12)  },
  { name: 'BigBasket - Monthly Stock',    amount: 4800, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(15)  },
  { name: 'Starbucks - Client Coffee',    amount: 720,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(19)  },
  { name: 'Zomato - Team Dinner',         amount: 3400, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(23)  },
  { name: 'Swiggy - Late Night Snack',    amount: 340,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(27)  },
  { name: 'Blinkit - Fruits & Veggies',   amount: 1100, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(32)  },
  { name: 'McDonald\'s - Quick Bite',     amount: 460,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(38)  },
  { name: 'BigBasket - Monthly Stock',    amount: 4600, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(45)  },
  { name: 'Zomato - Birthday Party',      amount: 5200, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(50)  },
  { name: 'Swiggy - Breakfast',           amount: 280,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(55)  },
  { name: 'KFC - Family Meal',            amount: 1650, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(62)  },
  { name: 'Zepto - Grocery Top-up',       amount: 890,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(68)  },
  { name: 'Blinkit - Weekly Groceries',   amount: 2900, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(75)  },
  { name: 'Zomato - Lunch Delivery',      amount: 520,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(82)  },
  { name: 'BigBasket - Monthly Stock',    amount: 4400, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(90)  },
  { name: 'Swiggy - Pizza Friday',        amount: 980,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(98)  },
  { name: 'Zomato - Dinner',              amount: 760,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(108) },
  { name: 'Chai Point - Daily Coffee',    amount: 180,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(115) },
  { name: 'Blinkit - Groceries',          amount: 3100, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(122) },
  { name: 'Subway - Lunch',               amount: 420,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(130) },
  { name: 'BigBasket - Monthly Stock',    amount: 4200, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(138) },
  { name: 'Zomato - Celebration Dinner',  amount: 2800, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(148) },
  { name: 'Swiggy - Weekend Brunch',      amount: 1400, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(155) },

  // ── TRANSPORT ──
  { name: 'Ola - Airport Pickup',         amount: 980,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(3)   },
  { name: 'Metro Card Recharge',          amount: 500,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(7)   },
  { name: 'Uber - Office Commute',        amount: 320,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(11)  },
  { name: 'Rapido - Daily Ride',          amount: 180,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(14)  },
  { name: 'IndiGo - Mumbai Flight',       amount: 5800, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(20)  },
  { name: 'Ola - Late Night Cab',         amount: 460,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(25)  },
  { name: 'IRCTC - Train Ticket',         amount: 1200, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(33)  },
  { name: 'Uber - Weekend Trip',          amount: 640,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(41)  },
  { name: 'Petrol - Honda City',          amount: 3200, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(48)  },
  { name: 'Metro Card Recharge',          amount: 500,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(57)  },
  { name: 'IndiGo - Bangalore Flight',    amount: 4200, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(66)  },
  { name: 'Ola - Office Commute',         amount: 280,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(73)  },
  { name: 'Petrol - Honda City',          amount: 2900, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(80)  },
  { name: 'Rapido - Grocery Run',         amount: 120,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(88)  },
  { name: 'IRCTC - Weekend Getaway',      amount: 1800, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(96)  },
  { name: 'Uber - Night Out',             amount: 550,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(105) },
  { name: 'Petrol - Honda City',          amount: 3100, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(115) },
  { name: 'Metro Card Recharge',          amount: 500,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(125) },
  { name: 'IndiGo - Chennai Flight',      amount: 3900, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(140) },
  { name: 'Ola - Airport Drop',           amount: 860,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(152) },

  // ── SHOPPING ──
  { name: 'Amazon - MacBook Stand',       amount: 2800, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(4)   },
  { name: 'Myntra - Summer Wardrobe',     amount: 6400, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(13)  },
  { name: 'Flipkart - Mechanical Keyboard', amount: 4200, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(22) },
  { name: 'Amazon - Books Bundle',        amount: 1800, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(30)  },
  { name: 'Nykaa - Skincare Kit',         amount: 2200, category: 'Shopping', type: 'expense', status: 'pending',    date: daysAgo(36)  },
  { name: 'Flipkart - Smart Watch',       amount: 8900, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(44)  },
  { name: 'Amazon - Desk Organiser',      amount: 1400, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(53)  },
  { name: 'Myntra - Winter Jacket',       amount: 3800, category: 'Shopping', type: 'expense', status: 'chargeback', date: daysAgo(61)  },
  { name: 'Amazon - USB-C Hub',           amount: 2100, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(71)  },
  { name: 'Flipkart - Noise Earbuds',     amount: 3200, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(79)  },
  { name: 'AJIO - Casual Wear',           amount: 2900, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(87)  },
  { name: 'Amazon - Webcam',              amount: 3600, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(95)  },
  { name: 'Myntra - Festive Ethnic',      amount: 4500, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(103) },
  { name: 'Flipkart - Power Bank',        amount: 1600, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(112) },
  { name: 'Amazon - Home Decor Set',      amount: 3400, category: 'Shopping', type: 'expense', status: 'chargeback', date: daysAgo(120) },
  { name: 'Nykaa - Perfume',              amount: 1900, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(132) },
  { name: 'Flipkart - Bluetooth Speaker', amount: 2600, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(142) },
  { name: 'Amazon - Laptop Bag',          amount: 1800, category: 'Shopping', type: 'expense', status: 'completed',  date: daysAgo(153) },

  // ── UTILITIES ──
  { name: 'JioFiber - April Bill',        amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(5)   },
  { name: 'Electricity Bill - BESCOM',    amount: 2200, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(8)   },
  { name: 'Gas Cylinder - HP',            amount: 940,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(16)  },
  { name: 'Water & Maintenance - Society',amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(20)  },
  { name: 'JioFiber - March Bill',        amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(35)  },
  { name: 'Electricity Bill - BESCOM',    amount: 1900, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(38)  },
  { name: 'Gas Cylinder - Indane',        amount: 920,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(46)  },
  { name: 'Water & Maintenance',          amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(50)  },
  { name: 'JioFiber - February Bill',     amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(65)  },
  { name: 'Electricity Bill - BESCOM',    amount: 2400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(68)  },
  { name: 'Mobile Recharge - Vi',         amount: 599,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(72)  },
  { name: 'Gas Cylinder - HP',            amount: 930,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(76)  },
  { name: 'JioFiber - January Bill',      amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(95)  },
  { name: 'Electricity Bill - BESCOM',    amount: 2100, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(98)  },
  { name: 'Water & Maintenance',          amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(110) },
  { name: 'Mobile Recharge - Airtel',     amount: 699,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(120) },
  { name: 'JioFiber - December Bill',     amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(125) },
  { name: 'Electricity Bill - BESCOM',    amount: 1850, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(128) },
  { name: 'Gas Cylinder - Indane',        amount: 920,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(140) },
  { name: 'Water & Maintenance',          amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(155) },

  // ── ENTERTAINMENT ──
  { name: 'Netflix - Monthly',            amount: 649,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(3)   },
  { name: 'Spotify Premium',              amount: 119,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(3)   },
  { name: 'BookMyShow - Avengers',        amount: 1200, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(10)  },
  { name: 'Prime Video - Annual',         amount: 1499, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(17)  },
  { name: 'PlayStation - Game Purchase',  amount: 2999, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(24)  },
  { name: 'Netflix - Monthly',            amount: 649,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(33)  },
  { name: 'Spotify Premium',              amount: 119,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(33)  },
  { name: 'BookMyShow - IPL Match',       amount: 3500, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(42)  },
  { name: 'Disney+ Hotstar',              amount: 299,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(48)  },
  { name: 'Steam - Game Bundle',          amount: 1800, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(55)  },
  { name: 'Netflix - Monthly',            amount: 649,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(63)  },
  { name: 'Spotify Premium',              amount: 119,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(63)  },
  { name: 'BookMyShow - Comedy Show',     amount: 1800, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(72)  },
  { name: 'YouTube Premium',              amount: 189,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(78)  },
  { name: 'Netflix - Monthly',            amount: 649,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(93)  },
  { name: 'Spotify Premium',              amount: 119,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(93)  },
  { name: 'BookMyShow - Concert',         amount: 4200, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(100) },
  { name: 'PlayStation - DLC Pack',       amount: 1499, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(112) },
  { name: 'Netflix - Monthly',            amount: 649,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(123) },
  { name: 'Spotify Premium',              amount: 119,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(123) },
  { name: 'BookMyShow - Theatre Play',    amount: 1600, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(135) },
  { name: 'Apple TV+ Subscription',       amount: 99,   category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(145) },
  { name: 'Netflix - Monthly',            amount: 649,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(153) },
  { name: 'Spotify Premium',              amount: 119,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(153) },

  // ── EXTRA INCOME ──
  { name: 'Referral Bonus - Zerodha',     amount: 2500, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(16)  },
  { name: 'Cashback - HDFC Credit Card',  amount: 1200, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(29)  },
  { name: 'Bonus - Q1 Performance',       amount: 15000, category: 'Salary',   type: 'income', status: 'completed', date: daysAgo(43)  },
  { name: 'Referral Bonus - Groww',       amount: 500,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(67)  },
  { name: 'Cashback - Amazon Pay',        amount: 380,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(84)  },
  { name: 'Bonus - Project Completion',   amount: 12000, category: 'Salary',   type: 'income', status: 'completed', date: daysAgo(99)  },
  { name: 'Cashback - Swiggy Money',      amount: 220,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(117) },
  { name: 'Referral Bonus - PhonePe',     amount: 750,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(133) },
  { name: 'Bonus - Year End',             amount: 20000, category: 'Salary',   type: 'income', status: 'completed', date: daysAgo(148) },

  // ══════════════════════════════════════════════════════════
  // HISTORICAL DATA — Months 6–12 (days 160–365)
  // ══════════════════════════════════════════════════════════

  // ── SALARIES (months 6–12) ──
  { name: 'Salary - October 2024',   amount: 85000, category: 'Salary', type: 'income', status: 'completed', date: daysAgo(185) },
  { name: 'Salary - September 2024', amount: 85000, category: 'Salary', type: 'income', status: 'completed', date: daysAgo(215) },
  { name: 'Salary - August 2024',    amount: 82000, category: 'Salary', type: 'income', status: 'completed', date: daysAgo(245) },
  { name: 'Salary - July 2024',      amount: 82000, category: 'Salary', type: 'income', status: 'completed', date: daysAgo(275) },
  { name: 'Salary - June 2024',      amount: 80000, category: 'Salary', type: 'income', status: 'completed', date: daysAgo(305) },
  { name: 'Salary - May 2024',       amount: 80000, category: 'Salary', type: 'income', status: 'completed', date: daysAgo(335) },

  // ── FREELANCE (months 6–12) ──
  { name: 'Freelance - E-commerce Redesign',     amount: 30000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(168) },
  { name: 'Freelance - Content Writing Pack',    amount: 7500,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(192) },
  { name: 'Freelance - Node.js API Build',       amount: 25000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(220) },
  { name: 'Freelance - Landing Page Design',     amount: 11000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(248) },
  { name: 'Freelance - React Native App',        amount: 45000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(272) },
  { name: 'Freelance - SEO Audit Report',        amount: 6500,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(298) },
  { name: 'Freelance - Database Optimization',   amount: 18000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(320) },
  { name: 'Freelance - Brand Guidelines',        amount: 14000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(348) },

  // ── INVESTMENT RETURNS (months 6–12) ──
  { name: 'Nifty50 SIP Return',          amount: 11800, category: 'Investment', type: 'income', status: 'completed', date: daysAgo(170) },
  { name: 'Dividend Payout - Infosys',   amount: 2600,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(200) },
  { name: 'Mutual Fund Redemption',      amount: 19000, category: 'Investment', type: 'income', status: 'completed', date: daysAgo(230) },
  { name: 'US Stocks - Dividend',        amount: 4200,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(258) },
  { name: 'Gold ETF Profit',             amount: 6100,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(285) },
  { name: 'FD Maturity - HDFC',          amount: 52000, category: 'Investment', type: 'income', status: 'completed', date: daysAgo(310) },
  { name: 'Nifty50 SIP Return',          amount: 9800,  category: 'Investment', type: 'income', status: 'completed', date: daysAgo(340) },

  // ── FOOD & DINING (months 6–12) ──
  { name: 'BigBasket - Monthly Stock',   amount: 4100, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(162) },
  { name: 'Zomato - Farewell Dinner',    amount: 2600, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(168) },
  { name: 'Swiggy - Weekly Order',       amount: 920,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(175) },
  { name: 'Blinkit - Groceries',         amount: 2800, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(183) },
  { name: 'BigBasket - Monthly Stock',   amount: 4300, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(192) },
  { name: 'Zomato - Weekend Dinner',     amount: 1100, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(200) },
  { name: 'Swiggy - Office Lunch',       amount: 780,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(208) },
  { name: 'Blinkit - Grocery Top-up',    amount: 1400, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(215) },
  { name: 'BigBasket - Monthly Stock',   amount: 4500, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(222) },
  { name: 'Zomato - Family Lunch',       amount: 1800, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(230) },
  { name: 'Swiggy - Late Night',         amount: 450,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(238) },
  { name: 'BigBasket - Monthly Stock',   amount: 4200, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(252) },
  { name: 'Zomato - House Party Order',  amount: 3200, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(258) },
  { name: 'Blinkit - Fruits & Veggies',  amount: 1050, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(265) },
  { name: 'BigBasket - Monthly Stock',   amount: 4600, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(282) },
  { name: 'Swiggy - Pizza Night',        amount: 880,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(290) },
  { name: 'Zomato - Lunch',              amount: 620,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(300) },
  { name: 'BigBasket - Monthly Stock',   amount: 4000, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(312) },
  { name: 'Blinkit - Weekly Groceries',  amount: 2500, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(320) },
  { name: 'Zomato - Team Lunch',         amount: 2200, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(330) },
  { name: 'BigBasket - Monthly Stock',   amount: 3900, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(342) },
  { name: 'Swiggy - Weekend Brunch',     amount: 1300, category: 'Food', type: 'expense', status: 'completed', date: daysAgo(352) },
  { name: 'Zomato - Dinner Delivery',    amount: 720,  category: 'Food', type: 'expense', status: 'completed', date: daysAgo(360) },

  // ── TRANSPORT (months 6–12) ──
  { name: 'Petrol - Honda City',         amount: 3000, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(163) },
  { name: 'Uber - Client Meeting',       amount: 480,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(172) },
  { name: 'Metro Card Recharge',         amount: 500,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(185) },
  { name: 'IndiGo - Hyderabad Flight',   amount: 4600, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(193) },
  { name: 'Petrol - Honda City',         amount: 3100, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(205) },
  { name: 'Ola - Weekend Outing',        amount: 390,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(215) },
  { name: 'IRCTC - Pune Train',          amount: 1100, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(228) },
  { name: 'Petrol - Honda City',         amount: 2800, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(240) },
  { name: 'Metro Card Recharge',         amount: 500,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(255) },
  { name: 'IndiGo - Kolkata Flight',     amount: 5200, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(265) },
  { name: 'Uber - Night Commute',        amount: 520,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(275) },
  { name: 'Petrol - Honda City',         amount: 2950, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(288) },
  { name: 'Rapido - Office Run',         amount: 150,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(298) },
  { name: 'IRCTC - Goa Trip',            amount: 2400, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(310) },
  { name: 'Petrol - Honda City',         amount: 3050, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(320) },
  { name: 'Metro Card Recharge',         amount: 500,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(332) },
  { name: 'Ola - Airport Transfer',      amount: 920,  category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(345) },
  { name: 'IndiGo - Delhi Flight',       amount: 6100, category: 'Transport', type: 'expense', status: 'completed', date: daysAgo(358) },

  // ── SHOPPING (months 6–12) ──
  { name: 'Amazon - Kindle Paperwhite',  amount: 8999, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(165) },
  { name: 'Myntra - Casual Wear',        amount: 3200, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(178) },
  { name: 'Flipkart - Smart Bulbs Pack', amount: 1800, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(195) },
  { name: 'Amazon - Office Chair',       amount: 12500, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(210) },
  { name: 'Myntra - Sports Shoes',       amount: 4600, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(225) },
  { name: 'Flipkart - Air Purifier',     amount: 9800, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(245) },
  { name: 'Amazon - Microwave Oven',     amount: 7500, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(260) },
  { name: 'Myntra - Formal Shirts',      amount: 3800, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(278) },
  { name: 'Amazon - Monitor Stand',      amount: 2200, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(295) },
  { name: 'Flipkart - Water Bottle Set', amount: 1200, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(315) },
  { name: 'Amazon - Wireless Charger',   amount: 1600, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(330) },
  { name: 'Myntra - Winter Collection',  amount: 5400, category: 'Shopping', type: 'expense', status: 'completed', date: daysAgo(350) },

  // ── UTILITIES (months 6–12) ──
  { name: 'JioFiber - October Bill',     amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(185) },
  { name: 'Electricity Bill - BESCOM',   amount: 1950, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(188) },
  { name: 'Gas Cylinder - HP',           amount: 930,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(196) },
  { name: 'Water & Maintenance',         amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(200) },
  { name: 'JioFiber - September Bill',   amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(215) },
  { name: 'Electricity Bill - BESCOM',   amount: 2300, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(218) },
  { name: 'Gas Cylinder - Indane',       amount: 915,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(226) },
  { name: 'Water & Maintenance',         amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(230) },
  { name: 'JioFiber - August Bill',      amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(245) },
  { name: 'Electricity Bill - BESCOM',   amount: 2550, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(248) },
  { name: 'Mobile Recharge - Airtel',    amount: 699,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(255) },
  { name: 'Gas Cylinder - HP',           amount: 925,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(260) },
  { name: 'JioFiber - July Bill',        amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(275) },
  { name: 'Electricity Bill - BESCOM',   amount: 2700, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(278) },
  { name: 'Water & Maintenance',         amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(285) },
  { name: 'JioFiber - June Bill',        amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(305) },
  { name: 'Electricity Bill - BESCOM',   amount: 2150, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(308) },
  { name: 'Gas Cylinder - Indane',       amount: 910,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(316) },
  { name: 'Water & Maintenance',         amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(320) },
  { name: 'Mobile Recharge - Vi',        amount: 599,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(325) },
  { name: 'JioFiber - May Bill',         amount: 999,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(335) },
  { name: 'Electricity Bill - BESCOM',   amount: 1800, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(338) },
  { name: 'Gas Cylinder - HP',           amount: 908,  category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(345) },
  { name: 'Water & Maintenance',         amount: 1400, category: 'Utilities', type: 'expense', status: 'completed', date: daysAgo(352) },

  // ── ENTERTAINMENT (months 6–12) ──
  { name: 'Netflix - Monthly',           amount: 649, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(183) },
  { name: 'Spotify Premium',             amount: 119, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(183) },
  { name: 'BookMyShow - Sports Event',   amount: 2200, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(190) },
  { name: 'Netflix - Monthly',           amount: 649, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(213) },
  { name: 'Spotify Premium',             amount: 119, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(213) },
  { name: 'PlayStation - Game Purchase', amount: 3499, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(222) },
  { name: 'Netflix - Monthly',           amount: 649, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(243) },
  { name: 'Spotify Premium',             amount: 119, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(243) },
  { name: 'BookMyShow - Stand-up Show',  amount: 1500, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(252) },
  { name: 'Disney+ Hotstar',             amount: 299, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(258) },
  { name: 'Netflix - Monthly',           amount: 649, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(273) },
  { name: 'Spotify Premium',             amount: 119, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(273) },
  { name: 'YouTube Premium',             amount: 189, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(278) },
  { name: 'Netflix - Monthly',           amount: 649, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(303) },
  { name: 'Spotify Premium',             amount: 119, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(303) },
  { name: 'BookMyShow - Music Festival', amount: 5000, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(312) },
  { name: 'Steam - Indie Bundle',        amount: 1200, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(318) },
  { name: 'Netflix - Monthly',           amount: 649, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(333) },
  { name: 'Spotify Premium',             amount: 119, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(333) },
  { name: 'Apple TV+ Subscription',      amount: 99,  category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(340) },
  { name: 'Netflix - Monthly',           amount: 649, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(363) },
  { name: 'Spotify Premium',             amount: 119, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(363) },
  { name: 'BookMyShow - New Year Show',  amount: 6500, category: 'Entertainment', type: 'expense', status: 'completed', date: daysAgo(360) },

  // ── EXTRA INCOME (months 6–12) ──
  { name: 'Cashback - Flipkart',         amount: 480,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(170) },
  { name: 'Bonus - Q3 Performance',      amount: 18000, category: 'Salary',   type: 'income', status: 'completed', date: daysAgo(190) },
  { name: 'Referral Bonus - Upstox',     amount: 1000, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(218) },
  { name: 'Cashback - ICICI Card',       amount: 890,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(242) },
  { name: 'Bonus - Mid-Year Review',     amount: 10000, category: 'Salary',   type: 'income', status: 'completed', date: daysAgo(275) },
  { name: 'Cashback - Amazon Pay',       amount: 420,  category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(300) },
  { name: 'Referral Bonus - Zerodha',    amount: 1500, category: 'Freelance', type: 'income', status: 'completed', date: daysAgo(328) },
  { name: 'Bonus - Q2 Performance',      amount: 14000, category: 'Salary',   type: 'income', status: 'completed', date: daysAgo(355) },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const subscriptions = [
  { name: 'Netflix',              amount: 649,   category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: daysFromNow(3),  status: 'active'    },
  { name: 'Spotify',              amount: 119,   category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: daysFromNow(3),  status: 'active'    },
  { name: 'Amazon Prime',         amount: 1499,  category: 'Entertainment', billingCycle: 'yearly',  nextBillingDate: daysFromNow(42), status: 'active'    },
  { name: 'JioFiber',             amount: 999,   category: 'Utilities',     billingCycle: 'monthly', nextBillingDate: daysFromNow(7),  status: 'active'    },
  { name: 'YouTube Premium',      amount: 189,   category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: daysFromNow(15), status: 'paused'    },
  { name: 'Adobe',                amount: 1999,  category: 'Utilities',     billingCycle: 'monthly', nextBillingDate: daysFromNow(20), status: 'active'    },
  { name: 'Disney Hotstar',       amount: 299,   category: 'Entertainment', billingCycle: 'monthly', nextBillingDate: daysFromNow(8),  status: 'cancelled' },
  { name: 'iCloud',               amount: 75,    category: 'Utilities',     billingCycle: 'monthly', nextBillingDate: daysFromNow(12), status: 'active'    },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flovex');
    console.log('✅ Connected to MongoDB');

    await Transaction.deleteMany({});
    console.log('🗑  Cleared existing transactions');

    await Transaction.insertMany(transactions);
    console.log(`🌱 Seeded ${transactions.length} transactions successfully`);

    const income  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    console.log(`   💰 Total income:  ₹${income.toLocaleString('en-IN')}`);
    console.log(`   💸 Total expense: ₹${expense.toLocaleString('en-IN')}`);
    console.log(`   💎 Net savings:   ₹${(income - expense).toLocaleString('en-IN')}`);

    await Subscription.deleteMany({});
    console.log('🗑  Cleared existing subscriptions');

    await Subscription.insertMany(subscriptions);
    console.log(`🌱 Seeded ${subscriptions.length} subscriptions successfully`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
