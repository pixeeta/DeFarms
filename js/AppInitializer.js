function AppInitializer() {
    let self = this;

    self.initializeBlockchainConnection = async (networkApiUrl) => {
        return initializeBlockchainConnection(networkApiUrl);
    }

    self.initializeHeaderControls = () => {
        return initializeHeaderControls();
    }

    self.initializeSecondaryHeaderControls = () => {
        return initializeSecondaryHeaderControls();
    }

    self.initializeFarmFilterDropdown = (listItems) => {
        return initializeFarmFilterDropdown(listItems);
    }

    self.initializeWalletAddressInput = () => {
        
    }

    async function initializeBlockchainConnection(networkApiUrl, useWalletIfAvailable) {
        // networkApiUrl = 'https://rpc.mtv.ac';
        // networkApiUrl = 'https://api.s0.t.hmny.io';
        // networkApiUrl = HARMONY_RPCS[1].url;
        let connectionInitialized = false;
        if (useWalletIfAvailable) {
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

        $("#filter-farms-dropdown-list.checkbox-menu").on("change", "input[type='checkbox']", function(ele) {
            $(this).closest("li").toggleClass("active", this.checked);
            const farmId = $(ele.target).data('farm-id')
            const isVisible = this.checked;
            storageProvider.setVisibilitySettingsForFarm(farmId, isVisible);

            if(isVisible) {
                $('.farm-info[data-farm-id=' + farmId + ']').show();
                let $loadingSpinner = $('.farm-info[data-farm-id=' + farmId + ']').find('.loading-spinner-container')
                if ($loadingSpinner.length > 0) {
                    $loadingSpinner.hide();
                    $('.farm-info[data-farm-id=' + farmId + ']').find('.refresh-page-message').show();
                }
            } else {
                $('.farm-info[data-farm-id=' + farmId + ']').hide();
            }
        });
        
        $(document).on('click', '.allow-focus', function (e) {
            e.stopPropagation();
        });
    }

    function initializeSecondaryHeaderControls() {	
        let storedWalletAddress = storageProvider.getUserWalletAddress();
        if (storedWalletAddress && storedWalletAddress !== '' && storedWalletAddress !== 'null') {
            $('#wallet-address-input').val(storedWalletAddress);
            userWalletIsConnected = true;
            loadFarms();
        }
        
        $('#clear-wallet-address-button').on('click', () => {
            $('#wallet-address-input').val(null);
            storageProvider.setUserWalletAddress(null);
            userWalletIsConnected = false;
        });
    
        $('#load-farms-button').on('click', () => {
            let walletAddressInputValue = $('#wallet-address-input').val();
            if (walletAddressInputValue && walletAddressInputValue !== '') {
                storageProvider.setUserWalletAddress(walletAddressInputValue);
                userWalletIsConnected = true;
            }
    
            loadFarms();
        });
    }

    function initializeFarmFilterDropdown(listItems) {
        const templateHtml = $('#dropdown-items-template').html();
        const compiledTemplate = Handlebars.compile(templateHtml);
        
        let dropdownViewModels = [];
        for (const farmId in listItems) {
            dropdownViewModels.push({
               farmId: farmId,
               isVisible: listItems[farmId].isVisible,
               name: listItems[farmId].name
            });
        }
    
        $('#filter-farms-dropdown-list').empty();
        $('#filter-farms-dropdown-list').append(compiledTemplate(dropdownViewModels));
    }
}
