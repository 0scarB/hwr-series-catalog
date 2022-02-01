# Series- Catalog

Mit dieser Webentwicklung wollen wir einen Katalog für gewisse Serien schaffen. 
In diesem soll der Nutzer Serien, sowie einige Informationen zu diesen und eine 
Bewertung der einzelnen Serien finden. Zur Navigation wird eine Suchleiste 
implementiert, durch welche ein Sprung zu der jeweiligen Serie möglich gemacht 
werden soll. Auf der Startseite sind zu den Serien jeweils ein Bild, sowie die
Anzahl der Staffel und Folgen der Serie, sowie bereits eine Bewertung der Serie. 
Jede Serie verweist dann auf eine eigene Seite, auf der die Serie weiter 
beschrieben wird. Hier finden sich dann der jeweilige Trailer der Serie, sowie 
eine kurze Beschreibung der Serie und eine ausführlichere Bewertung.

## Flexbox-Layout

Sowohl das `body`-Element als auch alle `anchor`-Elemente in die `index.html` 
Datei sind Flexboxes. Die `anchor`-Elemente zeigen ihren Inhalt horizontal an, bis 
der Platz nicht ausreicht und der Inhalt wird dann vertikal "gewrappt".

## Grid-Layout

Die Seiten zu den einzelnen Serien werden mittels eines Grid-Layouts dargestellt. 
Das Grid hat sechs Spalten. Das Layout ändert sich responsiv mittels Media-Queries 
bei Seitenbreiten von 650 und 800 Pixel.