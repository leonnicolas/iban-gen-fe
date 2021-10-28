/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BIC } from "../models/BIC";
import type { Error } from "../models/Error";
import type { IBANGeneration } from "../models/IBANGeneration";
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class Service {
  /**
   * Generate an iban.
   * Return a generated iban.
   * @param bic The BIC to use for generation.
   * @param bankCode The bank code to use for generation.
   * @param countryCode The country code to use.
   * @returns IBANGeneration Information about a specific bank.
   * @returns Error An error response.
   * @throws ApiError
   */
  public static random(
    bic?: string,
    bankCode?: string,
    countryCode?: string
  ): CancelablePromise<IBANGeneration | Error> {
    return __request({
      method: "GET",
      path: `/v1/random`,
      query: {
        bic: bic,
        bankCode: bankCode,
        countryCode: countryCode,
      },
    });
  }

  /**
   * The by the generator supported BICs.
   * The supported BICs.
   * @param countryCode Return only BICs for the country code.
   * @returns BIC Validation information for the given IBAN.
   * @returns Error An error response.
   * @throws ApiError
   */
  public static bics(
    countryCode?: string
  ): CancelablePromise<Array<BIC> | Error> {
    return __request({
      method: "GET",
      path: `/v1/bics`,
      query: {
        countryCode: countryCode,
      },
    });
  }

  /**
   * The by the generator country codes.
   * The supported country codes.
   * @returns string The by the generator supported country codes.
   * @returns Error An error response.
   * @throws ApiError
   */
  public static countryCodes(): CancelablePromise<Array<string> | Error> {
    return __request({
      method: "GET",
      path: `/v1/countryCodes`,
    });
  }
}
