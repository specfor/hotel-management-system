# database.tf

# Create namespace for database
resource "kubernetes_namespace" "database" {
  metadata {
    name = "${var.project_name}-database"

    labels = {
      name        = "${var.project_name}-database"
      environment = var.environment
    }
  }

  depends_on = [aws_eks_cluster.main]
}

# PostgreSQL Secret
resource "kubernetes_secret" "postgres" {
  metadata {
    name      = "postgres-secret"
    namespace = kubernetes_namespace.database.metadata[0].name
  }

  type = "Opaque"

  data = {
    username = base64encode(var.db_username)
    password = base64encode(random_password.db_password.result)
    database = base64encode(var.db_name)
  }

  depends_on = [kubernetes_namespace.database]
}

# PostgreSQL Persistent Volume Claim
resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "postgres-pvc"
    namespace = kubernetes_namespace.database.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "10Gi"
      }
    }

    storage_class_name = "gp2"
  }

  depends_on = [
    kubernetes_namespace.database,
    aws_eks_addon.ebs_csi_driver # Wait for EBS CSI driver
  ]
}

# PostgreSQL ConfigMap
resource "kubernetes_config_map" "postgres" {
  metadata {
    name      = "postgres-config"
    namespace = kubernetes_namespace.database.metadata[0].name
  }

  data = {
    POSTGRES_DB   = var.db_name
    POSTGRES_USER = var.db_username
    PGDATA        = "/var/lib/postgresql/data/pgdata"
  }

  depends_on = [kubernetes_namespace.database]
}

# PostgreSQL Deployment
resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.database.metadata[0].name

    labels = {
      app = "postgres"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          image = "postgres:15-alpine"
          name  = "postgres"

          port {
            container_port = 5432
            name           = "postgres"
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.postgres.metadata[0].name
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.postgres.metadata[0].name
                key  = "password"
              }
            }
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "250m"
              memory = "512Mi"
            }
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_username, "-d", var.db_name]
            }
            initial_delay_seconds = 30
            timeout_seconds       = 5
            period_seconds        = 10
            failure_threshold     = 3
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_username, "-d", var.db_name]
            }
            initial_delay_seconds = 5
            timeout_seconds       = 1
            period_seconds        = 10
            failure_threshold     = 3
          }
        }

        volume {
          name = "postgres-storage"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }

        security_context {
          run_as_user = 999
          fs_group    = 999
        }
      }
    }
  }

  depends_on = [
    kubernetes_namespace.database,
    kubernetes_secret.postgres,
    kubernetes_config_map.postgres,
    kubernetes_persistent_volume_claim.postgres
  ]
}

# PostgreSQL Service
resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres-service"
    namespace = kubernetes_namespace.database.metadata[0].name

    labels = {
      app = "postgres"
    }
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      name        = "postgres"
      port        = 5432
      target_port = 5432
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }

  depends_on = [kubernetes_deployment.postgres]
}