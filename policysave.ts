"use server";

import { useMutation } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import api from "@/lib/network/api";
import { ApiError, ApiResponse } from "@/lib/network/axios";
import {
  PolicyDirectCoinsuranceData,
  PolicyDirectCoinsuranceResponse,
  PolicyDirectData,
  PolicyDirectQuoteCoinsuranceData,
  PolicyDirectQuoteCoinsuranceResponse,
  PolicyDirectQuoteData,
  PolicyDirectQuoteResponse,
  PolicyDirectResponse,
  PolicyInwardData,
  PolicyInwardResponse,
} from "@/lib/types/underwriting";

const moduleUrl =
  "https://emple-general-reinsurance-service.dev.inemple.ng/v1/policy";

export const createPolicyInward = async (
  payload: PolicyInwardData
): Promise<ApiResponse<PolicyInwardResponse>> => {
  const response = await api.post<PolicyInwardResponse>(
    `${moduleUrl}/inward/coinsurance`,
    payload
  );
  return response;
};

export const createPolicyDirectQuoteCoinsurance = async (
  payload: PolicyDirectQuoteCoinsuranceData
): Promise<ApiResponse<PolicyDirectQuoteCoinsuranceResponse>> => {
  const response = await api.post<PolicyDirectQuoteCoinsuranceResponse>(
    `${moduleUrl}/inward/coinsurance`,
    payload
  );

  return response;
};

export const createPolicyDirectQuote = async (
  payload: PolicyDirectQuoteData
): Promise<ApiResponse<PolicyDirectQuoteResponse>> => {
  const response = await api.post<PolicyDirectQuoteResponse>(
    `${moduleUrl}/direct/quote`,
    payload
  );

  return response;
};

export const createPolicyDirect = async (
  payload: PolicyDirectData
): Promise<ApiResponse<PolicyDirectResponse>> => {
  const response = await api.post<PolicyDirectResponse>(
    `${moduleUrl}/direct`,
    payload
  );

  return response;
};

export const createPolicyDirectCoinsurance = async (
  payload: PolicyDirectCoinsuranceData
): Promise<ApiResponse<PolicyDirectCoinsuranceResponse>> => {
  const response = await api.post<PolicyDirectCoinsuranceResponse>(
    `${moduleUrl}/direct/coinsurance`,
    payload
  );

  return response;
};

// Hooks

export const useCreatePolicyDirectQuoteCoinsurance = () => {
  const { toast } = useToast();

  return useMutation<
    ApiResponse<PolicyDirectQuoteCoinsuranceResponse>,
    ApiError,
    PolicyDirectQuoteCoinsuranceData
  >({
    mutationFn: (payload: PolicyDirectQuoteCoinsuranceData) =>
      createPolicyDirectQuoteCoinsurance(payload),
    mutationKey: ["create-policy-direct-quote-coinsurance"],
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.data.message,
      });
    },

    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useCreatePolicyDirectQuote = () => {
  const { toast } = useToast();
  return useMutation<
    ApiResponse<PolicyDirectQuoteResponse>,
    ApiError,
    PolicyDirectQuoteData
  >({
    mutationFn: (payload: PolicyDirectQuoteData) =>
      createPolicyDirectQuote(payload),
    mutationKey: ["create-policy-direct-quote"],
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.data.message,
      });
    },

    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useCreatePolicyDirect = () => {
  const { toast } = useToast();
  return useMutation<
    ApiResponse<PolicyDirectResponse>,
    ApiError,
    PolicyDirectData
  >({
    mutationFn: (payload: PolicyDirectData) => createPolicyDirect(payload),
    mutationKey: ["create-policy-direct"],
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.data.message,
      });
    },

    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useCreatePolicyDirectCoinsurance = () => {
  const { toast } = useToast();
  return useMutation<
    ApiResponse<PolicyDirectCoinsuranceResponse>,
    ApiError,
    PolicyDirectCoinsuranceData
  >({
    mutationFn: (payload: PolicyDirectCoinsuranceData) =>
      createPolicyDirectCoinsurance(payload),
    mutationKey: ["create-policy-direct-coinsurance"],
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.data.message,
      });
    },

    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });
};

("use server");

import { useMutation } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import api from "@/lib/network/api";
import { ApiError, ApiResponse } from "@/lib/network/axios";
import {
  PolicyDocumentData,
  PolicyDocumentResponse,
} from "@/lib/types/underwriting";

const moduleUrl =
  "https://emple-general-reinsurance-service.dev.inemple.ng/v1/policy/document";

const createPolicyDocument = async <TData, TResponse>(
  url: string,
  payload: TData
): Promise<ApiResponse<TResponse>> => {
  return await api.post<TResponse>(url, payload);
};

const usePolicyDocumentToast = () => {
  const { toast } = useToast();
  return {
    showSuccess: (message: string) => {
      toast({ title: "Success", description: message });
    },
    showError: (message: string) => {
      toast({ title: "Error", description: message });
    },
  };
};

// Reusable create hook
const useCreateDocument = <TData, TResponse>(url: string) => {
  const { showSuccess, showError } = usePolicyDocumentToast();

  return useMutation<ApiResponse<TResponse>, ApiError, TData>({
    mutationFn: (payload: TData) =>
      createPolicyDocument<TData, TResponse>(url, payload),
    onSuccess: (response) => {
      showSuccess(response.data.message);
    },
    onError: (error: ApiError) => {
      showError(error.message);
    },
  });
};

// Hooks
export const useCreatePolicyDocument = () =>
  useCreateDocument<PolicyDocumentData, PolicyDocumentResponse>(
    `${moduleUrl}/create`
  );
