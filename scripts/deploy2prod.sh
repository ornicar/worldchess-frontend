#!/usr/bin/env bash

SSH_HOST=52.204.125.97
SSH_USER=ubuntu
DEPLOY_PATH_1=/opt/webapps/worldchess/static
DOWNLOAD_PATH=/home/ubuntu/deploys/worldchess-fe/${TIMESTAMP}

cd ..
pwd

ng b -prod --aot=false
cd dist/ && tar -cvjf ../dist-prod.tar.bz2 . && cd -

ssh ${SSH_USER}@${SSH_HOST} "mkdir -p $DOWNLOAD_PATH"

rsync -avhz --progress -e ssh dist-prod.tar.bz2 ${SSH_USER}@${SSH_HOST}:${DOWNLOAD_PATH}

ssh ${SSH_USER}@${SSH_HOST} "cp -rv $DEPLOY_PATH_1 $DOWNLOAD_PATH/static-old"
ssh ${SSH_USER}@${SSH_HOST} "cd $DEPLOY_PATH_1; rm -rvf *; tar -xjvf $DOWNLOAD_PATH/dist-prod.tar.bz2"
