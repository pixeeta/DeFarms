function formatDecimalNumber(number, decimals) {
    return !isNaN(number) ? number.toFixed(decimals) : '--'; 
}

function formatCurrency(number) {
    return !isNaN(number) ? number.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }): '$--';
}


function sortArrayByProperty(array, propertyName) {
    let sortedArray = [];
    array.forEach(item => sortedArray.push(item));

    sortedArray.sort((a, b) => {
        if (a[propertyName] === null || isNaN(a[propertyName])) {
            return 1;
        } else if ((b[propertyName] != null || isNaN(b[propertyName]))){
            return -1;
        }

        if (a[propertyName] <= b[propertyName]) {
            return 1;
        } else {
            return -1;
        }
    });

    return sortedArray;
}

function sortViewModelsByProperty(viewModels, propertyName) {
    viewModels.sort((a, b) => {
        if (!a.hasData || isNaN(a[propertyName])) {
            return 1;
        } else if ((!b.hasData || isNaN(b[propertyName]))){
            return -1;
        }

        if (a[propertyName] <= b[propertyName]) {
            return 1;
        } else {
            return -1;
        }
    })
}
