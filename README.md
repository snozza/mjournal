# mjournal

Minimalist journal aiming to be one journal for all of your technical projects. Geared toward sparse and clean UI and categorization through labels.

(grid background image stolen from http://bulletjournal.com)

# Development Prerequisites

- some docker host. Local VM recommended (Vagrant + VirtualBox)
- PostgreSQL database (Vagrant + VirtualBox recommended)

# How to prepare a release

- get new changes in the `develop` branch committed and ready to go
- ensure your working directory is in a clean git state
- run `./bin/go release_candidate <major|minor|patch>`
  - This will pull origin/master into develop
  - This will do an `npm version` to increment the version and tag the commit
- Move on to the build and test instructions below

# How to build and deploy code

- do a docker build
  - `./bin/go build`
- If that succeeds, note the build ID it prints out such as `Successfully built a2452ff73a95`
- tag that for testing on stage
  - `./bin/go tag_stage <build_id_from_above>`
- restart stage with that docker image
  - `./bin/go deploy_stage`
- Test in a browser
  - `open 'http://dbs:9090'`
- If the app is working, tag for prod and push
  - This requires an SSH tunnel from your docker host to the production docker registry
  - `ssh -t dbs ssh -N -L 5000:localhost:5000 yoyo.peterlyons.com`
  - on your development system, run `./bin/go tush_production <build_id_from_above>`
- pull the image from the prod registry to the prod docker
  - `ssh -t docker.peterlyons.com docker pull docker.peterlyons.com:5000/mjournal:production`
- restart the app in production
  - `./bin/go deploy_production`

# Docker Setup

- Use public postgres docker image
  - container running with name `mjournal_db`
  - data lives in `/var/local/mjournal_db` on the docker host
  - volumes used to mount that into the container for both DB data and logs
  - Backups live at `/var/local/mjournal_db_backups` on the docker host
- mjournal node/express app runs in a container linked to the db container
  - data lives in `/var/local/mjournal` for logs and configuration

# Production Deployment Setup

- digital ocean vm: yoyo.peterlyons.com
- docker and nginx running directly on yoyo
- postgresql and mjournal running in docker containers
