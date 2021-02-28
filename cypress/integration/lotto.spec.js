/// <reference types="cypress" />
import Lotto from "../../src/js/models/Lotto.js";
import { ALERT_MESSAGES } from '../../src/js/utils/constants/alert.js';
import { LOTTO_SETTINGS } from '../../src/js/utils/constants/settings.js';
import { DOM_CLASSES } from '../../src/js/utils/constants/dom.js';
import { getRandomNumber } from '../../src/js/utils/util.js';

const COMMON_INPUT = {
  MONEY: 5000,
  MANUAL_AMOUNT: 2,
}
const NOT_INTEGER_MONEY_INPUT = 5000.5;
const SHORT_MONEY_INPUT = 500;

context('로또 UI 테스트', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500');
  });

  describe('금액 입력 부분', () => {
    it('로또 구입 금액을 입력하면, 금액에 해당하는 로또를 발급한다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      cy.get(`.${DOM_CLASSES.LOTTO_TICKET}`).should('have.length', Math.floor(COMMON_INPUT.MONEY / LOTTO_SETTINGS.LOTTO_PRICE));
    });
    it('입력받는 구입 금액은 최소 1000원 이상이어야 한다.', () => {
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, SHORT_MONEY_INPUT, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`)
        .then(() => {
          expect(alertStub.getCall(0)).to.be.calledWith(ALERT_MESSAGES.UNDER_MIN_PRICE);
        });
    });
    it('입력받는 구입 금액은 정수여야한다.', () => {
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, NOT_INTEGER_MONEY_INPUT, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      testChildNodeExist(`.${DOM_CLASSES.LOTTO_CONTAINER}`);
    });
    it('로또 구입 금액을 입력받으면, 구입 버튼이 비활성화된다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      cy.get(`.${DOM_CLASSES.MONEY_FORM_SUBMIT}`).should('be.disabled');
    });
  });

  describe('수동 and 자동 구입 갯수 입력 부분', () => {
    it('소비자는 수동 구매를 할 수 있어야 한다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      typeAndClick(`.${DOM_CLASSES.LOTTO_AMOUNT_INPUT_MANUAL}`, COMMON_INPUT.MANUAL_AMOUNT, `.${DOM_CLASSES.LOTTO_AMOUNT_SUBMIT_MANUAL}`);
      // TODO 로또 번호 수동으로 넣어야함
      typeNumbers(
        [
          1, 2, 3, 4, 5, 6,
          7, 8, 9, 10, 11, 12
        ],
        `.${DOM_CLASSES.MANUAL_SELECT_FORM}`);
      testChildNodeExist(`.${DOM_CLASSES.LOTTO_CONTAINER}`);
    });
  });

  describe('구입한 로또 확인 부분', () => {
    it('번호 보기 토글 버튼을 클릭하면, 복권 번호가 화면에 표시된다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);

      cy.get(`.${DOM_CLASSES.LOTTO_SWITCH}`).click();
      cy.get(`.${DOM_CLASSES.LOTTO_TICKET_NUMBER}`).should('have.length', Math.floor(COMMON_INPUT.MONEY / LOTTO_SETTINGS.LOTTO_PRICE));
      cy.get(`.${DOM_CLASSES.LOTTO_TICKET_NUMBER}`).should('be.visible');
      cy.get(`.${DOM_CLASSES.LOTTO_SWITCH}`).click();
      cy.get(`.${DOM_CLASSES.LOTTO_TICKET_NUMBER}`).should('not.be.visible');
    });
  });

  describe('로또 당첨 번호 입력 부분', () => {
    it('로또 구입 금액을 입력 받으면 결과 확인 UI를 띄운다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      cy.get(`.${DOM_CLASSES.RESULT_INPUT_CONTAINER}`).should('be.visible');
    });
    it('결과 확인하기 버튼을 누르면 당첨 통계 모달창을 띄운다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      typeResultNumbers([1, 2, 3, 4, 5, 6, 7]);

      cy.get(`.${DOM_CLASSES.RESULT_INPUT_SUBMIT}`).click();
      cy.get(`.${DOM_CLASSES.MODAL}`).should("be.visible");
    })
    it('당첨 번호와 보너스 번호를 입력하여야만 결과를 확인할 수 있다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      cy.get(`.${DOM_CLASSES.MODAL}`).should('not.be.visible');
    });
    it('당첨 번호와 보너스 번호는 중복이 있어서는 안된다.', () => {
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      typeResultNumbers([5, 5, 5, 5, 5, 5], 5);

      cy.get(`.${DOM_CLASSES.RESULT_INPUT_SUBMIT}`).click().then(() => {
        expect(alertStub.getCall(0)).to.be.calledWith(ALERT_MESSAGES.DUPLICATED_NUMBERS_EXIST);
      });
    });
    it('당첨 번호와 보너스 번호는 1~45의 숫자를 가진다.', () => {
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      typeResultNumbers([55, 65, 75, 85, 95, 105], 115);

      cy.get(`.${DOM_CLASSES.MODAL}`).should('not.be.visible');
    });
  });

  describe('당첨 통계 부분', () => {
    it('당첨 통계에서는 당첨 갯수와 수익률을 확인할 수 있다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      typeResultNumbers([1, 2, 3, 4, 5, 6], 7);

      cy.get(`.${DOM_CLASSES.RESULT_INPUT_SUBMIT}`).click();
      cy.get(`.${DOM_CLASSES.MODAL_WINNING_COUNT}`).then(($$winningCounts) => {
        [...$$winningCounts].forEach(($winningCount) => {
          const text = $winningCount.innerText;
          expect(/[0-9]개/g.test(text)).to.be.true;
        });
      });
      cy.get(`.${DOM_CLASSES.MODAL_EARNING_RATE}`).then(($earningRate) => {
        const text = $earningRate[0].innerText;
        expect(/[0-9]\%/g.test(text)).to.be.true;
      })
    });
    it('X 표시를 누르면 모달 창을 닫을 수 있다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      typeResultNumbers([1, 2, 3, 4, 5, 6], 7);

      cy.get(`.${DOM_CLASSES.RESULT_INPUT_SUBMIT}`).click();
      cy.get(`.${DOM_CLASSES.MODAL_CLOSE}`).click();
      cy.get(`.${DOM_CLASSES.MODAL}`).should("not.be.visible");
    });
    it('다시 시작하기 버튼을 누르면 초기화 되서 다시 구매를 시작할 수 있다.', () => {
      typeAndClick(`.${DOM_CLASSES.MONEY_FORM_INPUT}`, COMMON_INPUT.MONEY, `.${DOM_CLASSES.MONEY_FORM_SUBMIT}`);
      typeResultNumbers([1, 2, 3, 4, 5, 6], 7);

      cy.get(`.${DOM_CLASSES.RESULT_INPUT_SUBMIT}`).click();
      cy.get(`.${DOM_CLASSES.MODAL_RESTART_BUTTON}`).click();
      cy.get(`.${DOM_CLASSES.MODAL}`).should("not.be.visible");

      testChildNodeExist(`.${DOM_CLASSES.LOTTO_CONTAINER}`);
      testChildNodeExist(`.${DOM_CLASSES.RESULT_INPUT_CONTAINER}`);
    });
  });
});

context('로또 기능 테스트', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500');
  });
  it('로또 자동 구매 시, 1 ~ 45 중 중복 없이 무작위 6개 숫자를 뽑아 저장한다.', () => {
    const lotto = new Lotto();
    lotto.setNumbersByAuto();
    const amountTestSet = new Set(lotto.getNumbers());
    expect(amountTestSet.size === LOTTO_SETTINGS.LOTTO_NUMBER_SIZE).to.equal(true);

    for (let i = LOTTO_SETTINGS.MIN_LOTTO_NUMBER; i <= LOTTO_SETTINGS.MAX_LOTTO_NUMBER; i++) {
      const randomNumber = getRandomNumber(LOTTO_SETTINGS.MIN_LOTTO_NUMBER, i);
      expect(randomNumber >= LOTTO_SETTINGS.MIN_LOTTO_NUMBER && randomNumber <= i).to.equal(true);
    }
  });
});

function typeAndClick(inputSelector, inputString, submitSelector) {
  cy.get(inputSelector).type(inputString);
  return cy.get(submitSelector).click();
}

function typeResultNumbers([...lottoNumbers], bonusNumber) {
  const LENGTH_LIMIT = LOTTO_SETTINGS.LOTTO_NUMBER_SIZE + LOTTO_SETTINGS.BONUS_NUMBER_SIZE;
  if (inputs.length !== LENGTH_LIMIT) {
    cy.log(`로또 숫자 갯수가 ${LENGTH_LIMIT}개가 아닙니다.`);
    return;
  }
  typeNumbers(lottoNumbers, DOM_CLASSES.RESULT_INPUT_FORM);
  cy.get(`.${DOM_CLASSES.RESULT_BONUS_NUMBER}`).type(bonusNumber);
}

function typeNumbers(inputs, targetSelector) {
  cy.get(`${targetSelector} input`).then($$numbers => {
    [...$$numbers].forEach(($number, idx) => {
      if (!inputs[idx]) {
        cy.log("input tag에 비해 입력 데이터가 부족합니다");
        return;
      }
      cy.get($number).type(inputs[idx]);
    })
  });
}

function testChildNodeExist(selector) {
  cy.get(selector).then(element => {
    expect(element[0].hasChildNodes()).to.be.false;
  });
}

