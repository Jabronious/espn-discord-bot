
provider "azurerm" {
  features {}
}

terraform {
  backend "azurerm" {
    storage_account_name = "tfstate25201"
    container_name       = "tfstate"
    key                  = "cosmos-db.tfstate"
  }
}

resource "azurerm_resource_group" "default" {
  name     = "${var.prefix}-cosmos-rg"
  location = var.location

  tags = var.tags
}

resource "random_integer" "ri" {
  min = 10000
  max = 99999
}

resource "azurerm_cosmosdb_account" "db" {
  name                      = "cosmos-db-${random_integer.ri.result}"
  location                  = azurerm_resource_group.default.location
  resource_group_name       = azurerm_resource_group.default.name
  offer_type                = "Standard"
  kind                      = "MongoDB"
  enable_free_tier          = true
  enable_automatic_failover = false

  capabilities {
    name = "EnableAggregationPipeline"
  }

  capabilities {
    name = "mongoEnableDocLevelTTL"
  }

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

  geo_location {
    location          = "eastus2"
    failover_priority = 0
  }
}
