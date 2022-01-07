function FarmInfoProvider() {
    const self = this;

    self.getFarmInfo = async function(masterchefJson) {
        return getFarmInfo(masterchefJson);
    }

    function init() {
        return self;
    }

    init();
    
    async function getFarmInfo(masterchefJson) {
        const masterchefProvider = new MasterchefProvider(masterchefJson);

        let poolLength = await masterchefProvider.callFunction('poolLength', null, masterchefJson.poolLength);
        let poolIds = [];	
        for (let i = 0; i < poolLength; i++) {
            poolIds.push(i);
        }

        const blockNumber = await web3.eth.getBlockNumber();
        let multiplier = await masterchefProvider.callFunction('getMultiplier', [blockNumber, blockNumber+1], 1);
        let rewardsAmount = await masterchefProvider.callFunction(masterchefJson.blockRewardFunctionName, null, null);
        let rewardsPerWeek = null;
        if (rewardsAmount) {
            if (masterchefJson.areRewardsReleasedPerSecond) {
                rewardsPerWeek = rewardsAmount / 1e18 * 604800;
            } else {
                rewardsPerWeek = rewardsAmount / 1e18 * multiplier * 604800 / 2;
            }
        } else {
            console.log("couldn't access reward per block method of the masterchef");
        }
              

        const rewardTokenAddress = await masterchefProvider.callFunction(masterchefJson.rewardTokenFunctionName, null, masterchefJson.rewardTokenAddress);
        const totalAllocationPoints = await masterchefProvider.callFunction('totalAllocPoint', null, null);  
        const poolInfoProvider = new PoolInfoProvider({
            masterchefProvider: masterchefProvider, 
            masterchefContractAddress: masterchefJson.chefContract, 
            rewardTokenAddress: rewardTokenAddress, 
            totalAllocationPoints: Number(totalAllocationPoints),
            rewardsPerWeek: Number(rewardsPerWeek),
            lpTokenPropertyName: masterchefJson.lpTokenPropertyName || null
        });
        
        let farmPools = [];
        await Promise.all(poolIds.map(async (poolId) => {	
            try {
                farmPools[poolId] = await poolInfoProvider.getPoolInfo(poolId);
            }	
            catch {
                farmPools[poolId] = null;
            }
        }));
        
        let totalStakedValue = 0;
        let totalDiscoveredTvl = 0;
        farmPools.forEach((pool) => {
            if (pool) {
                if (!isNaN(pool.userStaking.stakedValue)) {
                    totalStakedValue += pool.userStaking.stakedValue;
                }

                if (!isNaN(pool.tvl)) {
                    totalDiscoveredTvl += pool.tvl;
                }
            }
        });

        const farmInfo = {
            name: masterchefJson.farm,
            farmId: masterchefJson.farmId,
            masterchefAddress: masterchefJson.chefContract,
            pools: farmPools,
            rewardToken: {
                symbol: prices[rewardTokenAddress]?.symbol,
                address: rewardTokenAddress,
                price: prices[rewardTokenAddress]?.usd,
            },
            bestAprPool: getBestAprPool(farmPools),
            totalStakedValue: totalStakedValue,
            totalDiscoveredTvl: totalDiscoveredTvl
        };

        return farmInfo;
    }
    
    function getBestAprPool(pools) {
        let bestAprPool = null; 
        if (pools && pools.length > 0) {            
            pools.forEach((pool) => {
                if (pool && !isNaN(pool.apr)) {
                    if (bestAprPool) {
                        if (pool.apr > bestAprPool.apr) {
                            bestAprPool = pool;
                        } 
                    } else {
                        bestAprPool = pool;
                    }
                }   
            });
        }

        if (bestAprPool) {
            if (bestAprPool.apr === null || isNaN(bestAprPool.apr)) {                
                bestAprPool = null;
            }
        }

        return bestAprPool;
    }
}
