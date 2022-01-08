function PoolInfoViewModel(poolInfo, isBestApr, poolImpermanentLossSettings) {
    if (poolInfo) {
        this.address = poolInfo.address;
        this.poolId = poolInfo.poolId;
        this.isSingleTokenPool = poolInfo.isSingleTokenPool;
        this.lpTokenType = poolInfo.name;
        this.isStaked = poolInfo.userStaking.isStaked;
        this.hasImpermanentLossInfo = false;
        this.showImpermanentLossSettingsButton = false;

        this.token0Symbol = poolInfo.token0.symbol;
        this.token0FormattedPrice = '$' + formatDecimalNumber(poolInfo.token0.price, 4);
        if (!this.isSingleTokenPool) {
            this.token1Symbol = poolInfo.token1.symbol;
            this.token1FormattedPrice = '$' + formatDecimalNumber(poolInfo.token1.price, 4);
        }    

        this.formattedTvl = formatCurrency(poolInfo.tvl);
        this.formattedStakedTvl = formatCurrency(poolInfo.stakedTvl);
        this.apr = poolInfo.apr;
        this.formattedApr = poolInfo.technicals.isIncentivised ? poolInfo.apr < 1 ?  formatDecimalNumber(poolInfo.apr, 4) + '%' : formatDecimalNumber(poolInfo.apr, 2) + '%' : 'N/A';

        this.poolRewardAllocation = poolInfo.technicals.poolRewardAllocation;
        this.formattedPoolRewardAllocation = !isNaN(this.poolRewardAllocation) ? formatDecimalNumber(this.poolRewardAllocation * 100) + '%' : '--%';

        if (this.isStaked) {
            this.stakedLpTokenAmount = poolInfo.userStaking.stakedLpTokenAmount;
            this.percentOfPool = poolInfo.userStaking.percentOfPool;
            this.stakedToken0Amount = poolInfo.userStaking.stakedToken0Amount;
            this.stakedValue = poolInfo.userStaking.stakedValue;
            
            this.formattedStakedLpTokenAmount = this.stakedLpTokenAmount < 1 ?  formatDecimalNumber(this.stakedLpTokenAmount, 4) : formatDecimalNumber(this.stakedLpTokenAmount, 2);
            this.formattedPercentOfPool = (this.percentOfPool < 1 ?  formatDecimalNumber(this.percentOfPool, 4) : formatDecimalNumber(this.percentOfPool, 2)) + "%";
            this.formattedStakedToken0Amount = this.stakedToken0Amount < 1 ?  formatDecimalNumber(this.stakedToken0Amount, 4) : formatDecimalNumber(this.stakedToken0Amount, 2);
            this.formattedStakedValue =   '$' + (this.stakedValue < 1 ? formatDecimalNumber(this.stakedValue, 4) : formatDecimalNumber(this.stakedValue, 2));
            
            if (!this.isSingleTokenPool) {
                this.stakedToken1Amount = poolInfo.userStaking.stakedToken1Amount;
                this.formattedStakedToken1Amount = this.stakedToken1Amount < 1 ?  formatDecimalNumber(this.stakedToken1Amount, 4) : formatDecimalNumber(this.stakedToken1Amount, 2);
                
                this.showImpermanentLossSettingsButton = true;

                if (poolImpermanentLossSettings) {
                    this.hasImpermanentLossInfo = true;
                    let initialTokenSymbol = poolImpermanentLossSettings.preferredTokenSymbol;
                    let initialTokenAmount = Number(poolImpermanentLossSettings.prefferedTokenInitialAmount);
                    let initialTokenPrice = initialTokenSymbol === this.token0Symbol ? poolInfo.token0.price : poolInfo.token1.price;
                    let stakedTokenAmount = initialTokenSymbol === this.token0Symbol ? this.stakedToken0Amount : this.stakedToken1Amount;
                    let changeInNumberOfTokens = stakedTokenAmount - initialTokenAmount;
                    let currentValueOfTokensIfHeld = initialTokenAmount * 2 * initialTokenPrice;
                    let impermanentNetValueChange = this.stakedValue - currentValueOfTokensIfHeld;
                    this.impermanentLossInfo = {
                        initialTokenSymbol: initialTokenSymbol,
                        initialTokenAmount: initialTokenAmount,
                        formattedIlInitialTokenAmount: initialTokenAmount < 1 ?  formatDecimalNumber(initialTokenAmount, 4) : formatDecimalNumber(initialTokenAmount, 2),
                        formattedChangeInNumberOfTokens: !isNaN(changeInNumberOfTokens) ? formatDecimalNumber(changeInNumberOfTokens, 2) : '--',
                        formattedCurrentValueOfTokensIfHeld: !isNaN(currentValueOfTokensIfHeld) ? '$' + formatDecimalNumber(currentValueOfTokensIfHeld, 2) : '$--',
                        formattedImpermanentNetValueChange: !isNaN(impermanentNetValueChange) ? '$' + formatDecimalNumber(Math.abs(impermanentNetValueChange), 2) : '$--',
                        impermanentNetValueChangeSign: !isNaN(impermanentNetValueChange) ? impermanentNetValueChange > 0 ? '+' : '-' : ''
                    };
                }
            } 
        }
        
        this.isBestAprClass = isBestApr ? 'pool-is-best-apr' : '';
        this.isStakedClass = this.isStaked ? 'pool-is-staked' : '';
        this.isIncentivisedClass = poolInfo.technicals.isIncentivised ? '' : 'pool-is-not-incentivised';
        this.hasImpermanentLossInfoClass = this.hasImpermanentLossInfo ? 'pool-has-impermanent-loss-info' : '';
        
        this.hasData = true;
    } else {
        this.hasData = false;
    }
}