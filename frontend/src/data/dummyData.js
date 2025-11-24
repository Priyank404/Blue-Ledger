// Dummy data for the portfolio tracker

export const stocks = [
  { id: 1, name: 'TCS', symbol: 'TCS', sector: 'Technology', currentPrice: 3500 },
  { id: 2, name: 'Infosys', symbol: 'INFY', sector: 'Technology', currentPrice: 1450 },
  { id: 3, name: 'Reliance', symbol: 'RELIANCE', sector: 'Energy', currentPrice: 2450 },
  { id: 4, name: 'HDFC Bank', symbol: 'HDFCBANK', sector: 'Finance', currentPrice: 1650 },
  { id: 5, name: 'ICICI Bank', symbol: 'ICICIBANK', sector: 'Finance', currentPrice: 950 },
  { id: 6, name: 'Wipro', symbol: 'WIPOR', sector: 'Technology', currentPrice: 850 },
  { id: 7, name: 'Tata Motors', symbol: 'TATAMOTORS', sector: 'Automotive', currentPrice: 650 },
  { id: 8, name: 'Bharti Airtel', symbol: 'BHARTIARTL', sector: 'Telecom', currentPrice: 1150 },
  { id: 9, name: 'Bharti Airtel', symbol: 'SJVN', sector: 'Telecom', currentPrice: 12 }
]

export const transactions = [
  { id: 1, date: '2024-01-15', name: 'TCS', type: 'Buy', qty: 3, price: 500, totalAmt: 1500 },
  { id: 2, date: '2024-01-20', name: 'Infosys', type: 'Buy', qty: 5, price: 1400, totalAmt: 7000 },
  { id: 3, date: '2024-02-01', name: 'Reliance', type: 'Buy', qty: 2, price: 2400, totalAmt: 4800 },
  { id: 4, date: '2024-02-10', name: 'HDFC Bank', type: 'Buy', qty: 4, price: 1600, totalAmt: 6400 },
  { id: 5, date: '2024-02-15', name: 'TCS', type: 'Sell', qty: 1, price: 3600, totalAmt: 3600 },
  { id: 6, date: '2024-02-20', name: 'ICICI Bank', type: 'Buy', qty: 6, price: 950, totalAmt: 5700 },
  { id: 7, date: '2024-03-01', name: 'Wipro', type: 'Buy', qty: 10, price: 450, totalAmt: 4500 },
  { id: 8, date: '2024-03-05', name: 'Bharti Airtel', type: 'Buy', qty: 5, price: 1150, totalAmt: 5750 },
]

export const portfolioData = {
  totalInvestment: 350000,
  totalGainLoss: 10000,
  numberOfStocks: 8,
  portfolioValue: 360000,
}

export const portfolioValueHistory = [
  { date: '2024-01-01', value: 320000 },
  { date: '2024-01-15', value: 325000 },
  { date: '2024-01-20', value: 332000 },
  { date: '2024-02-01', value: 340000 },
  { date: '2024-02-10', value: 345000 },
  { date: '2024-02-15', value: 348000 },
  { date: '2024-02-20', value: 352000 },
  { date: '2024-03-01', value: 355000 },
  { date: '2024-03-05', value: 360000 },
]

export const assetAllocation = [
  { name: 'Stocks', value: 70, color: '#3b82f6' },
  { name: 'Mutual Funds', value: 20, color: '#8b5cf6' },
  { name: 'Crypto', value: 10, color: '#f59e0b' },
]

export const sectorAllocation = [
  { sector: 'Technology', value: 40, color: '#3b82f6' },
  { sector: 'Finance', value: 30, color: '#10b981' },
  { sector: 'Energy', value: 15, color: '#f59e0b' },
  { sector: 'Automotive', value: 10, color: '#ef4444' },
  { sector: 'Telecom', value: 5, color: '#8b5cf6' },
]

export const stockHoldings = [
  { id: 1, name: 'TCS', qty: 2, avgPrice: 500, currentPrice: 3500, totalInvest: 1000, currentValue: 7000, pnl: 6000 },
  { id: 2, name: 'Infosys', qty: 5, avgPrice: 1400, currentPrice: 1450, totalInvest: 7000, currentValue: 7250, pnl: 250 },
  { id: 3, name: 'Reliance', qty: 2, avgPrice: 2400, currentPrice: 2450, totalInvest: 4800, currentValue: 4900, pnl: 100 },
  { id: 4, name: 'HDFC Bank', qty: 4, avgPrice: 1600, currentPrice: 1650, totalInvest: 6400, currentValue: 6600, pnl: 200 },
  { id: 5, name: 'ICICI Bank', qty: 6, avgPrice: 950, currentPrice: 950, totalInvest: 5700, currentValue: 5700, pnl: 0 },
  { id: 6, name: 'WIPOR', qty: 10, avgPrice: 450, currentPrice: 450, totalInvest: 4500, currentValue: 4500, pnl: 0 },
  { id: 7, name: 'Bharti Airtel', qty: 5, avgPrice: 1150, currentPrice: 1150, totalInvest: 5750, currentValue: 5750, pnl: 0 },
  { id: 8, name: 'SJVN', qty: 5, avgPrice: 1150, currentPrice: 12, totalInvest: 5750, currentValue: 5750, pnl: 0 },

]

export const stockPriceHistory = {
  'TCS': [
    { date: '2024-01-01', price: 3200 },
    { date: '2024-01-15', price: 3300 },
    { date: '2024-02-01', price: 3400 },
    { date: '2024-02-15', price: 3500 },
    { date: '2024-03-01', price: 3450 },
    { date: '2024-03-15', price: 3500 },
  ],
  'Infosys': [
    { date: '2024-01-01', price: 1350 },
    { date: '2024-01-15', price: 1380 },
    { date: '2024-02-01', price: 1420 },
    { date: '2024-02-15', price: 1440 },
    { date: '2024-03-01', price: 1450 },
    { date: '2024-03-15', price: 1450 },
  ],
  'Reliance': [
    { date: '2024-01-01', price: 2300 },
    { date: '2024-01-15', price: 2350 },
    { date: '2024-02-01', price: 2400 },
    { date: '2024-02-15', price: 2430 },
    { date: '2024-03-01', price: 2450 },
    { date: '2024-03-15', price: 2450 },
  ],
}
