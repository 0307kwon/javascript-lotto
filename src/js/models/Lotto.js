import { LOTTO_SETTINGS } from '../utils/constants/settings.js';
import { getRandomNumber } from '../utils/util.js';

export default class Lotto {
  constructor() {
    this._numbers = [];
  }

  getNumbers() {
    return [...this._numbers];
  }

  setNumbers([...inputNumbers]) {
    if (inputNumbers.length !== LOTTO_SETTINGS.LOTTO_NUMBER_SIZE) {
      return;
    }
    this._numbers = inputNumbers;
  }

  setNumbersByAuto() {
    const numberSet = new Set();
    while (numberSet.size < LOTTO_SETTINGS.LOTTO_NUMBER_SIZE) {
      numberSet.add(getRandomNumber(LOTTO_SETTINGS.MIN_LOTTO_NUMBER, LOTTO_SETTINGS.MAX_LOTTO_NUMBER));
    }
    this._numbers = [...numberSet];
  }
}
