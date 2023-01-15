# Changelog Ferropoly Spiel

# v3.1.8
* Sync mit Editor: Überarbeitung Logins, Link auf auth.ferropoly.ch

# v3.1.7
* Sync mit Editor: Kein weiteres Login mit Dropbox oder Twitter
* Dependency Updates (sehr viele!), diese sind bewusst fix (Vue 3):
```
Package               Current Wanted  Latest Package Type    URL                                                                        
bootstrap             4.6.0   4.6.0   5.2.3  devDependencies https://getbootstrap.com/                                                  
vue                   2.6.14  2.6.14  3.2.45 devDependencies https://github.com/vuejs/core/tree/main/packages/vue#readme                
vue-loader            15.10.1 15.10.1 17.0.1 devDependencies https://github.com/vuejs/vue-loader                                        
vue-router            3.5.3   3.5.3   4.1.6  devDependencies https://github.com/vuejs/router#readme                                     
vue-template-compiler 2.6.14  2.6.14  2.7.14 devDependencies https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#readme
vuex                  3.6.2   3.6.2   4.1.0  devDependencies https://github.com/vuejs/vuex#readme       
```

# v3.1.6 11.7.22
* Bugfix: Hilfe URL in Reception / Preisliste gefixt
* Textliche anpassungen

# v3.1.5 26.6.22
* Bugfix: Problem mit Authentisierung (Auth-Token) behoben bzw. zusätzlich abgesichert #20

## v3.1.4 24.6.22
* Bugfix: GPS Daten werden erst übertragen, wenn der Socket offe ist #17

## v3.1.3 23.6.22
* Bugfix: Bei unbekannter Position in Checkin wird Zentrum der Spielkarte ausgewählt
* Bugfix: GPS Range Kreis in Checkin wird nachgeführt #16
* Bugfix: Farben in Vermögensverlauf entsprechen Team-Farben #19
* Bugfix: GPS Daten wurden nur einmal beim Start des Check-in übertragen #17
* Dependency updates

## v3.1.2 22.6.22
* Microsoft login Bugfix
* Verbesserungen Login/Security (AuthToken)
* Bugfix Reception: Parkplatzgewinn wurde nicht richtig angezeigt (#15)
* Summary: schönere Karte (wie Reception, #18)

## v3.1.1 6.6.22
* Bugfix: Logout in Passport benötigt neu Callback

## v3.1.0 5.6.22
* Erste RC-Version Spiel V3
* In Reisekarte werden die verkauften Orte optisch hervorgehoben
* Summary App überarbeitet (div. Stores angepasst)
* Saldo bei Chance/Kanzlei wird angezeigt
* Check-In: GPS Daten werden explizit nur während Spieldauer übertragen
* Anmeldung verbessert
* Info bei fehlerhaftem Login
* Dependency Updates

## v3.0.1 10.4.2022
Zwischenversion für Deployment-Test
* Neues Titelbild "Paradeplatz"
* Persistente Logs: die letzten verpassten Einträge werden beim Laden der Reception angezeigt
* Komplette Überarbeitung Check-In App (App für Spieler)
  * Live-Ticker verbessert: beim Laden der Seite werden die letzten Meldungen dargestellt
  * Telefonnummer Zentrale ist verfügbar
  * Mietwert (aktuell und bei Vollausbau) wird dargestellt
  * Spielregeln integriert
  * Mehr Details im Kontobuch

## v3.0.0 19.3.2022
Erste Version 3.0:
* Komplettes Redesign Front-End: Umstellung User Interface von Angular.js auf vue.js
  * Spielauswertung Admin:
    * Echtzeitinfo SBB entfernt (Wechsel API, fraglich ob das nochmals kommt)
    * Statistik-Graphen überabeitet mit mehr Informationen
    * Spielregeln direkt aus dem Spiel aufrufen
    * Karte der Landestopgraphie kann verwendet werden
    * Kontobuch mit detaillierten Funktionen und auf mehrere Seiten gesplittet
  * Login mit Microsoft Account
  * Neue Bilder für Login und Startseite
  * Bower entfernt
  
## v2.4.2 19.12.2020
* Webpack Downgrade

## v2.4.1 19.12.2020
* API für Abfragen aus Webseite und Überwachung #41
* Kein Summary Email bei Demo Games
* Dependency Updates

## v.2.4.0 16.4.20
* Email mit Summary wird Mitternacht nach Spiel an alle Teams versendet
* Summary: neu Log mit wesentlichen Ereignissen des Spiels
* Dependency Updates
* Game-Log neu

## v2.3.7 8.10.21
* Bugfix RSS Feed zvv110
* Bugfix wenn Team-Kontakt aus Anmeldung fehlt

## 2.3.6 1.10.21
* Bugfix Rangliste Download

## 2.3.5 8.8.21
* Minify Reception schlug aus irgend einem Grund fehl

## 2.3.4 8.8.21
* Bugfix RSS Feed SBB

## 2.3.3 16.4.20
* Google Plus von Authentisierung entfernt

## v2.3.2 25.7.19
* Weniger Logausgaben
* Bugfix Avatar Darstellung

## v2.3.1 16.6.19
* Update und Bugfixes Datenbankzugriff

## v2.3.0 15.6.19
* Mobile Version für Spieler aktualisiert (keine Features, nur Fixes)
* Dependency Updates
* Verschiedene Bugfixes und Verbesserungen

## v2.2.4 8.9.18
Danke Soraya (Pfadi Wulp) für das ausgiebige Testen, diese Bugs wurden Dank Dir behoben:
* Bugfix: Bei zu langen Spielnamen stürzte das Programm beim Laden der Preisliste ab
* Bugfix: Bei zu langen Teamnamen stürzte das Program beim Laden ab

## v2.2.3 5.8.18
* Bugfix Verkehrsinfo: Filter und Ostwind-Infos #67

## v2.2.2 4.8.18
* Bugfix (Workaround) für Inputfelder mit numerischen Werten (angular.js)

## v2.2.1 22.7.18

* Keine Neuregistrierung über Benutzername/Passwort mehr möglich (alte Logins funktionieren weiterhin), Google- oder Facebook-Account ist für Login notwendig.
* Zahlreiche Libraries auf neusten Stand gebracht
* Preisliste kann auch dargestellt werden, bevor sie finalisiert wurde (für Spieler)
* Darstellung interne Fehler verbessert
* Darstellung Fehlerseiten verbessert
* Kompatibilität mit node.js V8
* Bugfix: Anmeldung funktionierte nicht
* Bugfix: Darstellung "Hausbau möglich" für Spieler
