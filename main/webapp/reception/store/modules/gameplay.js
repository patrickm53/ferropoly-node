/**
 * Gameplay module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {DateTime} from 'luxon';

const {getGameplayField, updateGameplayField} = createHelpers({
  getterType  : 'getGameplayField',
  mutationType: 'updateGameplayField'
});

const gameplay = {
  state    : () => ({
    gamename  : '',
    owner     : {
      organisatorName : '',
      organisation    : '',
      organisatorEmail: '',
      organisatorPhone: ''
    },
    scheduling: {
      gameDate   : DateTime.now(),
      gameStartTs: '1980-01-01T08:00:00',
      gameEndTs  : '1980-01-01T09:00:00',
      gameStart  : '',
      gameEnd    : '',
      deleteTs   : ''
    },
    gameParams: {
      startCapital             : 0,
      interestInterval         : 0,
      interest                 : 0,
      interestCyclesAtEndOfGame: 0,
      debtInterest             : 0,
      housePrices              : 0,
      properties               : {
        lowestPrice               : 0,
        highestPrice              : 0,
        numberOfPriceLevels       : 0,
        numberOfPropertiesPerGroup: 0
      },
      rentFactors              : {
        noHouse             : 0,
        oneHouse            : 0,
        twoHouses           : 0,
        threeHouses         : 0,
        fourHouses          : 0,
        hotel               : 0,
        allPropertiesOfGroup: 0
      },
      chancellery              : {
        minLottery      : 0,
        maxLottery      : 0,
        maxJackpotSize  : 0,
        probabilityWin  : 0,
        probabilityLoose: 0
      }
    },
    log       : {
      created   : '',
      lastEdited: ''
    },
    internal  : {
      gameId: '',
      map   : '',
      owner : ''
    },
    joining   : {
      possibleUntil: '',
      infotext     : ''
    },
    mobile    : {
      level: 0
    },
    rules     : {
      text: ''
    }
  }),
  getters  : {
    getGameplayField,
    gameIsActive: (state) => {
      let now = DateTime.now();
      if (now < DateTime.fromISO(state.scheduling.gameStartTs)) {
        console.log('Game ont started yet', now, state.scheduling.gameStartTs);
        return false;
      }
      if (now > DateTime.fromISO(state.scheduling.gameEndTs)) {
        console.log('Game over', now, state.scheduling.gameEndTs);
        return false;
      }
      return true;
    }
  },
  mutations: {
    updateGameplayField
  }

};

export default gameplay;
