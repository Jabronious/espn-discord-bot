#!/bin/bash

kubectl create secret generic fbb-bot-secrets -n espn-discord-bot-develop \                                          system ⎈ espn-discord-bot-aks-admin  08:30:54
--from-literal=fbb-bot-secret=$FBB_BOT_SECRET_DEV \
--from-literal=fbb-bot-client-id=$FBB_BOT_CLIENT_ID_DEV \
--from-literal=fbb-bot-token=$FBB_BOT_TOKEN_DEV

kubectl describe secrets/fbb-bot-secrets -n espn-discord-bot-develop

kubectl create secret generic fbb-bot-secrets -n espn-discord-bot \                                          system ⎈ espn-discord-bot-aks-admin  08:30:54
--from-literal=fbb-bot-secret=$FBB_BOT_SECRET_PROD \
--from-literal=fbb-bot-client-id=$FBB_BOT_CLIENT_ID_PROD \
--from-literal=fbb-bot-token=$FBB_BOT_TOKEN_PROD

kubectl describe secrets/fbb-bot-secrets -n espn-discord-bot-develop