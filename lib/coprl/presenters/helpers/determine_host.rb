module Coprl
  module Presenters
    module Helpers
      module DetermineHost
        def determine_host(host, default:)
          case host
          when true
            default
          when false
            nil
          else
            host
          end
        end
      end
    end
  end
end
