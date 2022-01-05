function formatDecimalNumber(number, decimals) {
    return !isNaN(number) ? number.toFixed(decimals) : '--'; 
}

function formatCurrency(number) {
    return !isNaN(number) ? number.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }): '$--';
}