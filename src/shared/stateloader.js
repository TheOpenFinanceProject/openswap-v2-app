import { mapGetters, mapActions } from 'vuex';
import { ethers } from "ethers";
const { SDK } = require("openswap-app-sdk");
const { pools } = require("@/store/modules/farm/pools.js");
const { toBech32 } = require('@harmony-js/crypto');




 export default {
 	mounted: function () {

 	},
 	computed: {
    ...mapGetters('user', ['getIsScrolled', 'getColorTheme']),
    ...mapGetters("addressConstants", ["hMULTICALL", "hRPC", "oSWAPCHEF", 'getValContracts']),
    

 	},
 	methods: {
 		...mapActions('exchange/swapper', ['setAllPairs']),
      ...mapActions('farm/farmData', ['setFarms']),
      ...mapActions("farm/farmData", ["setSoloDataState", "setCustomDataState", "setFarms", "setUserStakeTotal", "setTVL", "setPendingRewards", "setOnePrice", "setOpenXPrice", "setTotalAPR", "setStakedAPR", "setUserAPR", "setUserRewardsPerWeek","setValidatorData","setOpenXBurnt","setOpenXSupply","setSoloFarms", "setTokensState", "setOneBalance"]),
      ...mapActions('user', ['setIsScrolled', 'setTheme']),
      ...mapActions('wallet', ['switchWalletType']),
     ...mapGetters('wallet', ['getUserAddress', 'getChainID']),


 		UpdateState: async function() {

         const CHAIN_ID = 1666600000
      const Multicall = "0x34b415f4d3b332515e66f70595ace1dcf36254c5"
      console.log(pools)
      var farmPairAddr = []
      for(var x in pools[CHAIN_ID].pools){
        farmPairAddr.push(pools[CHAIN_ID].pools[x].pairaddress)
      }
      var farms = []
      var soloFarms = []

      for(var i in pools[CHAIN_ID].pools){
        farms.push(pools[CHAIN_ID].pools[i])
      }

      var validatorAddresses = []
      var soloFarmsArr = []
      var chainID = this.getChainID()
      const valContracts = this.getValContracts(chainID)
      for(let r in valContracts){
        validatorAddresses.push(valContracts[r].validator)
      }

      for(var w in pools[CHAIN_ID].SoloPools){
        soloFarmsArr.push(pools[CHAIN_ID].SoloPools[w])
      }


      var sdk  = new SDK(CHAIN_ID, Multicall)
      
      let pairs = await sdk.initPairsWithAddresses(farmPairAddr) 
      
      let supply = await sdk.getOpenXSupply()
      let burnt = await sdk.getOpenXBurnt()

      var sdk2  = new SDK(CHAIN_ID, Multicall)
      let allPairs = await sdk2.initPairs()
      this.setAllPairs(allPairs)

      this.setOpenXBurnt(burnt)
      this.setOpenXSupply(supply)
      await sdk.initFarms(farms)
      let oneBalance =  ethers.utils.formatUnits(await this.getOneBalance(), 18).toString();

      this.setOneBalance(oneBalance)

      let onePrice = await sdk.getOnePrice()
      let oxPrice = await sdk.getOpenXPrice()

      this.setOnePrice(onePrice)
      this.setOpenXPrice(oxPrice)


 
      this.enabled = localStorage.getItem("oSwap\_enable_farms") === 'true' ? true : false;
  

          const user = this.getUserAddress()
          let vals = await sdk.initValidator(validatorAddresses, toBech32(user), valContracts)
          this.setValidatorData(vals)
          await sdk.initBalances(user)
     
          var tokens = await sdk.getTokens()
          farms = await sdk.getFarms()
          soloFarms = await sdk.getSoloFarmData(soloFarmsArr ,user)

          const TVL = sdk.getTVL()
          const pending = sdk.getTotalPending()
          const userStake = sdk.getTotalStakedUser()

         const userRewardsPerWeek = sdk.getTotalRewardsPerWeek()
         const avgAPRTotal = sdk.getTotalAPR()
         const avgAPRUser =  sdk.getStakedAPR()
          

          this.setUserRewardsPerWeek(userRewardsPerWeek)
          this.setUserAPR(avgAPRUser)
          this.setStakedAPR(avgAPRTotal)
          this.setTVL(TVL)
          this.setPendingRewards(pending)
          this.setUserStakeTotal(userStake)
          this.setTokensState(tokens)

          const sortedFarms = this.sortFarms(farms);
          this.setFarms(sortedFarms)
          this.setSoloFarms(soloFarms)


 		},
      sortFarms(farms) {
        return farms.sort((elemA,elemB) =>{
              if (elemA?.category < elemB?.category) {
                  return -1
              } 
              if (elemA?.category > elemB?.category) {
                  return 1
              } 
              return 0
          })
      },
      getOneBalance: async function(){
         const provider = this.getProvider()
         const userAddress = this.getUserAddress();
          const balance = await provider.getBalance(userAddress);

       // let formatedbalance = ethers.utils.formatUnits(balance.toString(), 18).toString();
        

        return balance;
      },
      getProvider: function(call){
       let networks = {
      1:{
        rpcURL: '',
        provider: '',
        name: ""
      },
      56: {
        rpcURL: '',
        provider: '',
        name: ""
      },
      1666600000: {
        rpcURL: 'https://harmony-0-rpc.gateway.pokt.network',
        provider: new ethers.providers.JsonRpcProvider('https://harmony-0-rpc.gateway.pokt.network', {chainId: 1666600000, name: "Harmony Mainnet S0"}),
        name: "mainnet harmony"
      },
      1666700000: {
        rpcURL: 'https://api.s0.b.hmny.io',
        provider: new ethers.providers.JsonRpcProvider('https://api.s0.b.hmny.io', {chainId: 1666700000, name: "Harmony Testnet S0"}),
        name: "testnet"
      },
      1337:{
        rpcURL: 'http://localhost:7545',
        provider: new ethers.providers.JsonRpcProvider('http://localhost:7545', {chainId: 1337, name: "local"}),
        name: "local"
      }
    }

        const provider = networks[1666600000].provider
        return provider
      
    },
 		
    }
};