export const convertToINR = (amount, currency = 'INR') => {
  const rates = {
    USD: 83.0,
    EUR: 90.0,
    GBP: 105.0,
    JPY: 0.55,
    CAD: 61.0,
    AUD: 55.0,
    INR: 1.0
  };
  
  const upperCurrency = (currency || 'INR').toUpperCase();
  const rate = rates[upperCurrency] || 1.0;
  return amount * rate;
};
