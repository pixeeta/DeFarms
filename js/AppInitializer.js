function AppInitializer() {
    let self = this;

    self.initializeBlockchainConnection = async () => {
        return initializeBlockchainConnection();
    }

    self.initializeHeaderControls = () => {
        return initializeHeaderControls();
    }

    async function initializeBlockchainConnection() {
        // const networkApiUrl = 'https://rpc.mtv.ac';
        const networkApiUrl = 'https://api.s0.t.hmny.io';
        let connectionInitialized = false;
        if (window.ethereum) {
            const walletAccounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (walletAccounts !== undefined && walletAccounts.length > 0) {
                console.log('Found previously cached wallet, initializing user wallet connection');
                connectionInitialized = await initializeWallet(networkApiUrl);
                if (connectionInitialized) {
                    $('#connect-wallet-button').attr('disabled', true);
                    $('#connect-wallet-button').addClass('disabled');
                    $('#connect-wallet-button').html('Wallet connected');
                }
            } else {
                storageProvider.setUserWalletAddress('');
            }
        }
    
        if (!connectionInitialized) {
            console.log('Cached wallet not found, initializing connection to: ', networkApiUrl);
            web3 = new Web3(new Web3.providers.HttpProvider(networkApiUrl))
        }
    }
    
    async function initializeWallet(networkApiUrl) {
        let isInitialized = false;
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userWalletIsConnected = true;
                storageProvider.setUserWalletAddress(accounts[0]);
                isInitialized = true;
            } catch {
                web3 = new Web3(new Web3.providers.HttpProvider(networkApiUrl))
                isInitialized = true;
            }
    
            window.ethereum.on("accountsChanged", async (accounts) => {
                if (accounts === undefined || accounts.length === 0) {
                    storageProvider.setUserWalletAddress('');
                }
                window.location.reload()
            });
          
            window.ethereum.on("chainChanged", async (networkId) => {
                window.location.reload()
            });
        } else {
            web3 = new Web3(new Web3.providers.HttpProvider(networkApiUrl))
            isInitialized = true;
        }
    
        return isInitialized;
    }
    
    function initializeHeaderControls() {
        if(storageProvider.getShowStakedOnlyPoolsSetting()) {
            $('#content-container').toggleClass('show-staked-only-pools');
            $('#show-staked-only-button').toggleClass('active');
        }
    
        if(storageProvider.getShowNonIncentivizedPoolsSetting()) {
            $('#content-container').toggleClass('show-non-incentivised-pools');
            $('#show-non-incentivised-pools-button').addClass('active');
        }
    
        if(storageProvider.getDarkModeSetting()) {
            $('body').toggleClass('dark-mode');
            $('#toggle-dark-mode-button').toggleClass('active');
        }
    
        $('#sort-farms-by-apr-button').click(async (ele) => {
            let target = ele.target;
            let isActive = false;
            if ($(target).hasClass('active')) {
                isActive = true;
            } 		
            sortFarmsByApr(isActive);
            $(target).toggleClass('active');
        });
    
        $('#sort-pools-by-apr-button').click(async (ele) => {
            let target = ele.target;
            let isActive = false;
            if ($(target).hasClass('active')) {
                isActive = true;
            } 				
            sortPoolsByApr(isActive);		
            $(target).toggleClass('active');
        });
    
        $('#show-staked-only-button').click(ele => {
            let target = ele.target;
            let isActive = false;
            if ($(target).hasClass('active')) {
                isActive = true;
            } 		
            toggleShowStakedOnlyPools(isActive);	
            $(target).toggleClass('active');
        });
    
        $('#show-non-incentivised-pools-button').click(ele => {
            let target = ele.target;
            let isActive = false;
            if ($(target).hasClass('active')) {
                isActive = true;
            } 		
            toggleShowNonIncentivisedPools(isActive);	
            $(target).toggleClass('active');
        });
        
        $('#toggle-dark-mode-button').click((ele) => {
            toggleDarkMode();
        });
    
        $('#connect-wallet-button').click(async () => {
            let isInitialized = await initializeWallet();
            if (isInitialized) {
                window.location.reload();
            }
        });
    }
}
