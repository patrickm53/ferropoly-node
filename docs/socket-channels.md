#Ferropoly socket.io channels

Messages over the socket.io channels are sent to

* All Admins
* A specific team
* A specific player team and the Admins
* All participants of a game (admins and players)

The structure is always the same, an object having a command code (property 'cmd') which identifies a request or event and an 
additional payload.

## Chanels for the admins

These channels are used for data being exclusive for the admins, no need to the players that they know about.

### admin-teamAccount

Events server -> client

* onTransaction: a transaction was made on a teams account


### admin-propertyAccount

Events server -> client

* propertyBought: a property was bought
* buildingBuilt: a house or hotel was built

Requests client -> server

* getAccountStatement: returns all properties of a team. HAS TO BE MOVED TO A REST ROUTE


## Channels for specific teams

* checkinStore: actions for the checkin-store
* player-position: position of a team player

### Geolocation: player-position

Events client -> server

* positionUpdate: new position available
* positionError: error while retrieving position


## Channels for specific team and Admin

None so far

## Channels for all participants

* checkinStore: actions for the checkin-store
