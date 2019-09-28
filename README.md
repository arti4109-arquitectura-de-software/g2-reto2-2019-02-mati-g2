# g2-reto2-2019-02-mati-g2
g2-reto2-2019-02-mati-g2 created by GitHub Classroom

Para ejecutar el codigo del experimento de dsiponibilidad Caja Offline es necesario cambiar el end point ubicado en el archivo application.js por una url de un servicio valida.

Este end point se puede encontrar en la funcion con el nombre portToServer

function postToServer(item) {
    $.ajax({
        type: "POST",
        url: "https://localhost:44313/api/Values",
