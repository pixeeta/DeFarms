function PoolInfoViewModel(poolInfo, isBestApr, poolImpermanentLossSettings) {
    let self = this;

    self.updateImpermanentLossInfo = function(poolImpermanentLossSettings) {
        if (poolImpermanentLossSettings) {
            self.hasImpermanentLossInfo = true;
            let initialTokenSymbol = poolImpermanentLossSettings.preferredTokenSymbol;
            let initialTokenAmount = Number(poolImpermanentLossSettings.prefferedTokenInitialAmount);
            let initialTokenPrice = initialTokenSymbol === self.token0Symbol ? poolInfo.token0.price : poolInfo.token1.price;
            let stakedTokenAmount = initialTokenSymbol === self.token0Symbol ? self.stakedToken0Amount : self.stakedToken1Amount;
            let changeInNumberOfTokens = stakedTokenAmount - initialTokenAmount;
            let currentValueOfTokensIfHeld = initialTokenAmount * 2 * initialTokenPrice;
            let impermanentNetValueChange = self.stakedValue - currentValueOfTokensIfHeld;
            self.impermanentLossInfo = {
                initialTokenSymbol: initialTokenSymbol,
                initialTokenAmount: initialTokenAmount,
                formattedIlInitialTokenAmount: initialTokenAmount < 1 ?  formatDecimalNumber(initialTokenAmount, 4) : formatDecimalNumber(initialTokenAmount, 2),
                formattedChangeInNumberOfTokens: !isNaN(changeInNumberOfTokens) ? formatDecimalNumber(changeInNumberOfTokens, 2) : '--',
                formattedCurrentValueOfTokensIfHeld: !isNaN(currentValueOfTokensIfHeld) ? '$' + formatDecimalNumber(currentValueOfTokensIfHeld, 2) : '$--',
                formattedImpermanentNetValueChange: !isNaN(impermanentNetValueChange) ? '$' + formatDecimalNumber(Math.abs(impermanentNetValueChange), 2) : '$--',
                impermanentNetValueChangeSign: !isNaN(impermanentNetValueChange) ? impermanentNetValueChange > 0 ? '+' : '-' : ''
            };            
        } else {
            self.hasImpermanentLossInfo = false;
            self.impermanentLossInfo = null;
        }
    }
    
    if (poolInfo) {
        self.address = poolInfo.address;
        self.poolId = poolInfo.poolId;
        self.isSingleTokenPool = poolInfo.isSingleTokenPool;
        self.lpTokenType = poolInfo.name;
        self.isStaked = poolInfo.userStaking.isStaked;
        self.hasImpermanentLossInfo = false;
        self.showImpermanentLossSettingsButton = false;

        self.token0Symbol = poolInfo.token0.symbol;
        self.token0FormattedPrice = '$' + formatDecimalNumber(poolInfo.token0.price, 4);
        if (!self.isSingleTokenPool) {
            self.token1Symbol = poolInfo.token1.symbol;
            self.token1FormattedPrice = '$' + formatDecimalNumber(poolInfo.token1.price, 4);
        }    

        self.formattedTvl = formatCurrency(poolInfo.tvl);
        self.formattedStakedTvl = formatCurrency(poolInfo.stakedTvl);
        self.apr = poolInfo.apr;
        self.formattedApr = poolInfo.technicals.isIncentivised ? poolInfo.apr < 1 ?  formatDecimalNumber(poolInfo.apr, 4) + '%' : formatDecimalNumber(poolInfo.apr, 2) + '%' : 'N/A';

        self.poolRewardAllocation = poolInfo.technicals.poolRewardAllocation;
        self.formattedPoolRewardAllocation = !isNaN(self.poolRewardAllocation) ? formatDecimalNumber(self.poolRewardAllocation * 100) + '%' : '--%';

        if (self.isStaked) {
            self.stakedLpTokenAmount = poolInfo.userStaking.stakedLpTokenAmount;
            self.percentOfPool = poolInfo.userStaking.percentOfPool;
            self.stakedToken0Amount = poolInfo.userStaking.stakedToken0Amount;
            self.stakedValue = poolInfo.userStaking.stakedValue;
            
            self.formattedStakedLpTokenAmount = self.stakedLpTokenAmount < 1 ?  formatDecimalNumber(self.stakedLpTokenAmount, 4) : formatDecimalNumber(self.stakedLpTokenAmount, 2);
            self.formattedPercentOfPool = (self.percentOfPool < 1 ?  formatDecimalNumber(self.percentOfPool, 4) : formatDecimalNumber(self.percentOfPool, 2)) + "%";
            self.formattedStakedToken0Amount = self.stakedToken0Amount < 1 ?  formatDecimalNumber(self.stakedToken0Amount, 4) : formatDecimalNumber(self.stakedToken0Amount, 2);
            self.formattedStakedValue =   '$' + (self.stakedValue < 1 ? formatDecimalNumber(self.stakedValue, 4) : formatDecimalNumber(self.stakedValue, 2));
            
            if (!self.isSingleTokenPool) {
                self.stakedToken1Amount = poolInfo.userStaking.stakedToken1Amount;
                self.formattedStakedToken1Amount = self.stakedToken1Amount < 1 ?  formatDecimalNumber(self.stakedToken1Amount, 4) : formatDecimalNumber(self.stakedToken1Amount, 2);
                
                self.showImpermanentLossSettingsButton = true;
                self.updateImpermanentLossInfo(poolImpermanentLossSettings);
            } 
        }
        
        self.isBestAprClass = isBestApr ? 'pool-is-best-apr' : '';
        self.isStakedClass = self.isStaked ? 'pool-is-staked' : '';
        self.isIncentivisedClass = poolInfo.technicals.isIncentivised ? '' : 'pool-is-not-incentivised';
        self.hasImpermanentLossInfoClass = self.hasImpermanentLossInfo ? 'pool-has-impermanent-loss-info' : '';
        
        self.hasData = true;
    } else {
        self.hasData = false;
    }
}