function FarmInfoViewModel(farmInfo, farmAccordionSettings, isVisible, impermanentLossSettings, containerOnly) {
    if (containerOnly) {
        this.name = farmInfo.name;
        this.farmId = farmInfo.farmId;
        this.masterchefAddress = farmInfo.chefContract;
        this.isVisible = isVisible;
    } else {
        if (farmInfo) {
            this.name = farmInfo.name;
            this.farmId = farmInfo.farmId;
            this.masterchefAddress = farmInfo.masterchefAddress;
            this.nameWithouthSpaces = this.name.replace(/ /g, '');
            this.isVisible = isVisible;
            
            this.isCollapsed = false;
            if (farmAccordionSettings){
                this.accordionSettings = farmAccordionSettings[this.farmId];
                if (this.accordionSettings) {
                    this.isCollapsed = this.accordionSettings.isCollapsed;
                }
            }
    
            this.pools = [];
            farmInfo.pools.forEach(pool => {
                let isBestApr = false;
                if (pool?.address === farmInfo.bestAprPool?.address) {
                    isBestApr = true;
                } 
                
                const poolImpermanentLossSettings = impermanentLossSettings ? impermanentLossSettings[pool.poolId] : null;
                const newPoolInfoViewModel = new PoolInfoViewModel(pool, isBestApr, poolImpermanentLossSettings)
                if (newPoolInfoViewModel.hasData) {
                    this.pools.push(newPoolInfoViewModel);
                }
            });
    
            this.totalMasterchefPools = farmInfo.pools.length;
            this.poolsWithoutData = farmInfo.pools.filter(p => p === null).length;
            this.totalDiscoveredPools = this.totalMasterchefPools - this.poolsWithoutData;
            this.incentivisedPools = farmInfo.pools.filter(p => p?.technicals.isIncentivised).length;
    
            this.farmBestApr = farmInfo.bestAprPool ? farmInfo.bestAprPool.apr : null;
            this.formattedFarmBestApr = farmInfo.bestAprPool ? formatDecimalNumber(farmInfo.bestAprPool.apr, 2) + '%' : '--%';
            this.numberOfStakedPools = this.pools.filter(p => p?.isStaked).length;
    
            this.hasData = true;
        } else {
            this.hasData = false;
        }
    }
}