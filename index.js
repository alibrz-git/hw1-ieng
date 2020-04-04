var express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const isPointInsidePolygon = require('point-in-polygon')

app.use(bodyParser.json())

let polygons = {}

fs.readFile(`${__dirname}/data.json`,function(err,data){
    if(err) throw err;
    polygons  = JSON.parse(data.toString())
})


app.put('/gis/addpolygon',function(req,res,next){
    polygons.features.push(req.body)
    fs.writeFile(`${__dirname}/data.json`,JSON.stringify(polygons),(err)=>{
       if(err) res.sendStatus(500) 
	res.sendStatus(200)
    })
    
})
app.get('/gis/testpoint',function(req,res,next){
    let result = { polygons: [] };
    polygons.features.forEach(element => {
        if (isPointInsidePolygon([req.query.long, req.query.lat], element.geometry.coordinates[0])) {
            result.polygons.push(element.properties.name)
        }
    });
    res.send(result)
})

app.listen(process.env.PORT || 8000,() => console.log(`Example app listening on port ${process.env.PORT || 8000}!`))
