import { base44 } from './base44Client';
import type { IntegrationsPackage, IntegrationEndpoint } from '@base44/sdk';




export const Core: IntegrationsPackage = base44.integrations.Core;

export const InvokeLLM: IntegrationEndpoint =
  base44.integrations.Core.InvokeLLM;

export const SendEmail: IntegrationEndpoint =
  base44.integrations.Core.SendEmail;

export const UploadFile: IntegrationEndpoint =
  base44.integrations.Core.UploadFile;

export const GenerateImage: IntegrationEndpoint =
  base44.integrations.Core.GenerateImage;

export const ExtractDataFromUploadedFile: IntegrationEndpoint =
  base44.integrations.Core.ExtractDataFromUploadedFile;






