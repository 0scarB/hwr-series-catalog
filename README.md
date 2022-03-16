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

## Docker

### Produktion

Das Docker-Produktions-Image und Container können durch die folgenden Kommandos 
im Repo-Root-Ordner gebaut und ausgeführt werden:

```bash
docker build --no-cache . -t series_catalog
docker run -p 8080:8080 --name series_catalog series_catalog
```

Alternativ, kann in eine Bash-Umgebung mit Node/npm Installation `npm run docker` 
ausgeführt werden.

Die Webseite sollte unter http://127.0.0.1:8080 abrufbar sein.

### Development

Das Docker-Development-Image und Container können durch die folgenden Kommandos
im Repo-Root-Ordner gebaut und ausgeführt werden:

```bash
docker build --no-cache . -t series_catalog -f dev.Dockerfile
docker run -v $(pwd)/:/app/ -p 8080:8080 --name series_catalog series_catalog
```
(`$(pwd)` ggf. durch den absoluten Pfad zum Repo-Root-Ordner ersetzen.)

Alternativ, kann in eine Bash-Umgebung mit Node/npm Installation `npm run docker-dev`
ausgeführt werden.

Die Webseite sollte unter http://127.0.0.1:8080 abrufbar sein.