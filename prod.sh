#!/usr/bin/env bash
sleep 10

curl --user verifishadmin:marineRubicon19! -X PUT http://localhost:5984/_users
curl --user verifishadmin:marineRubicon19! -X PUT http://localhost:5984/_replicator
curl --user verifishadmin:marineRubicon19! -X PUT http://localhost:5984/_global_changes
