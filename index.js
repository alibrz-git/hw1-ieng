var express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const isPointInsidePolygon = require('point-in-polygon')
var GJV = require("geojson-validation");
var log = require('debug-logger')('index');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});



app.use(bodyParser.json())

let polygons = {}

fs.readFile(`${__dirname}/data.json`, function (err, data) {
    if (err) throw err;
    polygons = JSON.parse(data.toString())
})

app.get('/gis/testpoint', function (req, res, next) {
    let result = { polygons: [] };
    if(!req.query.lat || !req.query.long){
		logger.error('Its log, log, log');
        res.status(400).send("lat and long are required")
    }
    polygons.features.forEach(element => {
        if (isPointInsidePolygon([req.query.long, req.query.lat], element.geometry.coordinates[0])) {
            result.polygons.push(element.properties.name)
        }
    });
    res.send(result)
})

app.put('/gis/addpolygon', function (req, res, next) {
    log.debug(`put request to /gis/polygon with req body : ${req.body}`)
    GJV.isFeature(req.body, function (valid, errs) {
        if (!valid) {
            log.debug(`${errs} \nreq body : ${req.body}`)
            res.status(500).send(errs)
        } else {
            polygons.features.push(req.body)
            fs.writeFile(`${__dirname}/data.json`, JSON.stringify(polygons), (err) => {
                if (err) res.sendStatus(500)
                log.debug(`polygon saved successfully : ${req.body}`)
                res.sendStatus(200)
            })
        }
    });
})


app.listen(process.env.PORT || 8000, () => console.log(`Example app listening on port ${process.env.PORT || 8000}!`))
