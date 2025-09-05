import os
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional, List


class Settings(BaseSettings):
    # Database
    database_url: str = Field(default="sqlite:///./ml_project.db", alias="DATABASE_URL")
    
    # Mercado Libre API - OBRIGATÓRIO para OAuth2
    ml_client_id: str = Field(default="", alias="ML_CLIENT_ID")
    ml_client_secret: str = Field(default="", alias="ML_CLIENT_SECRET")
    ml_redirect_uri: str = Field(default="http://localhost:8000/api/oauth/callback", alias="ML_REDIRECT_URI")
    ml_default_country: str = Field(default="MLB", alias="ML_DEFAULT_COUNTRY")
    
    # JWT Configuration
    secret_key: str = Field(default="ml_project_super_secret_key_change_in_production_2024", alias="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Application
    app_base_url: str = Field(default="http://localhost:8000", alias="APP_BASE_URL")
    env: str = Field(default="development", alias="ENV")
    debug: bool = Field(default=True, alias="DEBUG")
    
    # CORS Configuration - Lista de origens permitidas
    frontend_origin: str = Field(default="http://localhost:3000,https://localhost:3000", alias="FRONTEND_ORIGIN")
    
    @property
    def allowed_origins(self) -> List[str]:
        """Retorna lista de origens CORS permitidas."""
        return [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]
    
    # Security Configuration
    enable_rate_limiting: bool = Field(default=True, alias="ENABLE_RATE_LIMITING")
    default_rate_limit: int = Field(default=100, alias="DEFAULT_RATE_LIMIT")
    oauth_rate_limit: int = Field(default=5, alias="OAUTH_RATE_LIMIT")
    
    # Sentry Configuration
    sentry_dsn: Optional[str] = Field(default=None, alias="SENTRY_DSN")
    sentry_environment: str = Field(default="development", alias="SENTRY_ENVIRONMENT")
    sentry_traces_sample_rate: float = Field(default=0.1, alias="SENTRY_TRACES_SAMPLE_RATE")
    
    # Admin User
    admin_email: str = Field(default="admin@mlproject.com", alias="ADMIN_EMAIL")
    admin_password: Optional[str] = Field(default=None, alias="ADMIN_PASSWORD")
    
    # Monitoring Configuration
    metrics_api_key: str = Field(default="ml_metrics_key_2024", alias="METRICS_API_KEY")
    enable_metrics_auth: bool = Field(default=True, alias="ENABLE_METRICS_AUTH")
    
    # Logging Configuration
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    enable_security_logging: bool = Field(default=True, alias="ENABLE_SECURITY_LOGGING")
    enable_audit_logging: bool = Field(default=True, alias="ENABLE_AUDIT_LOGGING")
    
    # Test Configuration
    ml_test_mode: bool = Field(default=True, alias="ML_TEST_MODE")
    create_test_users: bool = Field(default=True, alias="CREATE_TEST_USERS")
    
    # Cache Configuration
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    enable_cache: bool = Field(default=False, alias="ENABLE_CACHE")
    
    # Email Configuration
    email_smtp_host: Optional[str] = Field(default=None, alias="EMAIL_SMTP_HOST")
    email_smtp_port: int = Field(default=587, alias="EMAIL_SMTP_PORT")
    email_smtp_user: Optional[str] = Field(default=None, alias="EMAIL_SMTP_USER")
    email_smtp_password: Optional[str] = Field(default=None, alias="EMAIL_SMTP_PASSWORD")
    email_from: str = Field(default="noreply@mlproject.com", alias="EMAIL_FROM")
    
    # Webhook Configuration
    webhook_secret: str = Field(default="ml_webhook_secret_2024", alias="WEBHOOK_SECRET")
    webhook_url: str = Field(default="http://localhost:8000/api/webhooks/mercadolivre", alias="WEBHOOK_URL")
    
    # SSL/TLS Configuration
    ssl_cert_path: Optional[str] = Field(default=None, alias="SSL_CERT_PATH")
    ssl_key_path: Optional[str] = Field(default=None, alias="SSL_KEY_PATH")
    force_https: bool = Field(default=False, alias="FORCE_HTTPS")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }
    
    def validate_oauth_config(self) -> bool:
        """Valida se configurações OAuth estão completas."""
        required_fields = [self.ml_client_id, self.ml_client_secret, self.ml_redirect_uri]
        return all(field.strip() for field in required_fields)
    
    def is_production(self) -> bool:
        """Verifica se está em ambiente de produção."""
        return self.env.lower() == "production"
    
    def is_development(self) -> bool:
        """Verifica se está em ambiente de desenvolvimento."""
        return self.env.lower() == "development"


# Create a global settings instance
settings = Settings()