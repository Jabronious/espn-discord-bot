# ESPN Discord Bot

## Pulling latest changes down

- `git remote add upstream git@github.com:Jabronious/typescript-project.git`  
- `git fetch upstream`  
- `git merge upstream/main --no-commit` OR `git merge upstream{BRANCH_NAME} --no-commit`  

## Deploying Bot

### Required Tooling

- Kubernetes
- Helm
- 1Password Vault for Secrets

### Steps

1. Ensure that your machine is connected to a kubernetes cluster.
2. Run:

```helm
helm upgrade -f ./helm/environments/<env you are running>.values.yaml \
    --install espn-discord-bot-<env label> \
    ./helm
```
