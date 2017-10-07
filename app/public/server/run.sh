#!/bin/sh

json-server ./db.json \
  --routes ./routes.json \
  --static ../
