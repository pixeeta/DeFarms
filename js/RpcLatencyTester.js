function RpcLatencyTester(rpcListJson) {
    let self = this;
    self.rpcList = [];

    self.getRpcLatencyData = async () => {
        return getRpcLatencyData();
    }

    function init() {
        if (rpcListJson) {            
            self.rpcList = rpcListJson;
        }
    }

    init();

    function getRpcLatencyData() {
        const deferred = $.Deferred();
        let promises = [];
        for (let i = 0; i < self.rpcList.length; i++) {
            let promise = testRpcLatency(self.rpcList[i].url);
            promises.push(promise);
        }
                
        let resultArray = [];
        $.when.apply($, promises)
            .done((...results) => {
                for (let i = 0; i < results.length; i++) {
                    resultArray.push({
                        name: self.rpcList[i].name,
                        url: self.rpcList[i].url,
                        latency: results[i],
                        isFastest: false
                    });
                }

                const latencyValues = resultArray.map(r => r.latency).filter(r => r !== null);
                const minValue = Math.min(...latencyValues);                
                const fastestResult = resultArray.filter(r => r.latency === minValue)[0];
                if (fastestResult.latency !== null && fastestResult.latency > 0) {
                    fastestResult.isFastest = true
                } 

                deferred.resolve(resultArray);
            });

        // let fastestResult = resultArray.map(rpc => rpc.latency).min();
        // resultArray.filter(rpc => {
        //     return rpc.latency === fastestResult;
        // })[0].isFastest = true;

        return deferred.promise();
    }

    function testRpcLatency(rpcUrl) { 
        const deferred = $.Deferred();
        try {
            const start = performance.now();  
            const provider = new Web3(new Web3.providers.HttpProvider(rpcUrl))   
            const blockNumber = provider.eth.getBlockNumber().then(data => {
                const end = performance.now();  
                const latency = end - start;
                deferred.resolve(latency);
            })
            .catch(() => {
                deferred.resolve(null);
            }); 
        } catch { 
            deferred.resolve(null);
        }

        return deferred.promise();
    }
}