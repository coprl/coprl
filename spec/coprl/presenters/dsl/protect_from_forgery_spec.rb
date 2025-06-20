require "spec_helper"

describe Coprl::Presenters::DSL::ProtectFromForgery do
  include Coprl::Presenters::DSL::ProtectFromForgery

  describe "#get_decoded_csfr_token" do
    context "when the CSRF token is in Base64 URL-safe format" do
      it "decodes the token correctly" do
        encoded = SecureRandom.urlsafe_base64(32)
        decoded_token = Base64.urlsafe_decode64(encoded)
        expect(get_decoded_csfr_token(encoded)).to eq(decoded_token)
      end
    end

    context "when the CSRF token is in Base64 strict format" do
      it "decodes the token correctly" do
        encoded_token = SecureRandom.base64(32)
        decoded_token = Base64.strict_decode64(encoded_token)
        expect(get_decoded_csfr_token(encoded_token)).to eq(decoded_token)
      end
    end
  end
end