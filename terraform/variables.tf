variable "prefix" {
  description = "Descriptive name for your resources"
}

variable "location" {
  description = "Location the cluster will be located in"
  default     = "eastus"
  validation {
    condition     = !contains(["eastus2", "westus"], var.location)
    error_message = "Cannot use eastus2 or westus for location as they are fallbacks"
  }
}

variable "tags" {
  description = "Tags for your resources"
  default = {
    type = "db"
  }
}
