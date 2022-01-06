const DEBUG = false;
const DEBUG_FARM_ID = 37;
const DEBUG_POOL_ID = null;

let appInitializer = null;
let web3 = null;
let storageProvider = null;
let userWalletIsConnected = false;
let prices = [];
let farmInfoViewModels = [];

window.addEventListener('load', async function () {
	storageProvider = new StorageProvider();
	appInitializer = new AppInitializer();
	await appInitializer.initializeBlockchainConnection();
	appInitializer.initializeHeaderControls();

	main();
})

async function main() {	
	const networkId = await web3.eth.net.getId();
	if (networkId === NETWORKS.HARMONY_S0.chainIdInt) {
		const tokenPriceProvider = new TokenPriceProvider();
		prices = await tokenPriceProvider.getHarmonyPrices();

		const farmInfoProvider = new FarmInfoProvider();
		const masterChefContractList = HARMONY_MASTERCHEF_CONTRACT_LIST;
		const farmAccordionSettings = storageProvider.getFarmAccordionSettings();
		if (DEBUG) {		
			const farmInfo = await farmInfoProvider.getFarmInfo(masterChefContractList[DEBUG_FARM_ID]);
			console.log(farmInfo);
			renderFarmInfo(farmInfo, farmAccordionSettings)
		} else {
			for (let i = 0; i < masterChefContractList.length; i++) {
				let farmInfo = null;
				if (masterChefContractList[i].isSupported) {
					farmInfo = await farmInfoProvider.getFarmInfo(masterChefContractList[i]);
				} else {
					farmInfo = {
						name: masterChefContractList[i].farm,
						farmId: masterChefContractList[i].farmId,
						masterchefAddress: masterChefContractList[i].chefContract,
						isSupported: false,
						pools: []
					}
				}

				console.log(farmInfo);
				renderFarmInfo(farmInfo, farmAccordionSettings);
			}
		}
	} else {
		$('#wrong-network-message').show();
	}

	enableHeaderButtons();
}

function renderFarmInfo(farmInfo, i, farmAccordionSettings) {
	const templateHtml = $('#farm-info-template').html();
	const compiledTemplate = Handlebars.compile(templateHtml);
	const farmInfoViewModel = new FarmInfoViewModel(farmInfo, i, farmAccordionSettings);
	if (farmInfoViewModel.hasData) {
		farmInfoViewModels.push(farmInfoViewModel);
		$('#content-container').append(compiledTemplate(farmInfoViewModel));	
		const farmHtml = $('#content-container').find('.farm-info').last();
		bindFarmInfoControls(farmHtml);
	}
}

function bindFarmInfoControls(farmHtml) {
	$(farmHtml).find('.fold-farm-info-button').on('click', (ele) => {
		const target = ele.target;
		const farmInfoId = $(target).data('farm-info-id');
		const caret = $(target).find('.caret');
		if ($(caret).hasClass('up')) {
			$(caret).removeClass('up');
			$(caret).addClass('down');
			hideFarmInfo(farmInfoId);
			storageProvider.setAccordionSettingsForFarm(farmInfoId, true);
		} else {
			$(caret).removeClass('down');
			$(caret).addClass('up');			
			showFarmInfo(farmInfoId);
			storageProvider.setAccordionSettingsForFarm(farmInfoId, false);
		}
	});
}

function hideFarmInfo(farmInfoId) {
	$('#' + farmInfoId).find('.farm-pools-container').css('max-height', 0);
}

function showFarmInfo(farmInfoId) {
	$('#' + farmInfoId).find('.farm-pools-container').css('max-height', '20000px');
}
