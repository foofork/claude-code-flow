/**
 * Enterprise-specific type definitions
 */

export interface EnterpriseDeploymentConfig {
  region: string;
  provider: "custom" | "aws" | "gcp" | "azure" | "kubernetes" | "docker";
  endpoints: string[];
  secrets: Record<string, string>;
  environment_variables: Record<string, string>;
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

export interface CloudInfrastructureConfig {
  defaultRegion: string;
  availableRegions: string[];
  services: string[];
  endpoints: Record<string, string>;
  features: string[];
}

export type ReportType = "custom" | "security" | "business" | "technical" | "operational" | "executive";
export type ModelType = "regression" | "classification" | "time-series" | "anomaly-detection";
export type EventType = "security" | "data-access" | "compliance" | "business" | "authentication" | "authorization" | "system-change";
export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type ResultType = "success" | "partial" | "failure" | "denied";
export type AuditReportType = "custom" | "security" | "financial" | "compliance" | "investigation" | "operational";
export type ExportFormat = "json" | "pdf" | "csv" | "xml";

export interface AuditReportRequest {
  timeRange: {
    start: Date;
    end: Date;
  };
  systems: string[];
  users: string[];
  events: string[];
  compliance: string[];
}

// Extend TaskDefinition interface
declare module '../swarm/types' {
  interface TaskDefinition {
    metadata?: Record<string, any>;
  }
}