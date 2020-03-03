#!/usr/bin/env bash
sleep 10

curl --user verifishadmin:marineRubicon19! -X PUT http://localhost:5984/_users
curl --user verifishadmin:marineRubicon19! -X PUT http://localhost:5984/_replicator
curl --user verifishadmin:marineRubicon19! -X PUT http://localhost:5984/_global_changes

curl --user verifishadmin:marineRubicon19! -X GET http://localhost:5984/dbname/_design_docs

curl --user verifishadmin:marineRubicon19! -X GET http://localhost:5984/[mydatabase]/_all_docs?include_docs=true > /db.json

GET /dbname/_design_docs
