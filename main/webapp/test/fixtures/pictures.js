/**
 * Picture fixtures
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 26.03.23
 **/

import pictures from './picBucket.json';
import PictureInfo from "../../lib/pictureInfo";
import {getPlayer} from "./players";
import {getPropertyByIndex} from "./properties";

let picList = [];

let i = 1;


pictures.forEach(p => {
  p.url       = `https://picsum.photos/id/${i}/1600/1200`;
  p.thumbnail = `https://picsum.photos/id/${i}/360/240`;
  p.teamId    = getPlayer(i % 5).uuid;
  if ((i % 3) > 0) {
    p.propertyId = getPropertyByIndex(i).uuid;
  }
  picList.push(new PictureInfo(p));
  i++;
})


function getPictures() {
  return picList;
}

export {getPictures}
