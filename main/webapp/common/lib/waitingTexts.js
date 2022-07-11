/**
 * Texts during waiting for something. Not usefull, not informative but at least some distraction
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 26.07.21
 **/

import {random} from 'lodash';

const waitingTexts = [
  'Stelle die Weichen...',
  'Das Einfahrtsignal ist noch rot!',
  'Der Zug hat Verspätung',
  'Wegen Glatteis verspätet sich der Bus',
  'Suche gerade die beste Verbindung',
  'Der Lokführer kommt gleich',
  'Die Lokführerin steigt gleich ein',
  'Moment, wir enteisen gerade die Weichen',
  'Bin gleich da!',
  'Einen Moment bitte...',
  'Komme subito!',
  'Das geht gleich vorbei',
  'Momäntli...',
  'Schon fast soweit, komme gleich',
  'Jaaa, bin gleich da!',
  'Etwas Geduld bitte, komme sofort',
  'Suche gerade mein Billet',
  'Häsch mer en Stutz?',
  'Wegen einer Pfadigruppe verzögert sich die Abfahrt dieses Zuges',
  'Bitte Trittbrett freigeben!'
];

function getWaitingText() {
  return waitingTexts[random(0, waitingTexts.length - 1)];
}

export default getWaitingText;
