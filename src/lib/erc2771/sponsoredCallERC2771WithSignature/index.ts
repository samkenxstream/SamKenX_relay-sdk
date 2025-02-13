import { post } from "../../../utils";
import { isNetworkSupported } from "../../network";
import {
  ApiKey,
  RelayCall,
  RelayRequestOptions,
  RelayResponse,
} from "../../types";
import { CallWithERC2771Struct, UserAuthSignature } from "../types";

export const sponsoredCallERC2771WithSignature = async (
  struct: CallWithERC2771Struct,
  signature: string,
  sponsorApiKey: string,
  options?: RelayRequestOptions
): Promise<RelayResponse> => {
  try {
    const isSupported = await isNetworkSupported(Number(struct.chainId));
    if (!isSupported) {
      throw new Error(`Chain id [${struct.chainId}] is not supported`);
    }

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
      `GelatoRelaySDK/sponsoredCallERC2771WithSignature: Failed with error: ${errorMessage}`
    );
  }
};
