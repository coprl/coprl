require 'base64'

module Coprl
  module Presenters
    module DSL
      module ProtectFromForgery
        include Base64

        AUTHENTICITY_TOKEN_LENGTH = 32

        def authenticity_token_meta_tags(session)
          return unless Presenters::Settings.config.presenters.web_client.protect_from_forgery && session
          [
              '<meta name="csrf-param" content="authenticity_token">',
              "<meta name=\"csrf-token\" content=\"#{form_authenticity_token(session)}\">"
          ].join("\n").html_safe
        end

        def form_authenticity_token(session)
          session[:_csrf_token] ||= SecureRandom.urlsafe_base64(AUTHENTICITY_TOKEN_LENGTH)
          raw_token = get_decoded_csfr_token(session[:_csrf_token])
          one_time_pad = SecureRandom.random_bytes(AUTHENTICITY_TOKEN_LENGTH)
          encrypted_csrf_token = xor_byte_strings(one_time_pad, raw_token)
          masked_token = one_time_pad + encrypted_csrf_token
          Base64.strict_encode64(masked_token)
        end

        def get_decoded_csfr_token(csfr_token)
          # Decode the CSRF token from the session, after Rails 7, this will come in a Base64 URL-safe format,
          # but we need backwards compatibility with older versions.
          begin
            Base64.urlsafe_decode64(csfr_token)
          rescue ArgumentError
            Base64.strict_decode64(csfr_token)
          end
        end


        def xor_byte_strings(s1, s2) # :doc:
          s2 = s2.dup
          size = s1.bytesize
          i = 0
          while i < size
            s2.setbyte(i, s1.getbyte(i) ^ s2.getbyte(i))
            i += 1
          end
          s2
        end

      end
    end
  end
end
