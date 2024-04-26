#!/bin/bash

eval $(op signin)
OP_CONNECT_TOKEN="$(op item get K8_ACCESS_TOKEN --fields label=credential)"
RELEASE_NAME=$(jq -r '.name' package.json)-release
NAMESPACE=$(jq -r '.name' package.json)-develop
ENCODED_OP_CONNECT_TOKEN=$(echo "$(echo -n $OP_CONNECT_TOKEN | base64)")
FILE_NAME="secret-plans.json"

op document get "CRED_FILE" --output=./$FILE_NAME

helm repo add 1password https://1password.github.io/connect-helm-charts
helm repo update

helm upgrade --install connect 1password/connect \
	--set-file connect.credentials=./$FILE_NAME \
	--set operator.create=true \
	--set operator.token.value="${OP_CONNECT_TOKEN}" \
	--wait

rm ./$FILE_NAME

helm upgrade --install $RELEASE_NAME helm
