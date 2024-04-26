RESOURCE_GROUP_NAME=$1
STORAGE_ACCOUNT_NAME=$2

ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query '[0].value' -o tsv)
echo The Account Key: $ACCOUNT_KEY
export ARM_ACCESS_KEY=$ACCOUNT_KEY