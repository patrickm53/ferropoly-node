/**
 * TEMPORARY playground for all market relevant actions. Check the name
 *
 * Created by kc on 20.04.15.
 */
'use strict';

/**
 * Buy a property or at least try to
 * 1) Success: property goes to the team, Money flow:
 *    team->property-bank
 * 2) Already sold: pay taxes, Money:
 *    team->property->owner
 *
 * @param team
 * @param property
 * @param callback
 */
function buyProperty(team, property, callback) {
}

/**
 * Build a house for a specific property
 * Money: team->property->bank
 *
 * @param team
 * @param property
 * @param callback
 */
function buildHouse(team, property, callback) {
}

/**
 * Build houses for all porperties of a team
 * Same money flow as buildHouse
 * @param team
 * @param callback
 */
function buildHouses(team, callback) {
}


/**
 * Pay Interest for a specific team
 * Money: bank->team
 * @param team
 * @param callback
 */
function payInterest(team, callback) {
}

/**
 * Pay Interest, this is the fix value
 * Money: bank->team
 * @param callback
 */
function payInterests(callback) {
}

/**
 * Pays the rent for one specific team
 * Money: bank->propertIES->team
 * @param team
 * @param callback
 */
function payRent(team, callback) {
}

/**
 * Pays the rents for all teams
 * Same moneyflow as payRent
 * @param callback
 */
function payRents(callback) {
}

/**
 * Chancellery, every time a team calls (be sure that they are on the line,
 * no false alarms: only call the function when really editing the team).
 *
 * You can loose or win a random amount
 * 
 * Money: team->chancellery   (negative amount)
 *        bank->team          (positive amount)
 *
 * @param team
 * @param callback
 */
function chancellery(team, callback) {
}

/**
 * Chancellery Game: either you win or you loose. Usually only loosing money
 * is taken into account, rising the value of the chancellery
 *
 * Money: team->chancellery   (negative amount)
 *        bank->team          (positive amount)
 *
 * @param team
 * @param amount
 * @param callback
 */
function chancelleryGame(team, amount, callback) {
}

/**
 * The winner takes it all: getting the complete money of the chancellery
 *
 * Money: chancellery->team
 * @param team
 * @param callback
 */
function getChancelleryJackpot(team, callback) {
}

/**
 * A very exceptional case, but might be needed: increasing or decreasing
 * the account of a team due to an error, penalty or what so ever
 *
 * @param team
 * @param amount
 * @param reason
 * @param callback
 */
function manipulateTeamAccount(team, amount, reason, callback) {
}


module.exports = {};
