#!/usr/bin/env bash

cd ..
pwd

ng b -prod --aot=false

cd dist && aws s3 cp . s3://worldchess-new/ --recursive --include "*" --acl public-read --cache-control public,max-age=31536000,no-transform

aws cloudfront create-invalidation --distribution-id ED1Z6HQY6VASB --paths /index.html
