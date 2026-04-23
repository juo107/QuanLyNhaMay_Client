import axiosClient from './axiosClient';

export interface IMESCompleteBatchParams {
  page: number;
  limit: number;
  searchQuery?: string;
  productionOrder?: string;
  batchNumber?: string;
  machineCode?: string;
  dateFrom?: string;
  dateTo?: string;
  transferStatus?: string;
}

export interface IMESCompleteBatch {
  id: number;
  productionOrder: string;
  batchNumber: string;
  batchSize: number;
  batchUOM: string;
  productCode: string;
  productName: string;
  machineCode: string;
  startTime: string;
  endTime: string;
  transferStatus: string;
  retryCount: number;
  nextRetryAt: string;
  processingAt: string;
  requestJson: string;
  responseContent: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMESCompleteBatchResponse {
  total: number;
  page: number;
  limit: number;
  data: IMESCompleteBatch[];
}

export const mesCompleteBatchApi = {
  async search(params: IMESCompleteBatchParams): Promise<IMESCompleteBatchResponse> {
    return await axiosClient.get('/mes-complete-batch/search', { params });
  },
  async getUniqueValues(column: string): Promise<string[]> {
    return await axiosClient.get('/mes-complete-batch/unique-values', { params: { column } });
  },
};
