import { ethers } from "ethers";

import {
  isWallet,
  populateOptionalUserParameters,
  post,
  signTypedDataV4,
} from "../../../utils";
import { isNetworkSupported } from "../../network";
import {
  ApiKey,
  RelayCall,
  RelayRequestOptions,
  RelayResponse,
} from "../../types";
import {
  CallWithERC2771Request,
  CallWithERC2771RequestOptionalParameters,
  CallWithERC2771Struct,
  ERC2771Type,
  UserAuthSignature,
} from "../types";
import { getPayloadToSign, mapRequestToStruct } from "../utils";

export const relayWithSponsoredCallERC2771 = async (
  request: CallWithERC2771Request,
  walletOrProvider: ethers.providers.Web3Provider | ethers.Wallet,
  sponsorApiKey: string,
  options?: RelayRequestOptions
): Promise<RelayResponse> => {
  return await sponsoredCallERC2771(
    request,
    walletOrProvider,
    sponsorApiKey,
    options
  );
};

const sponsoredCallERC2771 = async (
  request: CallWithERC2771Request,
  walletOrProvider: ethers.providers.Web3Provider | ethers.Wallet,
  sponsorApiKey: string,
  options?: RelayRequestOptions
): Promise<RelayResponse> => {
  try {
    if (!walletOrProvider.provider) {
      throw new Error(`Missing provider`);
    }
    const isSupported = await isNetworkSupported(Number(request.chainId));
    if (!isSupported) {
      throw new Error(`Chain id [${request.chainId}] is not supported`);
    }

    const parametersToOverride = await populateOptionalUserParameters<
      CallWithERC2771Request,
      CallWithERC2771RequestOptionalParameters
    >(request, walletOrProvider);
    const struct = await mapRequestToStruct(request, parametersToOverride);
    const signature = await signTypedDataV4(
      walletOrProvider,
      request.user as string,
      getPayloadToSign(
        struct,
        ERC2771Type.SponsoredCall,
        isWallet(walletOrProvider)
      )
    );

    return await post<
      CallWithERC2771Struct & RelayRequestOptions & UserAuthSignature & ApiKey,
      RelayResponse
    >(RelayCall.SponsoredCallERC2771, {
      ...struct,
      ...options,
      userSignature: signature,
      sponsorApiKey,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    throw new Error(
      `GelatoRelaySDK/sponsoredCallERC2771: Failed with error: ${errorMessage}`
    );
  }
};
