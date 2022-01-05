function TokenPriceProvider() {
    let self = this;

    self.getHarmonyPrices = async function() {
        return getHarmonyPrices();
    }
    
    function init() {
        return self;
    }

    init();

    async function getHarmonyPrices() {
        const idPrices = await lookUpPrices(HARMONYTOKENS.map(x => x.id));
        const prices = {}
        for (const bt of HARMONYTOKENS)
            if (idPrices[bt.id])
                prices[bt.contract] = { usd: idPrices[bt.id].usd, symbol: bt.symbol };
        return prices;
    }

    async function lookUpPrices(id_array) {
        const prices = {}
        for (const id_chunk of chunk(id_array, 50)) {
            let ids = id_chunk.join('%2C')
            let res = await $.ajax({
                url: 'https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd',
                type: 'GET',
            })
            for (const [key, v] of Object.entries(res)) {
                if (v.usd) prices[key] = v;
            }
        }
        return prices
    }
    
    function chunk(arr, n) {
        return arr.length ? [arr.slice(0, n), ...chunk(arr.slice(n), n)] : []
    }
}