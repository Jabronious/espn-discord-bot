#!/bin/bash

kubectl create secret generic fbb-bot-secrets -n espn-discord-bot-develop \                                          system ⎈ espn-discord-bot-aks-admin  08:30:54
--from-literal=fbb-bot-secret=$FBB_BOT_SECRET \
--from-literal=fbb-bot-client-id=$FBB_BOT_CLIENT_ID \
--from-literal=fbb-bot-token=$FBB_BOT_TOKEN

kubectl describe secrets/fbb-bot-secrets -n espn-discord-bot-develop