'use strict'

const fs      = require('fs')
let   config  = require('../config.json')
var   expa    = require('./node-gis-wrapper')(config.expa.username, config.expa.password);
const MC_ID   = config.expa.mc_id

let committees    = {}
let universities  = {}
let lcs           = []
let colleges      = []

// Carga los comités desde EXPA y los guarda en el archivo universities.JSON
// TODO: La idea es que se utilice este mismo programa para sincronizar
// las universidades de EXPA con Podio

async function getUniversities(){
  await expa.get(`/committees/${MC_ID}/lc_alignments`)
  .then( response => {
    console.log(response);
    response.map( university => {
      universities[university.keywords] = university.lc.full_name
      committees[university.lc.full_name] = university.lc.id
    })

    let str = JSON.stringify(universities, null, 2)
    fs.writeFile("universities.json", str,
                  err => { if (err) console.log(err) })

    str = JSON.stringify(committees, null, 2)
    fs.writeFile("committees.json", str,
                  err => { if (err) console.log(err) })
  }).catch(console.log)

}
getUniversities()
