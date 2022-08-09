# ESPN Discord Bot

## Pulling latest changes down

- `git remote add upstream git@github.com:Jabronious/typescript-project.git`  
- `git fetch upstream`  
- `git merge upstream/main --no-commit` OR `git merge upstream{BRANCH_NAME} --no-commit`  

1. Set up k8s cluster
2. create namespace
3. add docker regcred secret to namespace
    - `kubectl create secret -n espn-discord-bot-develop docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=<username> --docker-password=<password> --docker-email=<emailk>`
4. generate discord api creds add them to env vars and run create-secrets script
