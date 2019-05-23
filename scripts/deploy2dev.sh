#!/usr/bin/env bash

SSH_HOST=wchess.dev39.ru
SSH_USER=wchess
SSH_PARM="-p 7822"
DEPLOY_PATH_1=/opt/webapps/worldchess/static
DOWNLOAD_PATH=/home/wchess/deploys/worldchess-fe/${TIMESTAMP}

cd ..
pwd

ng b --env=dev
cd dist/ && tar -cvjf ../dist-dev.tar.bz2 . && cd -

ssh ${SSH_USER}@${SSH_HOST} ${SSH_PARM} "mkdir -p $DOWNLOAD_PATH"

rsync -avhz --progress -e "ssh  $SSH_PARM" dist-dev.tar.bz2 ${SSH_USER}@${SSH_HOST}:${DOWNLOAD_PATH}

ssh ${SSH_USER}@${SSH_HOST} ${SSH_PARM} "cp -rv $DEPLOY_PATH_1 $DOWNLOAD_PATH/static-old"
ssh ${SSH_USER}@${SSH_HOST} ${SSH_PARM} "cd $DEPLOY_PATH_1; rm -rvf *; tar -xjvf $DOWNLOAD_PATH/dist-dev.tar.bz2"
